
import React, { useState, useEffect } from 'react';
import { Tenant, NotificationTemplate } from '../types';
import Modal from './Modal';

interface SmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  templates: NotificationTemplate[];
  onSend: (tenant: Tenant, message: string) => { success: boolean; message: string };
}

const SmsModal: React.FC<SmsModalProps> = ({ isOpen, onClose, tenant, templates, onSend }) => {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    // Reset state when modal is opened or tenant changes
    if (isOpen) {
      setMessage('');
      setResult(null);
      setSelectedTemplateId('');
    }
  }, [isOpen, tenant]);
  
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && tenant) {
        // Simple placeholder replacement
        const personalizedBody = template.body
            .replace('{tenantName}', tenant.fullName)
            .replace('{rentDueDate}', tenant.rentDueDate)
            .replace('{leaseEndDate}', tenant.leaseEndDate)
            // Add more placeholders as needed
        setMessage(personalizedBody);
    } else {
        setMessage('');
    }
  }

  if (!isOpen || !tenant) return null;

  const handleSend = () => {
    if (!message.trim()) {
        setResult({ type: 'error', text: 'Message cannot be empty.' });
        return;
    }
    const sendResult = onSend(tenant, message);
    if (sendResult.success) {
        setResult({ type: 'success', text: sendResult.message });
        setMessage('');
        setTimeout(() => {
            onClose();
        }, 2000); // Close modal after 2 seconds on success
    } else {
        setResult({ type: 'error', text: sendResult.message });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send SMS to ${tenant.fullName}`}>
      <div className="space-y-4">
        <div>
            <label htmlFor="template" className="block text-sm font-medium text-text-secondary mb-1">
                Use Template (Optional)
            </label>
            <select
                id="template"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-secondary p-2 rounded border border-border"
            >
                <option value="">-- No Template --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
        <div>
          <label htmlFor="smsMessage" className="block text-sm font-medium text-text-secondary mb-1">
            Message
          </label>
          <textarea
            id="smsMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-secondary p-2 rounded border border-border h-32"
            placeholder="Type your message here..."
          />
        </div>

        {result && (
          <div className={`p-3 rounded-md text-sm ${result.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {result.text}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded"
          >
            Send Message
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SmsModal;
