import React, { useState } from 'react';
import type { IntakeFormTemplate } from '@podea/shared-types/interfaces';
import { Button, Input } from '@podea/ui';
import { AlertCircle } from 'lucide-react';

interface IntakeFormProps {
  template: IntakeFormTemplate;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ template, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error if they start typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    for (const field of template.fields) {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = 'This field is required.';
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-soft max-w-3xl mx-auto font-sans">
      <div className="flex items-center mb-6 text-[#4A6C5C]">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium tracking-wide uppercase">Secure & Private Medical Intake</span>
      </div>
      
      <h2 className="font-serif text-3xl text-[#1F2A37] mb-2">{template.title}</h2>
      {template.description && <p className="text-gray-500 mb-8">{template.description}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {template.fields.map(field => (
          <div key={field.id} className="border-b border-gray-100 pb-6 last:border-0">
            <label className="block text-lg text-[#374151] mb-3">
              {field.label} {field.required && <span className="text-[#BE5A5A]">*</span>}
            </label>

            {field.type === 'text' && (
              <Input 
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                style={{ backgroundColor: '#FCFAF8' }}
              />
            )}

            {field.type === 'textarea' && (
              <textarea 
                className="w-full p-4 rounded-xl border border-gray-200 bg-[#FCFAF8] focus:border-[#C7A75D] focus:ring-1 focus:ring-[#C7A75D] outline-none transition-all"
                rows={4}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'boolean' && (
              <div className="flex space-x-4">
                <button 
                  type="button"
                  className={`px-8 py-3 rounded-full border transition-colors ${formData[field.id] === true ? 'bg-[#C7A75D] text-white border-[#C7A75D]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handleFieldChange(field.id, true)}
                >
                  Yes
                </button>
                <button 
                  type="button"
                  className={`px-8 py-3 rounded-full border transition-colors ${formData[field.id] === false ? 'bg-[#1F2A37] text-white border-[#1F2A37]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handleFieldChange(field.id, false)}
                >
                  No
                </button>
              </div>
            )}

            {field.type === 'select' && field.options && (
              <select 
                className="w-full p-4 rounded-xl border border-gray-200 bg-[#FCFAF8] focus:border-[#C7A75D] outline-none"
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              >
                <option value="" disabled>Select an option...</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {errors[field.id] && <p className="text-[#BE5A5A] text-sm mt-2">{errors[field.id]}</p>}
          </div>
        ))}

        <div className="pt-6">
          <Button 
            type="submit" 
            variant="primary" 
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', borderRadius: '9999px', backgroundColor: '#1F2A37' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting securely...' : 'Complete Intake'}
          </Button>
        </div>
      </form>
    </div>
  );
};
