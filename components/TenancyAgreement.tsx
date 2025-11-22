
import React from 'react';
import { Tenant, Property, User } from '../types';
import SignaturePad from './SignaturePad';

// Add this at the top of the file for jsPDF types
declare global {
  interface Window {
    jspdf: any;
  }
}

interface TenancyAgreementProps {
    tenant: Tenant;
    property: Property;
    companyName: string;
    currentUser: User | Tenant;
    onClose: () => void;
    onSaveTenantSignature?: (signature: string) => void;
    onSaveManagementSignature?: (signature: string) => void;
}

const TenancyAgreement: React.FC<TenancyAgreementProps> = ({ tenant, property, companyName, currentUser, onClose, onSaveTenantSignature, onSaveManagementSignature }) => {
    
    const isCurrentUserTenant = 'roleId' in currentUser ? false : currentUser.id === tenant.id;
    const isCurrentUserManagement = 'roleId' in currentUser;

    const handleDownloadPdf = () => {
        // @ts-ignore - jsPDF is loaded from a script tag in index.html
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Tenancy Agreement', pageWidth / 2, 30, { align: 'center' });
        doc.setFontSize(11);
        const introText = `This agreement is made on ${new Date().toLocaleDateString()} between ${companyName} (the "Landlord") and ${tenant.fullName} (the "Tenant").`;
        const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
        doc.text(splitIntro, 15, 45);
    
        // @ts-ignore
        doc.autoTable({
            startY: 55,
            head: [['Property & Lease Details', '']],
            body: [
                ['Property', `${property.name}, ${property.location}`],
                ['Rent Amount', `₦${property.rentAmount.toLocaleString()} per annum`],
                ['Lease Term', `From ${tenant.leaseStartDate} to ${tenant.leaseEndDate}`],
            ],
            theme: 'grid', headStyles: { fillColor: [79, 70, 229] }
        });
        
        // @ts-ignore
        let finalY = doc.lastAutoTable.finalY;

        // Add signature images if they exist
        if (tenant.tenantSignature) {
            doc.addImage(tenant.tenantSignature, 'PNG', 20, finalY + 15, 60, 30);
        }
        doc.text('_________________________', 20, finalY + 45);
        doc.text('Tenant Signature', 25, finalY + 50);

        if (tenant.managementSignature) {
            doc.addImage(tenant.managementSignature, 'PNG', pageWidth - 80, finalY + 15, 60, 30);
        }
        doc.text('_________________________', pageWidth - 80, finalY + 45);
        doc.text('Landlord Signature', pageWidth - 75, finalY + 50);
    
        doc.save(`Tenancy_Agreement_${tenant.fullName.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div>
            <div id="agreement-content" className="prose prose-invert max-w-none bg-secondary p-8 rounded">
                <h2 className="text-center">Tenancy Agreement</h2>
                <p>This agreement is made on {new Date().toLocaleDateString()} between <strong>{companyName}</strong> (the "Landlord") and <strong>{tenant.fullName}</strong> (the "Tenant").</p>
                <p><strong>Property:</strong> {property.name}, {property.location}</p>
                <p><strong>Rent Amount:</strong> ₦{property.rentAmount.toLocaleString()} per annum</p>
                <p><strong>Lease Term:</strong> From {tenant.leaseStartDate} to {tenant.leaseEndDate}</p>
                <div className="my-6 p-4 bg-background rounded border border-border/50 text-sm">
                    <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                        <li>The Tenant agrees to pay rent on or before the due date.</li>
                        <li>The Tenant shall keep the property in good condition and report any damages immediately.</li>
                        <li>The Landlord reserves the right to inspect the property with prior notice.</li>
                        <li>Subletting is not permitted without written consent from the Landlord.</li>
                        <li>Use of the property for illegal activities is strictly prohibited and grounds for immediate eviction.</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-border">
                    <div>
                        <h4 className="font-semibold mb-2">Tenant Signature</h4>
                        {tenant.tenantSignature ? (
                            <div className="space-y-2">
                                <img src={tenant.tenantSignature} alt="Tenant Signature" className="h-24 bg-white p-2 rounded border border-gray-300" />
                                <p className="text-xs text-green-400">✓ Signed by Tenant</p>
                            </div>
                        ) : isCurrentUserTenant && onSaveTenantSignature ? (
                            <div className="space-y-2">
                                <p className="text-xs text-text-secondary">Please sign below to accept the agreement.</p>
                                <SignaturePad onSave={onSaveTenantSignature} />
                            </div>
                        ) : (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-sm">
                                Awaiting Tenant Signature
                            </div>
                        )}
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Landlord/Management Signature</h4>
                        {tenant.managementSignature ? (
                            <div className="space-y-2">
                                <img src={tenant.managementSignature} alt="Management Signature" className="h-24 bg-white p-2 rounded border border-gray-300" />
                                <p className="text-xs text-green-400">✓ Signed by Management</p>
                            </div>
                        ) : isCurrentUserManagement ? (
                            tenant.tenantSignature && onSaveManagementSignature ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-green-400 font-medium">Tenant has signed. Please verify and sign below.</p>
                                    <SignaturePad onSave={onSaveManagementSignature} />
                                </div>
                            ) : (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-sm flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Waiting for Tenant to sign first.
                                </div>
                            )
                        ) : (
                             <p className="text-sm text-text-secondary italic">
                                {tenant.tenantSignature ? 'Awaiting Management Signature' : 'Waiting for Tenant to sign first'}
                             </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
                <button onClick={handleDownloadPdf} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Download PDF</button>
            </div>
        </div>
    );
};

export default TenancyAgreement;
