import { IntegrationAdapter } from '../core/IntegrationAdapter';

export interface InvoicePayload {
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  date: Date;
  lineItems: Array<{ description: string; price: number; vatRate: number }>;
}

export abstract class AccountingAdapter extends IntegrationAdapter {
  abstract createInvoice(invoice: InvoicePayload): Promise<string>;
  abstract syncPayment(externalInvoiceId: string, amountPaid: number, method: string): Promise<boolean>;
}

export class LexofficeAdapter extends AccountingAdapter {
  get providerName(): string {
    return 'Lexoffice';
  }

  async initialize(): Promise<boolean> {
    return !!this.config.credentials.apiKey;
  }

  async createInvoice(invoice: InvoicePayload): Promise<string> {
    if (!this.config.isActive) return '';
    console.log(`[LexofficeAdapter] Pushing invoice for ${invoice.clientName} to Lexoffice. Amount: ${invoice.amount} ${invoice.currency}`);
    
    // Lexoffice REST API logic goes here...
    return `lex_inv_${Date.now()}`;
  }

  async syncPayment(externalInvoiceId: string, amountPaid: number, method: string): Promise<boolean> {
    console.log(`[LexofficeAdapter] Syncing payment of ${amountPaid} to invoice ${externalInvoiceId} via ${method}`);
    return true;
  }
}
