import React, { useState } from 'react';
import { Button, Card, Input } from '@podea/ui';
import type { Service, Product } from '@podea/shared-types/interfaces';

export const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});
  
  // Mock products for the consumables selector
  const [products] = useState<Product[]>([
    { id: '1', name: 'Massage Oil', sku: 'MO-01', price: 0, stockLevel: 10, status: 'active', vatRate: 19, type: 'consumable', createdAt: new Date() },
    { id: '2', name: 'Face Mask', sku: 'FM-01', price: 0, stockLevel: 5, status: 'active', vatRate: 19, type: 'consumable', createdAt: new Date() }
  ]);

  const handleSave = () => {
    // In a real app, this would save to Firestore
    setServices([...services, { ...formData, id: Date.now().toString(), status: 'active' } as Service]);
    setShowForm(false);
    setFormData({});
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="font-serif" style={{ margin: 0 }}>Services</h1>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Service</Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-serif" style={{ marginTop: 0 }}>Create/Edit Service</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <Input 
              label="Service Name" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
            <Input 
              label="Duration (minutes)" 
              type="number"
              value={formData.durationMinutes?.toString() || ''} 
              onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} 
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Input 
                label="Price" 
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
            
            {/* Consumables Linking */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Linked Consumables</label>
              <select 
                multiple
                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                onChange={(e) => {
                  const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({
                    ...formData, 
                    consumableProductIds: selectedIds.map(id => ({ productId: id, quantity: 1 }))
                  });
                }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (In stock: {p.stockLevel})</option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: 'var(--color-primary-muted)', margin: '4px 0 0' }}>Hold Ctrl/Cmd to select multiple. 1 unit will be deducted upon service completion.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="primary" onClick={handleSave}>Save Service</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {!showForm && (
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {services.length === 0 ? (
            <p style={{ color: 'var(--color-primary-muted)' }}>No services configured.</p>
          ) : (
            services.map(service => (
              <Card key={service.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px' }}>{service.name}</h3>
                    <p style={{ margin: 0, color: 'var(--color-primary-muted)', fontSize: '14px' }}>
                      {service.durationMinutes} min • ${service.price} • VAT: {service.vatRate || 0}%
                    </p>
                  </div>
                  <div>
                    <Button variant="secondary" onClick={() => {
                      setFormData(service);
                      setShowForm(true);
                    }}>Edit</Button>
                  </div>
                </div>
                {service.consumableProductIds && service.consumableProductIds.length > 0 && (
                  <div style={{ marginTop: 'var(--spacing-md)', fontSize: '14px' }}>
                    <strong>Consumables: </strong>
                    {service.consumableProductIds.map(c => products.find(p => p.id === c.productId)?.name).join(', ')}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
