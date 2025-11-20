




import React, { useMemo, useState, useEffect } from 'react';
import { Tenant, Property, Payment, Maintenance, Announcement, PaymentType, PaymentMethod, PaymentStatus, ManualPaymentDetails } from '../types';
import TenantHeader from '../components/TenantHeader';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import DashboardCard from '../components/DashboardCard';
import { ICONS } from '../constants';
import TenancyAgreement from '../components/TenancyAgreement';

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const MaintenanceRequestForm: React.FC<{
    propertyId: string;
    tenantId: string;
    onSave: (task: Maintenance) => void;
    onClose: () => void;
}> = ({ propertyId, tenantId, onSave, onClose }) => {
    const [task, setTask] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [error, setError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task.trim()) {
            setError('Task description is required.');
            return;
        }

        const imageBase64Strings: string[] = [];
        for (const file of images) {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            imageBase64Strings.push(base64);
        }

        onSave({
            id: `maint-${Date.now()}`,
            propertyId,
            tenantId,
            task,
            notes,
            cost: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            images: imageBase64Strings,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Issue Description</label>
                <input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g., Leaky faucet in kitchen"
                    className={`w-full bg-secondary p-2 rounded border ${error ? 'border-red-500' : 'border-border'}`}
                />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Upload Photos of the Issue</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                />
            </div>
            {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-secondary rounded">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img src={preview} alt={`preview ${index}`} className="w-24 h-24 rounded-lg object-cover" />
                             <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                        </div>
                    ))}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Additional Notes (Optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide more details about the issue..."
                    className="w-full bg-secondary p-2 rounded border border-border h-24"
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Submit Request</button>
            </div>
        </form>
    );
};

