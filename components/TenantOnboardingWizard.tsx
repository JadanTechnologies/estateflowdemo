
import React, { useState, useMemo } from 'react';
import { Tenant, Property, PropertyStatus, Payment, PaymentType, PaymentStatus, PaymentMethod } from '../types';
import { ICONS } from '../constants';

interface TenantOnboardingWizardProps {
    properties: Property[];
    onSave: (tenant: Tenant, password?: string, initialPayment?: Payment) => void;
    onClose: () => void;
}

const STEPS = [
    { id: 1, title: 'Personal Info', icon: ICONS.users },
    { id: 2, title: 'Guarantor', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> },
    { id: 3, title: 'Property & Lease', icon: ICONS.properties },
    { id: 4, title: 'Initial Payment', icon: ICONS.payments },
    { id: 5, title: 'Review', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> }
];

const TenantOnboardingWizard: React.FC<TenantOnboardingWizardProps> = ({ properties, onSave, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Tenant>>({
        fullName: '', phone: '', email: '', address: '', nin: '', 
        propertyId: '', leaseStartDate: '', leaseEndDate: '', rentDueDate: '',
        profilePhoto: '', notes: '', username: '', 
        guarantor: { fullName: '', phone: '', address: '', nin: '' }
    });
    const [password, setPassword] = useState('');
    
    // Payment State
    const [recordPayment, setRecordPayment] = useState(false);
    const [paymentData, setPaymentData] = useState<Partial<Payment>>({
        amountPaid: 0,
        paymentType: PaymentType.Rent,
        paymentMethod: PaymentMethod.Transfer,
        paymentStatus: PaymentStatus.Paid,
        date: new Date().toISOString()
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const assignableProperties = useMemo(() => {
        return properties.filter(p => p.status === PropertyStatus.Vacant);
    }, [properties]);

    const handleTenantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, isGuarantor = false) => {
        const { name, value } = e.target;
        if (isGuarantor) {
            setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor!, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name] || (isGuarantor && errors[`guarantor${name}`])) {
            setErrors(prev => ({...prev, [isGuarantor ? `guarantor${name}` : name]: ''}));
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required.";
            if (!formData.nin?.trim()) newErrors.nin = "NIN is required.";
            if (!formData.username?.trim()) newErrors.username = "Username is required.";
            if (!password || password.length < 6) newErrors.password = "Password must be at least 6 chars.";
        }

        if (step === 2) {
            if (!formData.guarantor?.fullName?.trim()) newErrors.guarantorfullName = "Guarantor name is required.";
            if (!formData.guarantor?.phone?.trim()) newErrors.guarantorphone = "Guarantor phone is required.";
        }

        if (step === 3) {
            if (!formData.propertyId) newErrors.propertyId = "Property selection is required.";
            else {
                const selectedProp = properties.find(p => p.id === formData.propertyId);
                if (selectedProp && selectedProp.status !== PropertyStatus.Vacant) {
                    newErrors.propertyId = `Property ${selectedProp.name} is not vacant.`;
                }
            }

            if (!formData.leaseStartDate) newErrors.leaseStartDate = "Start date is required.";
            if (!formData.leaseEndDate) newErrors.leaseEndDate = "End date is required.";
            if (!formData.rentDueDate) newErrors.rentDueDate = "Rent due date is required.";
        }

        if (step === 4 && recordPayment) {
            if ((paymentData.amountPaid || 0) <= 0) newErrors.amountPaid = "Amount must be greater than 0.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = () => {
        const tenantId = `ten-${Date.now()}`;
        const finalTenant = { ...formData, id: tenantId } as Tenant;
        
        let initialPayment: Payment | undefined = undefined;
        if (recordPayment) {
            initialPayment = {
                id: `pay-${Date.now()}`,
                tenantId: tenantId,
                propertyId: formData.propertyId!,
                paymentType: paymentData.paymentType!,
                paymentStatus: paymentData.paymentStatus!,
                paymentMethod: paymentData.paymentMethod!,
                amountPaid: Number(paymentData.amountPaid),
                date: paymentData.date || new Date().toISOString(),
                notes: 'Initial payment during onboarding',
                receiptPrinted: false
            };
        }

        onSave(finalTenant, password, initialPayment);
    };

    const getSelectedPropertyName = () => {
        return properties.find(p => p.id === formData.propertyId)?.name || 'None Selected';
    };

    const getSelectedPropertyPrice = () => {
        const p = properties.find(p => p.id === formData.propertyId);
        return p ? p.rentAmount : 0;
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-8 px-4">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center relative z-10 w-1/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${currentStep >= step.id ? 'bg-primary border-primary text-white' : 'bg-secondary border-border text-text-secondary'}`}>
                            {step.icon}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-primary' : 'text-text-secondary'}`}>{step.title}</span>
                        {index < STEPS.length - 1 && (
                            <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
                {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-lg font-bold mb-4">Tenant Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Full Name *</label>
                                <input name="fullName" value={formData.fullName} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.fullName ? 'border-red-500' : 'border-border'}`} />
                                {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">NIN / ID Number *</label>
                                <input name="nin" value={formData.nin} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.nin ? 'border-red-500' : 'border-border'}`} />
                                {errors.nin && <p className="text-red-400 text-xs">{errors.nin}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleTenantChange} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleTenantChange} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-text-secondary mb-1">Address</label>
                                <input name="address" value={formData.address} onChange={handleTenantChange} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                        </div>
                        <div className="border-t border-border pt-4 mt-4">
                            <h4 className="text-sm font-bold mb-3 text-primary">Portal Access</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Username *</label>
                                    <input name="username" value={formData.username} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.username ? 'border-red-500' : 'border-border'}`} />
                                    {errors.username && <p className="text-red-400 text-xs">{errors.username}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Password *</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-secondary p-2 rounded border ${errors.password ? 'border-red-500' : 'border-border'}`} />
                                    {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-lg font-bold mb-4">Guarantor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Guarantor Name *</label>
                                <input name="fullName" value={formData.guarantor?.fullName} onChange={(e) => handleTenantChange(e, true)} className={`w-full bg-secondary p-2 rounded border ${errors.guarantorfullName ? 'border-red-500' : 'border-border'}`} />
                                {errors.guarantorfullName && <p className="text-red-400 text-xs">{errors.guarantorfullName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Guarantor Phone *</label>
                                <input name="phone" value={formData.guarantor?.phone} onChange={(e) => handleTenantChange(e, true)} className={`w-full bg-secondary p-2 rounded border ${errors.guarantorphone ? 'border-red-500' : 'border-border'}`} />
                                {errors.guarantorphone && <p className="text-red-400 text-xs">{errors.guarantorphone}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-text-secondary mb-1">Guarantor Address</label>
                                <input name="address" value={formData.guarantor?.address} onChange={(e) => handleTenantChange(e, true)} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Guarantor NIN</label>
                                <input name="nin" value={formData.guarantor?.nin} onChange={(e) => handleTenantChange(e, true)} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-lg font-bold mb-4">Property & Lease Details</h3>
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Assign Property *</label>
                            <select name="propertyId" value={formData.propertyId} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.propertyId ? 'border-red-500' : 'border-border'}`}>
                                <option value="">Select a Vacant Property</option>
                                {assignableProperties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ₦{p.rentAmount.toLocaleString()}</option>
                                ))}
                            </select>
                            {errors.propertyId && <p className="text-red-400 text-xs">{errors.propertyId}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Lease Start Date *</label>
                                <input type="date" name="leaseStartDate" value={formData.leaseStartDate} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.leaseStartDate ? 'border-red-500' : 'border-border'}`} />
                                {errors.leaseStartDate && <p className="text-red-400 text-xs">{errors.leaseStartDate}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Lease End Date *</label>
                                <input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.leaseEndDate ? 'border-red-500' : 'border-border'}`} />
                                {errors.leaseEndDate && <p className="text-red-400 text-xs">{errors.leaseEndDate}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Next Rent Due *</label>
                                <input type="date" name="rentDueDate" value={formData.rentDueDate} onChange={handleTenantChange} className={`w-full bg-secondary p-2 rounded border ${errors.rentDueDate ? 'border-red-500' : 'border-border'}`} />
                                {errors.rentDueDate && <p className="text-red-400 text-xs">{errors.rentDueDate}</p>}
                            </div>
                        </div>
                        {formData.propertyId && (
                            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded text-sm text-blue-200 mt-2">
                                <strong>Selected Property:</strong> {getSelectedPropertyName()} <br/>
                                <strong>Standard Rent:</strong> ₦{getSelectedPropertyPrice().toLocaleString()}
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-lg font-bold mb-4">Initial Payment</h3>
                        <p className="text-sm text-text-secondary mb-4">Would you like to record an initial rent or deposit payment now?</p>
                        
                        <label className="flex items-center space-x-3 p-3 bg-secondary rounded border border-border cursor-pointer">
                            <input type="checkbox" checked={recordPayment} onChange={e => setRecordPayment(e.target.checked)} className="form-checkbox h-5 w-5 text-primary" />
                            <span>Yes, record a payment now</span>
                        </label>

                        {recordPayment && (
                            <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Payment Type</label>
                                        <select value={paymentData.paymentType} onChange={e => setPaymentData({...paymentData, paymentType: e.target.value as PaymentType})} className="w-full bg-secondary p-2 rounded border border-border">
                                            {Object.values(PaymentType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Amount</label>
                                        <input type="number" value={paymentData.amountPaid} onChange={e => setPaymentData({...paymentData, amountPaid: Number(e.target.value)})} className={`w-full bg-secondary p-2 rounded border ${errors.amountPaid ? 'border-red-500' : 'border-border'}`} />
                                        {errors.amountPaid && <p className="text-red-400 text-xs">{errors.amountPaid}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Payment Method</label>
                                        <select value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value as PaymentMethod})} className="w-full bg-secondary p-2 rounded border border-border">
                                            {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">Date</label>
                                        <input type="date" value={paymentData.date?.split('T')[0]} onChange={e => setPaymentData({...paymentData, date: new Date(e.target.value).toISOString()})} className="w-full bg-secondary p-2 rounded border border-border" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-bold mb-2 text-center">Review Registration</h3>
                        <div className="bg-secondary p-4 rounded border border-border space-y-3 text-sm">
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-text-secondary">Name:</span>
                                <span className="font-semibold">{formData.fullName}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-text-secondary">Email:</span>
                                <span>{formData.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-text-secondary">Property:</span>
                                <span className="font-semibold">{getSelectedPropertyName()}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-text-secondary">Lease Duration:</span>
                                <span>{formData.leaseStartDate} to {formData.leaseEndDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-text-secondary">Guarantor:</span>
                                <span>{formData.guarantor?.fullName}</span>
                            </div>
                            {recordPayment && (
                                <div className="flex justify-between pt-2 text-green-400">
                                    <span>Initial Payment:</span>
                                    <span className="font-bold">₦{paymentData.amountPaid?.toLocaleString()} ({paymentData.paymentType})</span>
                                </div>
                            )}
                        </div>
                        <p className="text-center text-xs text-text-secondary">
                            By clicking Submit, you will register this tenant, change the property status to Occupied{recordPayment ? ', and record the initial payment' : ''}.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-border pt-4 mt-4 flex justify-between px-4">
                {currentStep > 1 ? (
                    <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium">Back</button>
                ) : (
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium">Cancel</button>
                )}

                {currentStep < 5 ? (
                    <button onClick={handleNext} className="px-6 py-2 rounded bg-primary hover:bg-primary-hover text-white font-bold">Next Step</button>
                ) : (
                    <button onClick={handleSubmit} className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20">Submit & Register</button>
                )}
            </div>
        </div>
    );
};

export default TenantOnboardingWizard;
