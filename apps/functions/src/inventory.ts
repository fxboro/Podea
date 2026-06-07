import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { ProductSchema, InventoryLogSchema } from '@podea/shared-types/schemas';
import { Product } from '@podea/shared-types/interfaces';

const db = getFirestore();

/**
 * Monitors inventory changes and checks for low stock.
 */
export const checkLowStockAlerts = onDocumentWritten('studios/{studioId}/products/{productId}', async (event) => {
  const afterData = event.data?.after?.data();
  if (!afterData) return; // Deleted

  const productValidation = ProductSchema.safeParse({ id: event.data?.after?.id, ...afterData });
  if (!productValidation.success) {
    logger.warn(`Invalid product data for ${event.data?.after?.id}`, productValidation.error);
    return;
  }

  const product = productValidation.data as Product;
  
  if (product.reorderPoint !== undefined && product.stockLevel <= product.reorderPoint) {
    logger.info(`Low stock alert triggered for product: ${product.name} (SKU: ${product.sku}). Current stock: ${product.stockLevel}, Reorder point: ${product.reorderPoint}`);
    
    // Here we would typically:
    // 1. Create a notification document in Firestore for studio admins
    // 2. Send an email alert if configured
    // 3. Or push to a Slack/Teams webhook
    
    const notificationRef = db.collection('studios').doc(event.params.studioId).collection('notifications').doc();
    await notificationRef.set({
      title: 'Low Stock Alert',
      message: `${product.name} is running low (${product.stockLevel} remaining). Reorder recommended.`,
      type: 'inventory_alert',
      productId: product.id,
      createdAt: new Date(),
      read: false
    });
  }
});

/**
 * Automatically deducts consumable stock when an appointment is completed.
 */
export const handleServiceConsumables = onDocumentWritten('studios/{studioId}/appointments/{appointmentId}', async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();

  // Only trigger when status changes to 'completed'
  if (beforeData?.status !== 'completed' && afterData?.status === 'completed') {
    const serviceId = afterData.serviceId;
    if (!serviceId) return;

    const studioId = event.params.studioId;
    const serviceDoc = await db.collection('studios').doc(studioId).collection('services').doc(serviceId).get();
    
    if (!serviceDoc.exists) return;
    
    const service = serviceDoc.data();
    if (!service?.consumableProductIds || service.consumableProductIds.length === 0) return;

    logger.info(`Appointment ${event.params.appointmentId} completed. Deducting consumables for service: ${service.name}`);

    // Deduct stock for each linked consumable
    const batch = db.batch();
    for (const consumable of service.consumableProductIds) {
      const productRef = db.collection('studios').doc(studioId).collection('products').doc(consumable.productId);
      const productDoc = await productRef.get();
      
      if (productDoc.exists) {
        const productData = productDoc.data() as Product;
        const newStock = Math.max(0, productData.stockLevel - consumable.quantity);
        
        batch.update(productRef, { stockLevel: newStock, updatedAt: new Date() });
        
        // Create Inventory Log
        const logRef = db.collection('studios').doc(studioId).collection('inventoryLogs').doc();
        batch.set(logRef, {
          productId: consumable.productId,
          changeAmount: -consumable.quantity,
          previousStock: productData.stockLevel,
          newStock: newStock,
          reason: 'sale',
          userId: afterData.staffId || 'system',
          timestamp: new Date()
        });
      }
    }
    
    await batch.commit();
    logger.info(`Consumables deducted successfully for appointment ${event.params.appointmentId}`);
  }
});