const TenantNav: React.FC<{ activePage: string; setActivePage: (page: string) => void }> = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: ICONS.dashboard },
        { id: 'payments', label: 'Payment History', icon: ICONS.payments },
        { id: 'maintenance', label: 'Maintenance', icon: ICONS.maintenance },
        { id: 'property', label: 'My Property', icon: ICONS.properties },
        { id: 'agreement', label: 'My Agreement', icon: ICONS.tenants },
        { id: 'announcements', label: 'Announcements', icon: React.cloneElement(ICONS.notification, { className: "h-5 w-5" }) }
    ];

    return (
        <nav className="bg-card p-4 rounded-lg shadow-lg space-y-2 h-full">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        activePage === item.id ? 'bg-primary text-white' : 'hover:bg-secondary'
                    }`}
                >
                    {item.icon}
                    <span className="ml-3 font-medium">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

interface TenantDashboardProps {
    tenant: Tenant;
    tenants: Tenant[];
    setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
    property: Property;
    payments: Payment[];
    maintenanceRequests: Maintenance[];
    announcements: Announcement[];
    setMaintenance: React.Dispatch<React.SetStateAction<Maintenance[]>>;
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    onLogout: () => void;
    manualPaymentDetails: ManualPaymentDetails;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenant, tenants, setTenants, property, payments, maintenanceRequests, announcements, setMaintenance, setPayments, onLogout, manualPaymentDetails }) => {
    const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeTenantPage, setActiveTenantPage] = useState('overview');


    const financials = useMemo(() => {
        const rentPaid = payments
            .filter(p => p.paymentType === PaymentType.Rent)
            .reduce((sum, p) => sum + p.amountPaid, 0);
        const rentDue = property.rentAmount - rentPaid;

        const depositPaid = payments
            .filter(p => p.paymentType === PaymentType.Deposit)
            .reduce((sum, p) => sum + p.amountPaid, 0);
        const depositDue = property.depositAmount - depositPaid;
        
        return {
            rentBalance: rentDue > 0 ? rentDue : 0,
            depositBalance: depositDue > 0 ? depositDue : 0,
            totalDue: (rentDue > 0 ? rentDue : 0) + (depositDue > 0 ? depositDue : 0),
        };
    }, [payments, property]);

    const handleSaveMaintenance = (task: Maintenance) => {
        setMaintenance(prev => [task, ...prev]);
    };
    
    const handleSavePayment = (payment: Payment) => {
        setPayments(prev => [...prev, {
            ...payment,
            id: `pay-${Date.now()}`,
            date: new Date().toISOString(),
        }]);
        alert("Payment submitted for approval!");
        setIsPaymentModalOpen(false);
    };

     const handleSaveTenantSignature = (signatureData: string) => {
        setTenants(prevTenants => prevTenants.map(t => 
            t.id === tenant.id ? { ...t, tenantSignature: signatureData } : t
        ));
        // Note: No audit log here since this is a tenant action
        alert('Signature saved successfully!');
    };
    
    // Find the most up-to-date tenant object for the agreement
    const currentTenantData = tenants.find(t => t.id === tenant.id) || tenant;


    const renderContent = () => {
        switch(activeTenantPage) {
            case 'overview':
                return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">Dashboard Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <DashboardCard title="Your Property" value={property.name} subValue={property.location} icon={ICONS.properties} colorClass="bg-blue-500" />
                            <DashboardCard title="Next Rent Due" value={tenant.rentDueDate} subValue={formatCurrency(property.rentAmount)} icon={ICONS.payments} colorClass="bg-yellow-500" />
                            <DashboardCard title="Total Amount Due" value={formatCurrency(financials.totalDue)} icon={ICONS.payments} colorClass={financials.totalDue > 0 ? 'bg-red-500' : 'bg-green-500'} />
                        </div>
                    </div>
                );
            case 'payments':
                return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">Payment History</h3>
                        <div className="overflow-y-auto max-h-96">
                            {payments.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr>
                                            <th className="p-2">Date</th>
                                            <th className="p-2">Type</th>
                                            <th className="p-2">Method</th>
                                            <th className="p-2 text-right">Amount</th>
                                            <th className="p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {payments.map(p => (
                                            <tr key={p.id}>
                                                <td className="p-2">{new Date(p.date).toLocaleDateString()}</td>
                                                <td className="p-2">{p.paymentType}</td>
                                                <td className="p-2">{p.paymentMethod}</td>
                                                <td className="p-2 text-right">{formatCurrency(p.amountPaid)}</td>
                                                <td className="p-2">{p.paymentStatus}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center py-8 text-text-secondary">No payment history available.</p>
                            )}
                        </div>
                         <button onClick={() => setIsPaymentModalOpen(true)} className="mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded w-full">
                            Make a Payment
                        </button>
                    </div>
                );
            case 'maintenance':
                 return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">Maintenance Requests</h3>
                         <div className="overflow-y-auto max-h-96">
                            {maintenanceRequests.length > 0 ? (
                                <ul className="space-y-3">
                                    {maintenanceRequests.map(req => (
                                        <li key={req.id} className="p-3 bg-secondary rounded-md">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{req.task}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${req.status === 'Completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{req.status}</span>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-1">{new Date(req.date).toLocaleDateString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center py-8 text-text-secondary">No maintenance requests found.</p>
                            )}
                        </div>
                        <button onClick={() => setIsMaintModalOpen(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                            New Maintenance Request
                        </button>
                    </div>
                );
            case 'property':
                 return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">My Property Information</h3>
                        <div className="space-y-3 text-text-secondary">
                           <div className="flex justify-between p-3 bg-secondary rounded-md"><span>Property Name:</span> <strong className="text-text-primary">{property.name}</strong></div>
                           <div className="flex justify-between p-3 bg-secondary rounded-md"><span>Location:</span> <strong className="text-text-primary">{property.location}</strong></div>
                           <div className="flex justify-between p-3 bg-secondary rounded-md"><span>Unit Number:</span> <strong className="text-text-primary">{property.unitNumber}</strong></div>
                           <div className="flex justify-between p-3 bg-secondary rounded-md"><span>Rent Amount:</span> <strong className="text-text-primary">{formatCurrency(property.rentAmount)}</strong></div>
                           <div className="flex justify-between p-3 bg-secondary rounded-md"><span>Lease Start Date:</span> <strong className="text-text-primary">{tenant.leaseStartDate}</strong></div>
                           <div className="flex justify-between p-3 bg-secondary rounded-md"><span>Lease End Date:</span> <strong className="text-text-primary">{tenant.leaseEndDate}</strong></div>
                        </div>
                    </div>
                );
            case 'agreement':
                return (
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">My Tenancy Agreement</h3>
                        <TenancyAgreement
                            tenant={currentTenantData}
                            property={property}
                            currentUser={tenant}
                            onSaveTenantSignature={handleSaveTenantSignature}
                            onClose={() => {}}
                            companyName="EstateFlow Inc."
                        />
                    </div>
                );
            case 'announcements':
                return (
                     <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">Announcements</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {announcements.map(ann => (
                                <div key={ann.id} className="p-4 bg-secondary rounded-lg">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-text-primary">{ann.title}</h4>
                                        <p className="text-xs text-text-secondary">{new Date(ann.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1">{ann.content}</p>
                                </div>
                            ))}
                             {announcements.length === 0 && <p className="text-center py-8 text-text-secondary">No announcements.</p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <div className="flex flex-col h-screen bg-background">
            <TenantHeader tenant={tenant} onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto p-6">
                <h2 className="text-3xl font-bold mb-6">Welcome back, {tenant.fullName.split(' ')[0]}!</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <TenantNav activePage={activeTenantPage} setActivePage={setActiveTenantPage} />
                    </div>
                    <div className="lg:col-span-3">
                        {renderContent()}
                    </div>
                </div>

            </main>
            <footer className="text-center p-4 text-xs text-text-secondary">
                Developed by Jadan Technologies
            </footer>
            <Modal isOpen={isMaintModalOpen} onClose={() => setIsMaintModalOpen(false)} title="New Maintenance Request">
                <MaintenanceRequestForm propertyId={tenant.propertyId} tenantId={tenant.id} onSave={handleSaveMaintenance} onClose={() => setIsMaintModalOpen(false)} />
            </Modal>
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Make a Payment">
                <PaymentForm 
                    payment={{ tenantId: tenant.id, propertyId: tenant.propertyId, paymentType: PaymentType.Rent, amountPaid: financials.rentBalance > 0 ? financials.rentBalance : property.rentAmount }}
                    tenants={[tenant]}
                    properties={[property]}
                    payments={payments}
                    onSave={handleSavePayment}
                    onClose={() => setIsPaymentModalOpen(false)}
                    isTenantFlow={true}
                    manualPaymentDetails={manualPaymentDetails}
                />
            </Modal>
        </div>
    );
};

export default TenantDashboard;