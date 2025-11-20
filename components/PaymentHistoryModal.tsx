
import React from 'react';
import { Tenant, Payment, Property, PaymentType, Agent } from '../types';

interface PaymentHistoryModalProps {
    tenant: Tenant | null;
    payments: Payment[];
    properties: Property[];
    agents: Agent[];
    onClose: () => void;
    onPrintReceipt: (payment: Payment) => void;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ tenant, payments, properties, onClose, onPrintReceipt }) => {
    if (!tenant) return null;

    const tenantPayments = payments.filter(p => p.tenantId === tenant.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const property = properties.find(p => p.id === tenant.propertyId);
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    // Financial calculations
    const rentAmountDue = property?.rentAmount || 0;
    const totalRentPaid = tenantPayments
        .filter(p => p.paymentType === PaymentType.Rent)
        .reduce((acc, p) => acc + p.amountPaid, 0);
    const rentBalance = rentAmountDue - totalRentPaid;

    const depositAmountDue = property?.depositAmount || 0;
    const totalDepositPaid = tenantPayments
        .filter(p => p.paymentType === PaymentType.Deposit)
        .reduce((acc, p) => acc + p.amountPaid, 0);
    const depositBalance = depositAmountDue - totalDepositPaid;

    const totalPaid = totalRentPaid + totalDepositPaid;

    return (
        <div className="space-y-6">
            <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-bold mb-3 text-text-primary">Financial Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {/* Rent Details */}
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-text-secondary">Rent Due:</span> <span>{formatCurrency(rentAmountDue)}</span></div>
                        <div className="flex justify-between"><span className="text-text-secondary">Rent Paid:</span> <span className="text-green-400">{formatCurrency(totalRentPaid)}</span></div>
                        <div className="flex justify-between border-t border-border/50 pt-1 mt-1"><span className="font-semibold">Rent Balance:</span> <span className={`font-semibold ${rentBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(rentBalance)}</span></div>
                    </div>
                    {/* Deposit Details */}
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-text-secondary">Deposit Due:</span> <span>{formatCurrency(depositAmountDue)}</span></div>
                        <div className="flex justify-between"><span className="text-text-secondary">Deposit Paid:</span> <span className="text-green-400">{formatCurrency(totalDepositPaid)}</span></div>
                        <div className="flex justify-between border-t border-border/50 pt-1 mt-1"><span className="font-semibold">Deposit Balance:</span> <span className={`font-semibold ${depositBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(depositBalance)}</span></div>
                    </div>
                </div>
            </div>
            
            {tenantPayments.length > 0 ? (
                <div>
                    <h4 className="font-bold mb-3 text-text-primary">Payment Log</h4>
                    <div className="overflow-y-auto max-h-60 bg-secondary rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-card sticky top-0">
                                <tr>
                                    <th className="p-3">Date & Time</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Method</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {tenantPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-border/20">
                                        <td className="p-3">{new Date(payment.date).toLocaleString()}</td>
                                        <td className="p-3">{payment.paymentType}</td>
                                        <td className="p-3">{payment.paymentMethod}</td>
                                        <td className="p-3 text-right">{formatCurrency(payment.amountPaid)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => onPrintReceipt(payment)} className="text-green-400 hover:text-green-300 text-xs font-semibold">Print</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold border-t-2 border-border bg-card sticky bottom-0">
                                    <td colSpan={3} className="p-3 text-right">Total Paid (All Types)</td>
                                    <td className="p-3 text-right">{formatCurrency(totalPaid)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-center text-text-secondary italic py-4">No payment history found for this tenant.</p>
            )}
             <div className="flex justify-end pt-2">
                <button type="button" onClick={onClose} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        </div>
    );
};

export default PaymentHistoryModal;
