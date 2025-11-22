
import React, { useState } from 'react';
import { LandingPageConfig } from '../types';

interface LandingPageEditorProps {
    config: LandingPageConfig;
    onSave: (config: LandingPageConfig) => void;
}

const LandingPageEditor: React.FC<LandingPageEditorProps> = ({ config, onSave }) => {
    const [activeTab, setActiveTab] = useState('hero');
    const [localConfig, setLocalConfig] = useState<LandingPageConfig>(config);

    const handleChange = (section: keyof LandingPageConfig, key: string, value: any) => {
        setLocalConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleNestedArrayChange = (section: keyof LandingPageConfig, arrayName: string, index: number, key: string, value: any) => {
         setLocalConfig(prev => {
             const sectionData = prev[section] as any;
             const newArray = [...sectionData[arrayName]];
             newArray[index] = { ...newArray[index], [key]: value };
             return {
                 ...prev,
                 [section]: {
                     ...sectionData,
                     [arrayName]: newArray
                 }
             };
         });
    };

    const handleSave = () => {
        onSave(localConfig);
        alert('Landing page configuration saved successfully!');
    };

    const renderInput = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <input type="text" value={value} onChange={onChange} className="w-full bg-secondary p-2 rounded border border-border" />
        </div>
    );

    const renderTextarea = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <textarea value={value} onChange={onChange} className="w-full bg-secondary p-2 rounded border border-border h-32" />
        </div>
    );

    return (
        <div className="bg-card p-6 rounded-lg shadow-lg mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Landing Page Editor</h2>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Save Changes
                </button>
            </div>

            <div className="flex border-b border-border mb-6 overflow-x-auto">
                {Object.keys(localConfig).map(key => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 font-medium capitalize ${activeTab === key ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {activeTab === 'hero' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Hero Section</h3>
                        {renderInput("Title", localConfig.hero.title, e => handleChange('hero', 'title', e.target.value))}
                        {renderTextarea("Subtitle", localConfig.hero.subtitle, e => handleChange('hero', 'subtitle', e.target.value))}
                        {renderInput("CTA Text", localConfig.hero.ctaText, e => handleChange('hero', 'ctaText', e.target.value))}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">About Us Section</h3>
                        {renderInput("Title", localConfig.about.title, e => handleChange('about', 'title', e.target.value))}
                        {renderTextarea("Description", localConfig.about.description, e => handleChange('about', 'description', e.target.value))}
                        {renderInput("Image URL", localConfig.about.imageUrl || '', e => handleChange('about', 'imageUrl', e.target.value))}
                    </div>
                )}
                
                {activeTab === 'features' && (
                    <div>
                         <h3 className="text-lg font-bold mb-4">Features Section</h3>
                         {renderInput("Section Title", localConfig.features.title, e => handleChange('features', 'title', e.target.value))}
                         {renderInput("Section Subtitle", localConfig.features.subtitle, e => handleChange('features', 'subtitle', e.target.value))}
                         
                         <div className="mt-6 space-y-4">
                             {localConfig.features.items.map((item, idx) => (
                                 <div key={idx} className="p-4 bg-secondary rounded border border-border">
                                     <h4 className="font-semibold mb-2">Feature {idx + 1}</h4>
                                     {renderInput("Title", item.title, e => handleNestedArrayChange('features', 'items', idx, 'title', e.target.value))}
                                     {renderTextarea("Description", item.description, e => handleNestedArrayChange('features', 'items', idx, 'description', e.target.value))}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                     <div>
                         <h3 className="text-lg font-bold mb-4">Pricing Section</h3>
                         {renderInput("Section Title", localConfig.pricing.title, e => handleChange('pricing', 'title', e.target.value))}
                         {renderInput("Section Subtitle", localConfig.pricing.subtitle, e => handleChange('pricing', 'subtitle', e.target.value))}
                         
                         <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                             {localConfig.pricing.plans.map((plan, idx) => (
                                 <div key={idx} className="p-4 bg-secondary rounded border border-border">
                                     <h4 className="font-semibold mb-2">Plan {idx + 1}</h4>
                                     {renderInput("Name", plan.name, e => handleNestedArrayChange('pricing', 'plans', idx, 'name', e.target.value))}
                                     {renderInput("Price", plan.price, e => handleNestedArrayChange('pricing', 'plans', idx, 'price', e.target.value))}
                                     {renderInput("Period", plan.period, e => handleNestedArrayChange('pricing', 'plans', idx, 'period', e.target.value))}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
                
                {activeTab === 'legal' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Legal Documents</h3>
                        {renderTextarea("Privacy Policy", localConfig.legal.privacyPolicy, e => handleChange('legal', 'privacyPolicy', e.target.value))}
                        {renderTextarea("Terms of Service", localConfig.legal.termsOfService, e => handleChange('legal', 'termsOfService', e.target.value))}
                        {renderTextarea("Refund Policy", localConfig.legal.refundPolicy, e => handleChange('legal', 'refundPolicy', e.target.value))}
                    </div>
                )}

                 {activeTab === 'contact' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                        {renderInput("Email", localConfig.contact.email, e => handleChange('contact', 'email', e.target.value))}
                        {renderInput("Phone", localConfig.contact.phone, e => handleChange('contact', 'phone', e.target.value))}
                        {renderInput("Address", localConfig.contact.address, e => handleChange('contact', 'address', e.target.value))}
                    </div>
                )}

                 {activeTab === 'faqs' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">FAQs</h3>
                        {renderInput("Section Title", localConfig.faqs.title, e => handleChange('faqs', 'title', e.target.value))}
                         <div className="mt-6 space-y-4">
                             {localConfig.faqs.items.map((item, idx) => (
                                 <div key={idx} className="p-4 bg-secondary rounded border border-border">
                                     {renderInput("Question", item.question, e => handleNestedArrayChange('faqs', 'items', idx, 'question', e.target.value))}
                                     {renderTextarea("Answer", item.answer, e => handleNestedArrayChange('faqs', 'items', idx, 'answer', e.target.value))}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
                 {activeTab === 'testimonials' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Testimonials</h3>
                        {renderInput("Section Title", localConfig.testimonials.title, e => handleChange('testimonials', 'title', e.target.value))}
                         <div className="mt-6 space-y-4">
                             {localConfig.testimonials.items.map((item, idx) => (
                                 <div key={idx} className="p-4 bg-secondary rounded border border-border">
                                     {renderInput("Name", item.name, e => handleNestedArrayChange('testimonials', 'items', idx, 'name', e.target.value))}
                                     {renderInput("Role", item.role, e => handleNestedArrayChange('testimonials', 'items', idx, 'role', e.target.value))}
                                     {renderTextarea("Comment", item.comment, e => handleNestedArrayChange('testimonials', 'items', idx, 'comment', e.target.value))}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
                
                 {activeTab === 'howItWorks' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">How It Works</h3>
                        {renderInput("Section Title", localConfig.howItWorks.title, e => handleChange('howItWorks', 'title', e.target.value))}
                         <div className="mt-6 space-y-4">
                             {localConfig.howItWorks.steps.map((item, idx) => (
                                 <div key={idx} className="p-4 bg-secondary rounded border border-border">
                                     <h4 className="font-semibold mb-2">Step {idx + 1}</h4>
                                     {renderInput("Title", item.title, e => handleNestedArrayChange('howItWorks', 'steps', idx, 'title', e.target.value))}
                                     {renderTextarea("Description", item.description, e => handleNestedArrayChange('howItWorks', 'steps', idx, 'description', e.target.value))}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
                
                 {activeTab === 'blog' && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Blog Posts</h3>
                        {renderInput("Section Title", localConfig.blog.title, e => handleChange('blog', 'title', e.target.value))}
                         <div className="mt-6 space-y-4">
                             {localConfig.blog.posts.map((item, idx) => (
                                 <div key={idx} className="p-4 bg-secondary rounded border border-border">
                                     {renderInput("Title", item.title, e => handleNestedArrayChange('blog', 'posts', idx, 'title', e.target.value))}
                                     {renderTextarea("Excerpt", item.excerpt, e => handleNestedArrayChange('blog', 'posts', idx, 'excerpt', e.target.value))}
                                     {renderInput("Date", item.date, e => handleNestedArrayChange('blog', 'posts', idx, 'date', e.target.value))}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPageEditor;
