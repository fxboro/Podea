import React, { useState } from 'react';
import { Button, Card, Input } from '@podea/ui';
import type { Product } from '@podea/shared-types/interfaces';

export const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Massage Oil', sku: 'MO-01', price: 0, stockLevel: 10, reorderPoint: 15, status: 'active', vatRate: 19, type: 'consumable' },
    { id: '2', name: 'Premium Face Cream', sku: 'PFC-01', price: 49.99, stockLevel: 25, reorderPoint: 5, status: 'active', vatRate: 19, type: 'retail' }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const handleSave = () => {
    setProducts([...products, { ...formData, id: Date.now().toString(), status: 'active' } as Product]);
    setShowForm(false);
    setFormData({});
  };

  const getStockStatusColor = (stock: number, reorderPoint?: number) => {
    if (!reorderPoint) return 'var(--color-primary)';
    if (stock <= 0) return '#EF4444'; // Red
    if (stock <= reorderPoint) return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="font-serif" style={{ margin: 0 }}>Products & Inventory</h1>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Product</Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-serif" style={{ marginTop: 0 }}>Create/Edit Product</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Input 
                label="Product Name" 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
              <Input 
                label="SKU" 
                value={formData.sku || ''} 
                onChange={(e) => setFormData({...formData, sku: e.target.value})} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Type</label>
                <select 
                  style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                  value={formData.type || 'retail'}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'retail' | 'consumable'})}
                >
                  <option value="retail">Retail Product</option>
                  <option value="consumable">Consumable (Backbar)</option>
                </select>
              </div>
              <Input 
                label="Retail Price" 
                type="number"
                value={formData.price?.toString() || ''} 
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
              />
              <Input 
                label="VAT Rate (%)" 
                type="number"
                value={formData.vatRate?.toString() || ''} 
                onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value)})} 
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Input 
                label="Current Stock" 
                type="number"
                value={formData.stockLevel?.toString() || ''} 
                onChange={(e) => setFormData({...formData, stockLevel: parseInt(e.target.value)})} 
              />
              <Input 
                label="Low Stock Alert Level" 
                type="number"
                value={formData.reorderPoint?.toString() || ''} 
                onChange={(e) => setFormData({...formData, reorderPoint: parseInt(e.target.value)})} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="primary" onClick={handleSave}>Save Product</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {!showForm && (
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {products.length === 0 ? (
            <p style={{ color: 'var(--color-primary-muted)' }}>No products in inventory.</p>
          ) : (
            products.map(product => {
              const isLowStock = product.reorderPoint && product.stockLevel <= product.reorderPoint;
              
              return (
                <Card key={product.id} style={{ borderLeft: isLowStock ? '4px solid #F59E0B' : '4px solid transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: '0 0 4px' }}>{product.name}</h3>
                        <span style={{ fontSize: '12px', padding: '2px 6px', background: '#F3F4F6', borderRadius: '4px', color: '#4B5563' }}>
                          {product.type === 'consumable' ? 'Consumable' : 'Retail'}
                        </span>
                        {isLowStock && (
                          <span style={{ fontSize: '12px', padding: '2px 6px', background: '#FEF3C7', color: '#D97706', borderRadius: '4px', fontWeight: 500 }}>
                            Low Stock Alert
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-primary-muted)', fontSize: '14px' }}>
                        SKU: {product.sku} • Price: ${product.price} • VAT: {product.vatRate || 0}%
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: getStockStatusColor(product.stockLevel, product.reorderPoint) }}>
                          {product.stockLevel}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-primary-muted)' }}>in stock</div>
                      </div>
                      <Button variant="secondary" onClick={() => {
                        setFormData(product);
                        setShowForm(true);
                      }}>Edit</Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
