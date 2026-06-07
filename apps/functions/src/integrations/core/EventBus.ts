export interface PodeaEvent<T = any> {
  id: string;
  type: string;
  studioId: string;
  timestamp: Date;
  payload: T;
}

export type EventHandler = (event: PodeaEvent) => Promise<void>;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe an integration adapter or service to an event.
   */
  public subscribe(eventType: string, handler: EventHandler): void {
    const currentHandlers = this.handlers.get(eventType) || [];
    currentHandlers.push(handler);
    this.handlers.set(eventType, currentHandlers);
  }

  /**
   * Dispatch an event to all subscribers asynchronously.
   */
  public async dispatch(event: PodeaEvent): Promise<void> {
    console.log(`[EventBus] Dispatching event: ${event.type} for studio: ${event.studioId}`);
    
    const currentHandlers = this.handlers.get(event.type) || [];
    
    // In a production distributed environment, we would publish this to Google Cloud Pub/Sub.
    // For this architecture, we dispatch to in-memory handlers which act as the bridge.
    const promises = currentHandlers.map(handler => 
      handler(event).catch(err => {
        console.error(`[EventBus] Error handling event ${event.type}:`, err);
        // Here we could implement DLQ (Dead Letter Queue) or retry logic
      })
    );

    await Promise.all(promises);
  }
}

// Singleton instance for the functions runtime
export const eventBus = new EventBus();
