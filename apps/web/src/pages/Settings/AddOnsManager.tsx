import React, { useState } from 'react';
import { Button, Card, Input } from '@podea/ui';
import type { AddOn, Service } from '@podea/shared-types/interfaces';

export const AddOnsManager: React.FC = () => {
  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: '1', name: 'Aromatherapy', durationAddedMinutes: 0, price: 15, status: 'active', vatRate: 19, applicableServiceIds: ['1'] }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AddOn>>({});

  const [services] = useState<Service[]>([
    { id: '1', name: 'Deep Tissue Massage', durationMinutes: 60, price: 100, status: 'active', vatRate: 19 }
  ]);

  const handleSave = () => {
    setAddOns([...addOns, { ...formData, id: Date.now().toString(), status: 'active' } as AddOn]);
    setShowForm(false);
    setFormData({});
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="font-serif" style={{ margin: 0 }}>Add-ons</h1>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Add-on</Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-serif" style={{ marginTop: 0 }}>Create/Edit Add-on</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <Input 
              label="Add-on Name" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Input 
                label="Added Duration (minutes)" 
                type="number"
                value={formData.durationAddedMinutes?.toString() || ''} 
                onChange={(e) => setFormData({...formData, durationAddedMinutes: parseInt(e.target.value)})} 
              />
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
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Applicable Services</label>
              <select 
                multiple
                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                value={formData.applicableServiceIds || []}
                onChange={(e) => {
                  const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({...formData, applicableServiceIds: selectedIds});
                }}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: 'var(--color-primary-muted)', margin: '4px 0 0' }}>Select which services this add-on can be attached to.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="primary" onClick={handleSave}>Save Add-on</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {!showForm && (
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {addOns.length === 0 ? (
            <p style={{ color: 'var(--color-primary-muted)' }}>No add-ons configured.</p>
          ) : (
            addOns.map(addon => (
              <Card key={addon.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px' }}>{addon.name}</h3>
                    <p style={{ margin: 0, color: 'var(--color-primary-muted)', fontSize: '14px' }}>
                      +{addon.durationAddedMinutes} min • ${addon.price} • VAT: {addon.vatRate || 0}%
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => {
                    setFormData(addon);
                    setShowForm(true);
                  }}>Edit</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
