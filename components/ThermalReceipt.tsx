import React from 'react';
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

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ 
    payment, 
    tenant, 
    property, 
    agent, 
    onPrinted, 
    companyName, 
    companyAddress, 
    companyPhone 
}) => {
    // Use provided company info or fallbacks
    const companyInfo = {
        name: companyName || 'EstateFlow',
        address: companyAddress || '45 Ahmadu Bello Way, Sokoto, Nigeria',
        phone: companyPhone || '080-1234-5678',
    };

    const paymentDateTime = new Date(payment.date);

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        
        if (printWindow) {
            const receiptContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Receipt</title>
                    <style>
                        body {
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 12px;
                            padding: 20px;
                            max-width: 300px;
                            margin: 0 auto;
                        }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .text-lg { font-size: 16px; }
                        .my-2 { margin-top: 8px; margin-bottom: 8px; }
                        .mb-4 { margin-bottom: 16px; }
                        table { width: 100%; }
                        .text-right { text-align: right; }
                        hr { border: none; border-top: 1px dashed #000; }
                    </style>
                </head>
                <body>
                    <div class="text-center mb-4">
                        <div style="font-size: 24px;">🏠</div>
                        <h1 class="font-bold text-lg">${companyInfo.name}</h1>
                        <p>${companyInfo.address}</p>
                        <p>${companyInfo.phone}</p>
                    </div>
                    <hr class="my-2" />
                    <div class="mb-4">
                        <p><strong>Date:</strong> ${paymentDateTime.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${paymentDateTime.toLocaleTimeString()}</p>
                        <p><strong>Receipt No:</strong> ${payment.id.slice(-6)}</p>
                    </div>
                    <hr class="my-2" />
                    <div class="mb-4">
                        <p><strong>Tenant:</strong> ${tenant.fullName}</p>
                        <p><strong>Property:</strong> ${property.name}</p>
                        <p><strong>Location:</strong> ${property.location}</p>
                        <p><strong>Agent:</strong> ${agent?.name || 'N/A'}</p>
                    </div>
                    <hr class="my-2" />
                    <table>
                        <tr>
                            <td>${payment.paymentType} Payment</td>
                            <td class="text-right">₦${payment.amountPaid.toLocaleString()}</td>
                        </tr>
                        ${payment.notes ? `<tr><td colspan="2" style="font-size:10px;font-style:italic;">Note: ${payment.notes}</td></tr>` : ''}
                    </table>
                    <hr class="my-2" />
                    <div class="text-right font-bold text-lg">
                        <p>TOTAL: ₦${payment.amountPaid.toLocaleString()}</p>
                    </div>
                    <hr class="my-2" />
                    <div class="text-center" style="font-size:10px;">
                        <p>Thank you for your payment!</p>
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.focus();
            
            // Small delay to ensure content is loaded
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                onPrinted();
            }, 250);
        } else {
            // If popup is blocked, alert user
            alert('Please allow popups to print receipts');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Payment Receipt</h2>
                    <button 
                        onClick={() => onPrinted()} 
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                
                {/* Receipt Preview */}
                <div className="p-4 bg-white text-black border-2 border-dashed border-gray-400 rounded">
                    <div className="text-center mb-4">
                        <Logo className="h-8 w-8 mx-auto" />
                        <h1 className="font-bold text-lg">{companyInfo.name}</h1>
                        <p className="text-sm">{companyInfo.address}</p>
                        <p className="text-sm">{companyInfo.phone}</p>
                    </div>
                    <hr className="border-dashed border-black my-2" />
                    <div className="mb-4 text-sm">
                        <p><strong>Date:</strong> {paymentDateTime.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {paymentDateTime.toLocaleTimeString()}</p>
                        <p><strong>Receipt No:</strong> {payment.id.slice(-6)}</p>
                    </div>
                    <hr className="border-dashed border-black my-2" />
                    <div className="mb-4 text-sm">
                        <p><strong>Tenant:</strong> {tenant.fullName}</p>
                        <p><strong>Property:</strong> {property.name}</p>
                        <p><strong>Location:</strong> {property.location}</p>
                        <p><strong>Agent:</strong> {agent?.name || 'N/A'}</p>
                    </div>
                    <hr className="border-dashed border-black my-2" />
                    <table className="w-full text-sm">
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
                        onClick={handlePrint}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThermalReceipt;
