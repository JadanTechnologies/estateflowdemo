import React, { useState } from 'react';
import { NotificationTemplate } from '../types';

interface CommunicationFormProps {
    templates: NotificationTemplate[];
    onSend: (target: 'all' | 'staff' | 'tenants', type: 'sms' | 'email' | 'in-app', message: string, subject?: string) => void;
}

const CommunicationForm: React.FC<CommunicationFormProps> = ({ templates, onSend }) => {
    const [target, setTarget] = useState<'all' | 'staff' | 'tenants'>('all');
    const [type, setType] = useState<'in-app' | 'email' | 'sms'>('in-app');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleTemplateChange = (id: string) => {
        setTemplateId(id);
        const template = templates.find(t => t.id === id);
        if (template) {
            setSubject(template.subject);
            setMessage(template.body);
        } else {
            setSubject('');
            setMessage('');
        }
    };

    const handleSend = () => {
        if (!message.trim()) {
            setFeedback('Error: Message body cannot be empty.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }
        if (type === 'email' && !subject.trim()) {
            setFeedback('Error: Subject is required for emails.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }

        onSend(target, type, message, subject);

        setFeedback('Broadcast sent successfully!');
        setMessage('');
        setSubject('');
        setTemplateId('');
        setTimeout(() => setFeedback(''), 3000);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Target Audience</label>
                    <select value={target} onChange={e => setTarget(e.target.value as any)} className="w-full bg-secondary p-2 rounded border border-border">
                        <option value="all">All Users</option>
                        <option value="staff">All Staff</option>
                        <option value="tenants">All Tenants</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Channel</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-secondary p-2 rounded border border-border">
                        <option value="in-app">In-App Notification</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                    </select>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Use Template (Optional)</label>
                <select value={templateId} onChange={e => handleTemplateChange(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                    <option value="">-- Select a Template --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            {type === 'email' && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Subject</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border h-28" />
            </div>
            <div className="flex justify-between items-center">
                {feedback && <p className="text-sm text-green-400">{feedback}</p>}
                <button onClick={handleSend} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded ml-auto">
                    Send Broadcast
                </button>
            </div>
        </div>
    );
};

export default CommunicationForm;
