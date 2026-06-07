export interface IntegrationConfig {
  studioId: string;
  isActive: boolean;
  credentials: Record<string, string>;
}

export abstract class IntegrationAdapter {
  protected studioId: string;
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.studioId = config.studioId;
    this.config = config;
  }

  /**
   * Initializes the adapter and verifies credentials.
   */
  abstract initialize(): Promise<boolean>;

  /**
   * Identifies the provider name (e.g., 'Twilio', 'GoogleCalendar')
   */
  abstract get providerName(): string;
}
