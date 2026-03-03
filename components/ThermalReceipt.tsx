import React, { useEffect } from 'react';
import { Payment, Tenant, Property, Agent } from '../types';
import { Logo } from '../constants';

interface ThermalReceiptProps {
    payment: Payment;
    tenant: Tenant;
    property: Property;
    agent: Agent | undefined;
    onPrinted: () => void;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ payment, tenant, property, agent, onPrinted, companyName, companyAddress, companyPhone }) => {
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
        }, 500);

        // Cleanup function to remove the event listener if the component unmounts
        return () => {
            clearTimeout(timerId);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [payment, onPrinted]);

    // Use provided company info or fallbacks
    const companyInfo = {
        name: companyName || 'EstateFlow',
        address: companyAddress || '45 Ahmadu Bello Way, Sokoto, Nigeria',
        phone: companyPhone || '080-1234-5678',
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
                        font-size: 12px;
                        color: #000;
                        background: white;
                        padding: 20px;
                    }
                    .no-print {
                        display: none;
                    }
                }
                @media screen {
                    #thermal-receipt-screen {
                        display: block;
                    }
                }
                `}
            </style>
            
            {/* Screen preview - visible before printing */}
            <div id="thermal-receipt-screen" className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" style={{ visibility: 'visible' }}>
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Payment Receipt Preview</h2>
                        <button 
                            onClick={() => onPrinted()} 
                            className="no-print text-gray-500 hover:text-gray-700"
                        >
                            ✕ Close
                        </button>
                    </div>
                    
                    {/* Receipt Content */}
                    <div id="thermal-receipt" className="p-4 bg-white text-black border-2 border-dashed border-gray-400">
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
                    
                    {/* Print Button */}
                    <div className="mt-4 flex justify-center">
                        <button 
                            onClick={() => window.print()}
                            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded"
                        >
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThermalReceipt;