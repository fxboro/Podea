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
   * Dispatch an event to all subscribers asynchronously with built-in retries.
   */
  public async dispatch(event: PodeaEvent): Promise<void> {
    console.log(`[EventBus] Dispatching event: ${event.type} for studio: ${event.studioId}`);
    console.log(`[EventBus] Payload: ${JSON.stringify(event.payload, null, 2)}`);
    
    const currentHandlers = this.handlers.get(event.type) || [];
    
    const promises = currentHandlers.map(handler => 
      this.executeWithRetry(handler, event, 3, 500)
    );

    await Promise.all(promises);
  }

  /**
   * Helper function to execute handler with exponential backoff retries.
   */
  private async executeWithRetry(handler: EventHandler, event: PodeaEvent, retriesRemaining: number, delayMs: number): Promise<void> {
    try {
      await handler(event);
    } catch (err) {
      if (retriesRemaining > 0) {
        console.warn(`[EventBus] Handler failed for event ${event.type}. Retries remaining: ${retriesRemaining}. Retrying in ${delayMs}ms... Error:`, err);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        await this.executeWithRetry(handler, event, retriesRemaining - 1, delayMs * 2);
      } else {
        console.error(`[EventBus] Handler failed completely for event ${event.type}. No retries left. Error:`, err);
      }
    }
  }
}

// Singleton instance for the functions runtime
export const eventBus = new EventBus();
