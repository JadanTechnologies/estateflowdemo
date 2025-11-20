import React, { useEffect } from 'react';
import { Payment, Tenant, Property, Agent } from '../types';
import { Logo } from '../constants';

interface ThermalReceiptProps {
    payment: Payment;
    tenant: Tenant;
    property: Property;
    agent: Agent | undefined;
    onPrinted: () => void;
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ payment, tenant, property, agent, onPrinted }) => {
    useEffect(() => {
        // This function will be called after the print dialog is closed.
        const handleAfterPrint = () => {
            onPrinted();
            window.removeEventListener('afterprint', handleAfterPrint);
        };

        window.addEventListener('afterprint', handleAfterPrint);

        // Delay print slightly to ensure DOM updates are painted.
        const timerId = setTimeout(() => {
            window.print();
        }, 100);

        // Cleanup function to remove the event listener if the component unmounts
        return () => {
            clearTimeout(timerId);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [payment, onPrinted]);

    const companyInfo = {
        name: 'EstateFlow Inc.',
        address: '123 Property Lane, Real Estate City',
        phone: '555-123-4567',
    };

    const paymentDateTime = new Date(payment.date);

    return (
        <>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #thermal-receipt, #thermal-receipt * {
                        visibility: visible;
                    }
                    #thermal-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 10px;
                        color: #000;
                    }
                }
                `}
            </style>
            <div id="thermal-receipt" style={{ position: 'absolute', left: '-9999px' }} className="p-2 bg-white text-black max-w-[300px] mx-auto">
                <div className="text-center mb-4">
                    <Logo className="h-8 w-8 mx-auto text-black" />
                    <h1 className="font-bold text-lg">{companyInfo.name}</h1>
                    <p>{companyInfo.address}</p>
                    <p>{companyInfo.phone}</p>
                </div>
                <hr className="border-dashed border-black my-2" />
                <div className="mb-2">
                    <p><strong>Date:</strong> {paymentDateTime.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {paymentDateTime.toLocaleTimeString()}</p>
                    <p><strong>Receipt No:</strong> {payment.id.slice(-6)}</p>
                </div>
                <hr className="border-dashed border-black my-2" />
                <div className="mb-2">
                    <p><strong>Tenant:</strong> {tenant.fullName}</p>
                    <p><strong>Property:</strong> {property.name}</p>
                    <p><strong>Location:</strong> {property.location}</p>
                    <p><strong>Agent:</strong> {agent?.name || 'N/A'}</p>
                </div>
                <hr className="border-dashed border-black my-2" />
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Description</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{payment.paymentType} Payment</td>
                            <td className="text-right">₦{payment.amountPaid.toLocaleString()}</td>
                        </tr>
                        {payment.notes && (
                            <tr>
                                <td colSpan={2} className="pt-1 text-xs italic">Note: {payment.notes}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <hr className="border-dashed border-black my-2" />
                <div className="text-right font-bold text-lg">
                    <p>TOTAL: ₦{payment.amountPaid.toLocaleString()}</p>
                </div>
                 <hr className="border-dashed border-black my-2" />
                <div className="text-center mt-4 text-xs">
                    <p>Thank you for your payment!</p>
                </div>
            </div>
        </>
    );
};

export default ThermalReceipt;