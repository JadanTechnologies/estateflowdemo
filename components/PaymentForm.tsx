

import React, { useState, useMemo } from 'react';
import { Payment, Tenant, Property, PaymentType, PaymentStatus, PaymentMethod, ManualPaymentDetails } from '../types';
import { PAYMENT_METHOD_ICONS } from '../constants';

export interface PaymentFormProps {
    payment: Partial<Payment> | null;
    tenants: Tenant[];
    properties: Property[];
    payments: Payment[];
    onSave: (payment: Payment) => void;
    onClose: () => void;
    isTenantFlow?: boolean;
    manualPaymentDetails?: ManualPaymentDetails;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, tenants, properties, payments, onSave, onClose, isTenantFlow, manualPaymentDetails }) => {
    const [formData, setFormData] = useState<Partial<Payment>>({
        // Default values
        tenantId: '', 
        propertyId: '', 
        paymentType: PaymentType.Rent, 
        paymentStatus: PaymentStatus.Paid, 
        paymentMethod: isTenantFlow ? PaymentMethod.Manual : PaymentMethod.Transfer, 
        notes: '',
        // Spread the incoming payment object
        ...(payment || {}),
        amountPaid: payment?.amountPaid ?? 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [proofFile, setProofFile] = useState<string | null>(null);
    
    const { balance, balanceLabel } = useMemo(() => {
        const selectedTenant = tenants.find(t => t.id === formData.tenantId);
        const propertyForTenant = selectedTenant ? properties.find(p => p.id === selectedTenant.propertyId) : null;

        if (!propertyForTenant || !formData.tenantId) {
            return { balance: 0, balanceLabel: 'Balance' };
        }

        if (formData.paymentType === PaymentType.Deposit) {
            const totalDepositDue = propertyForTenant.depositAmount || 0;
            const totalDepositPaid = payments
                .filter(p => p.tenantId === formData.tenantId && p.paymentType === PaymentType.Deposit && p.id !== payment?.id)
                .reduce((sum, p) => sum + p.amountPaid, 0);
            
            const balance = totalDepositDue - totalDepositPaid;
            return { balance, balanceLabel: 'Deposit Balance Due' };
        }
        
        // Default to Rent
        const totalRentDue = propertyForTenant.rentAmount || 0;
        const totalRentPaid = payments
            .filter(p => p.tenantId === formData.tenantId && p.paymentType === PaymentType.Rent && p.id !== payment?.id)
            .reduce((sum, p) => sum + p.amountPaid, 0);

        const balance = totalRentDue - totalRentPaid;
        return { balance, balanceLabel: 'Rent Balance Due' };
    }, [formData.tenantId, formData.paymentType, tenants, properties, payments, payment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: name === 'amountPaid' ? Number(value) : value };

        if(name === 'tenantId') {
            const tenant = tenants.find(t => t.id === value);
            newFormData.propertyId = tenant?.propertyId;
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        setFormData(newFormData);
    };

    const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofFile(reader.result as string);
                if (errors.proof) {
                    setErrors(prev => ({...prev, proof: ''}));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const tenantPaymentMethods = [
        PaymentMethod.Manual,
        PaymentMethod.Paystack,
        PaymentMethod.Flutterwave,
    ];

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.tenantId) newErrors.tenantId = "Tenant is required.";
        if (!formData.amountPaid || formData.amountPaid <= 0) newErrors.amountPaid = "Amount must be a positive number.";
        if (isTenantFlow && formData.paymentMethod === PaymentMethod.Manual && !proofFile) {
            newErrors.proof = "Proof of payment is required for manual transfers.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const finalPayment = {
            id: payment?.id || Date.now().toString(),
            ...formData,
            date: payment?.date || new Date().toISOString(), // Set date on creation
            paymentStatus: isTenantFlow ? PaymentStatus.PendingApproval : formData.paymentStatus!,
            proofOfPayment: proofFile || undefined,
        } as Payment;
        onSave(finalPayment);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <select name="tenantId" value={formData.tenantId} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.tenantId ? 'border-red-500' : 'border-border'}`} required disabled={tenants.length === 1}>
                        <option value="">Select Tenant</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                    {errors.tenantId && <p className="text-red-400 text-xs mt-1">{errors.tenantId}</p>}
                </div>
                <input value={properties.find(p => p.id === formData.propertyId)?.name || 'Property'} className="w-full bg-secondary p-2 rounded border border-border" disabled />
                <select name="paymentType" value={formData.paymentType} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                    {Object.values(PaymentType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                        {PAYMENT_METHOD_ICONS[formData.paymentMethod!]}
                    </span>
                    <select 
                        name="paymentMethod" 
                        value={formData.paymentMethod} 
                        onChange={handleChange} 
                        className="w-full bg-secondary p-2 pl-10 rounded border border-border appearance-none"
                    >
                         {(isTenantFlow ? tenantPaymentMethods : Object.values(PaymentMethod)).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </div>
                <div>
                    <input type="number" name="amountPaid" value={formData.amountPaid || ''} onChange={handleChange} placeholder="Amount Paid" className={`w-full bg-secondary p-2 rounded border ${errors.amountPaid ? 'border-red-500' : 'border-border'}`} required />
                    {errors.amountPaid && <p className="text-red-400 text-xs mt-1">{errors.amountPaid}</p>}
                </div>
                 {!isTenantFlow && (
                    <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                        {Object.values(PaymentStatus).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 )}
                 <div className="p-2 bg-secondary rounded border border-border text-sm text-text-secondary md:col-span-2">
                    Date & Time: {payment?.date ? new Date(payment.date).toLocaleString() : 'Will be recorded on save'}
                </div>
                 <div className="p-2 bg-secondary rounded border border-border">{balanceLabel}: ₦{(balance).toLocaleString()}</div>
                 <div className="p-2 bg-secondary rounded border border-border">Balance After this Pmt: ₦{(balance - (formData.amountPaid || 0)).toLocaleString()}</div>
            </div>
            
            {isTenantFlow && formData.paymentMethod === PaymentMethod.Manual && manualPaymentDetails && (
                <div className="md:col-span-2 space-y-4 p-4 border border-dashed border-border rounded-lg">
                    <h4 className="font-semibold text-text-primary">Manual Payment Instructions</h4>
                    <p className="text-sm text-text-secondary">Please transfer the payment to the following bank account and upload a screenshot or proof of payment below.</p>
                    <div className="p-3 bg-background rounded-md text-sm">
                        <p><strong>Bank:</strong> {manualPaymentDetails.bankName}</p>
                        <p><strong>Account Name:</strong> {manualPaymentDetails.accountName}</p>
                        <p><strong>Account Number:</strong> {manualPaymentDetails.accountNumber}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Upload Proof of Payment</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            className={`w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover ${errors.proof ? 'ring-2 ring-red-500' : ''}`}
                            required
                        />
                        {errors.proof && <p className="text-red-400 text-xs mt-1">{errors.proof}</p>}
                        {proofFile && <img src={proofFile} alt="Proof preview" className="mt-2 max-h-32 rounded" />}
                    </div>
                </div>
            )}
             
             {!isTenantFlow && (
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Payment Notes (e.g., partial payment details)" className="w-full bg-secondary p-2 rounded border border-border h-24"></textarea>
             )}

            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">{isTenantFlow ? 'Submit for Approval' : 'Save Payment'}</button>
            </div>
        </form>
    );
};

export default PaymentForm;