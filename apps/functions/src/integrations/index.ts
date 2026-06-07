import * as functions from 'firebase-functions';
import { eventBus, PodeaEvent } from './core/EventBus';
import { TwilioAdapter } from './adapters/SmsAdapter';
import { GoogleCalendarAdapter } from './adapters/CalendarAdapter';
import { LexofficeAdapter } from './adapters/AccountingAdapter';

// Integration Layer Registry
export const integrationRegistry = {
  EventBus: eventBus,
  Adapters: {
    Twilio: TwilioAdapter,
    GoogleCalendar: GoogleCalendarAdapter,
    Lexoffice: LexofficeAdapter
  }
};

/**
 * Example: Subscribing an adapter to an internal domain event.
 * When an appointment is created, we sync it to Google Calendar and send an SMS.
 */
eventBus.subscribe('APPOINTMENT_CREATED', async (event: PodeaEvent) => {
  // In reality, config would be fetched securely from Firestore/SecretManager using event.studioId
  const calendarAdapter = new GoogleCalendarAdapter({
    studioId: event.studioId,
    isActive: true,
    credentials: { accessToken: 'mock', refreshToken: 'mock' }
  });

  const smsAdapter = new TwilioAdapter({
    studioId: event.studioId,
    isActive: true,
    credentials: { accountSid: 'mock', authToken: 'mock' }
  });

  const { clientPhone, appointmentStart, appointmentEnd, serviceName } = event.payload;

  await Promise.all([
    calendarAdapter.createEvent({
      title: `Podea: ${serviceName}`,
      startTime: new Date(appointmentStart),
      endTime: new Date(appointmentEnd)
    }),
    smsAdapter.sendSms({
      to: clientPhone,
      body: `Your appointment for ${serviceName} is confirmed for ${new Date(appointmentStart).toLocaleString()}.`
    })
  ]);
});

/**
 * Webhook Handler Endpoint
 * This endpoint allows external systems (e.g., Stripe, Calendar APIs) to push events into Podea.
 * We normalize the incoming external payload into a standard `PodeaEvent` and dispatch it.
 */
export const handleExternalWebhook = functions.https.onRequest(async (req, res) => {
  const provider = req.query.provider as string; // e.g., 'stripe', 'lexoffice'
  const payload = req.body;

  try {
    // Adapter Pattern: Normalization step based on external provider format
    let eventType = 'UNKNOWN_WEBHOOK';
    let normalizedPayload = {};

    if (provider === 'stripe' && payload.type === 'invoice.payment_succeeded') {
      eventType = 'EXTERNAL_PAYMENT_RECEIVED';
      normalizedPayload = {
        amount: payload.data.object.amount_paid,
        invoiceId: payload.data.object.metadata.internalInvoiceId
      };
    }

    // Wrap in standard PodeaEvent
    const internalEvent: PodeaEvent = {
      id: `evt_${Date.now()}`,
      type: eventType,
      studioId: payload.data?.object?.metadata?.studioId || 'global',
      timestamp: new Date(),
      payload: normalizedPayload
    };

    // Dispatch to internal systems
    await eventBus.dispatch(internalEvent);

    res.status(200).send({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook processing failed');
  }
});
