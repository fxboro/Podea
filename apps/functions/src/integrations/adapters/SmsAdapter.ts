import { IntegrationAdapter } from '../core/IntegrationAdapter';

export interface SmsMessage {
  to: string;
  body: string;
}

export abstract class SmsAdapter extends IntegrationAdapter {
  abstract sendSms(message: SmsMessage): Promise<boolean>;
}

export class TwilioAdapter extends SmsAdapter {
  get providerName(): string {
    return 'Twilio';
  }

  async initialize(): Promise<boolean> {
    // Validate Twilio credentials (Account SID, Auth Token)
    return !!this.config.credentials.accountSid && !!this.config.credentials.authToken;
  }

  async sendSms(message: SmsMessage): Promise<boolean> {
    if (!this.config.isActive) {
      console.warn(`[TwilioAdapter] Twilio is disabled for studio ${this.studioId}`);
      return false;
    }

    // Phone number format validation
    const cleanNumber = message.to.trim();
    if (!cleanNumber.startsWith('+') && cleanNumber.length < 10) {
      throw new Error(`[TwilioAdapter] Invalid phone number formatting: ${message.to}. Must start with international prefix.`);
    }

    if (!message.body || message.body.length === 0) {
      throw new Error(`[TwilioAdapter] SMS message body cannot be empty.`);
    }
    
    console.log(`[TwilioAdapter] Sending SMS to ${cleanNumber} for studio ${this.studioId}. Content: "${message.body}"`);
    // Twilio SDK execution simulation
    return true;
  }
}
