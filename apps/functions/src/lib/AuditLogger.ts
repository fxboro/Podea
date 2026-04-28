import * as admin from 'firebase-admin';

export class AuditLogger {
  /**
   * Logs an immutable audit event to a studio's audit_logs collection.
   */
  static async logEvent(
    studioId: string,
    action: string,
    payload: Record<string, any>
  ): Promise<void> {
    if (!studioId) {
      console.warn('AuditLogger: Missing studioId, skipping log.', action);
      return;
    }

    try {
      await admin.firestore().collection(`studios/${studioId}/audit_logs`).add({
        action,
        ...payload,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`AuditLogger: Failed to write audit log for studio ${studioId}:`, error);
    }
  }
}
