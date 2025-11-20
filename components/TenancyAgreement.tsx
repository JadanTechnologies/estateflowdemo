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
                {/* Add more clauses as needed */}

                <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-border">
                    <div>
                        <h4 className="font-semibold mb-2">Tenant Signature</h4>
                        {tenant.tenantSignature ? (
                            <img src={tenant.tenantSignature} alt="Tenant Signature" className="h-24 bg-white p-2 rounded" />
                        ) : isCurrentUserTenant && onSaveTenantSignature ? (
                            <SignaturePad onSave={onSaveTenantSignature} />
                        ) : (
                            <p className="text-sm text-text-secondary italic">Awaiting Tenant Signature</p>
                        )}
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Landlord/Management Signature</h4>
                        {tenant.managementSignature ? (
                            <img src={tenant.managementSignature} alt="Management Signature" className="h-24 bg-white p-2 rounded" />
                        ) : isCurrentUserManagement && tenant.tenantSignature && onSaveManagementSignature ? (
                            <SignaturePad onSave={onSaveManagementSignature} />
                        ) : (
                             <p className="text-sm text-text-secondary italic">{tenant.tenantSignature ? 'Awaiting Management Signature' : 'Waiting for Tenant to sign first'}</p>
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