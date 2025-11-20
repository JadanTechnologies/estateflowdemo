import React, { useState } from 'react';
import { NotificationTemplate, TemplateType } from '../types';
import Modal from './Modal';

interface TemplateFormProps {
    template: Partial<NotificationTemplate> | null;
    onSave: (template: NotificationTemplate) => void;
    onClose: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<NotificationTemplate>>({
        name: '',
        type: TemplateType.Custom,
        subject: '',
        body: '',
        ...template,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Template name is required.";
        if (!formData.body?.trim()) newErrors.body = "Message body is required.";
        if (!formData.subject?.trim()) newErrors.subject = "Subject is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!validate()) return;
        onSave({ id: template?.id || `tmpl-${Date.now()}`, ...formData } as NotificationTemplate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Template Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.name ? 'border-red-500' : 'border-border'}`} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Template Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                    {Object.values(TemplateType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Subject / Title</label>
                <input name="subject" value={formData.subject} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.subject ? 'border-red-500' : 'border-border'}`} />
                 {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Body</label>
                <textarea name="body" value={formData.body} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.body ? 'border-red-500' : 'border-border'} h-32`} />
                {/* FIX: Replaced curly braces with HTML entities to prevent JSX from interpreting them as expressions. */}
                <p className="text-xs text-text-secondary mt-1">Available placeholders: '&#123;tenantName&#125;', '&#123;propertyName&#125;', '&#123;rentAmount&#125;', '&#123;rentDueDate&#125;', '&#123;leaseEndDate&#125;'</p>
                {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body}</p>}
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Template</button>
            </div>
        </form>
    );
};

interface TemplateManagerProps {
    templates: NotificationTemplate[];
    setTemplates: React.Dispatch<React.SetStateAction<NotificationTemplate[]>>;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, setTemplates }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

    const handleSave = (template: NotificationTemplate) => {
        if (selectedTemplate) {
            setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
        } else {
            setTemplates(prev => [...prev, template]);
        }
        setIsModalOpen(false);
        setSelectedTemplate(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setSelectedTemplate(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
                    Create Template
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map(template => (
                            <tr key={template.id} className="border-b border-border/50">
                                <td className="p-3">{template.name}</td>
                                <td className="p-3">{template.type}</td>
                                <td className="p-3 space-x-4">
                                    <button onClick={() => { setSelectedTemplate(template); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                                    <button onClick={() => handleDelete(template.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTemplate ? "Edit Template" : "Create New Template"}>
                <TemplateForm template={selectedTemplate} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default TemplateManager;
