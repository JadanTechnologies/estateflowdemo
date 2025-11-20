import React, { useState, useMemo, useEffect } from 'react';
import { Agent, Property, Payment, CommissionPayment, PaymentType } from '../types';
import Modal from './Modal';

interface PayCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent | null;
    properties: Property[];
    payments: Payment[];
    onSave: (payment: CommissionPayment) => void;
}

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const PayCommissionModal: React.FC<PayCommissionModalProps> = ({ isOpen, onClose, agent, properties, payments, onSave }) => {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [amountToPay, setAmountToPay] = useState(0);
    const [notes, setNotes] = useState('');

    const calculation = useMemo(() => {
        if (!agent || !startDate || !endDate) return { totalCollected: 0, commissionEarned: 0 };

        const agentProperties = properties.filter(p => p.agentId === agent.id);
        const agentPropertyIds = new Set(agentProperties.map(p => p.id));
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day

        const relevantPayments = payments.filter(p => 
            agentPropertyIds.has(p.propertyId) &&
            p.paymentType === PaymentType.Rent &&
            new Date(p.date) >= start &&
            new Date(p.date) <= end
        );

        const totalCollected = relevantPayments.reduce((sum, p) => sum + p.amountPaid, 0);
        const commissionEarned = (totalCollected * (agent.commissionRate || 0)) / 100;

        return { totalCollected, commissionEarned };
    }, [agent, startDate, endDate, properties, payments]);
    
    useEffect(() => {
        if (isOpen) {
            setAmountToPay(calculation.commissionEarned);
        }
    }, [calculation.commissionEarned, isOpen]);
    
    const handleSave = () => {
        if (!agent || amountToPay <= 0) {
            alert("Amount to pay must be greater than zero.");
            return;
        }

        const newPayment: CommissionPayment = {
            id: `comm-${Date.now()}`,
            agentId: agent.id,
            amount: amountToPay,
            paymentDate: new Date().toISOString().split('T')[0],
            periodStartDate: startDate,
            periodEndDate: endDate,
            notes: notes
        };

        onSave(newPayment);
    };

    if (!isOpen || !agent) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Pay Commission to ${agent.name}`}>
            <div className="space-y-6">
                {/* Date Range Selection */}
                <div>
                    <h4 className="font-semibold mb-2">Select Payment Period</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" />
                        </div>
                    </div>
                </div>

                {/* Calculation Display */}
                <div className="p-4 bg-secondary rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Total Rent Collected in Period:</span>
                        <span className="font-semibold">{formatCurrency(calculation.totalCollected)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Commission Rate:</span>
                        <span className="font-semibold">{agent.commissionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-border pt-2 mt-2">
                        <span className="font-bold">Calculated Commission:</span>
                        <span className="font-bold text-green-400">{formatCurrency(calculation.commissionEarned)}</span>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">Amount to Pay</label>
                        <input type="number" value={amountToPay} onChange={e => setAmountToPay(Number(e.target.value))} className="w-full bg-secondary p-2 rounded border border-border" />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Notes (Optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border h-20" placeholder="e.g., Q2 commission payment"></textarea>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Confirm Payment</button>
                </div>
            </div>
        </Modal>
    );
};

export default PayCommissionModal;
