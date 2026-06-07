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
    if (!this.config.isActive) return false;
    
    console.log(`[TwilioAdapter] Sending SMS to ${message.to} for studio ${this.studioId}`);
    // Twilio SDK logic goes here...
    // const client = twilio(this.config.credentials.accountSid, this.config.credentials.authToken);
    // await client.messages.create({...});

    return true;
  }
}
