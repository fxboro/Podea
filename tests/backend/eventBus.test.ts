import * as admin from 'firebase-admin';
import { EventBus } from '../../apps/functions/src/integrations/core/EventBus';

// Mock dependencies
jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue({ id: 'mocked_doc_id' }),
  };
  return {
    firestore: jest.fn(() => firestoreMock),
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  };
});

describe('EventBus Integration Tests', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus('test_studio_123');
    jest.clearAllMocks();
  });

  it('should successfully publish an APPOINTMENT_CREATED event to Firestore', async () => {
    const payload = { 
      appointmentId: 'app_1', 
      clientId: 'client_1', 
      time: '2026-05-10T10:00:00Z' 
    };

    await eventBus.publish('APPOINTMENT_CREATED', payload);

    const db = admin.firestore();
    expect(db.collection).toHaveBeenCalledWith('studios/test_studio_123/integration_events');
    expect(db.add).toHaveBeenCalledWith(expect.objectContaining({
      type: 'APPOINTMENT_CREATED',
      payload: payload,
      status: 'pending'
    }));
  });
});
