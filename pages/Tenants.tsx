



import React, { useState, useMemo } from 'react';
import { Tenant, Property, PropertyStatus, Payment, PaymentType, User, Permission, Role, Agent, NotificationTemplate, AuditLogEntry } from '../types';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import ConfirmationModal from '../components/ConfirmationModal';
import SmsModal from '../components/SmsModal';
import { ICONS } from '../constants';
import TenancyAgreement from '../components/TenancyAgreement';

// Add this at the top of the file for jsPDF types
declare global {
  interface Window {
    jspdf: any;
  }
}

interface TenantFormProps {
    tenant: Partial<Tenant> | null;
    properties: Property[];
    tenants: Tenant[];
    onSave: (tenant: Tenant, password?: string) => void;
    onClose: () => void;
}

const TenantForm: React.FC<TenantFormProps> = ({ tenant, properties, tenants, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Tenant>>(tenant || {
        fullName: '', phone: '', email: '', address: '', nin: '', propertyId: '', leaseStartDate: '', leaseEndDate: '', rentDueDate: '',
        profilePhoto: '', notes: '',
        guarantor: { fullName: '', phone: '', address: '', nin: '' }
    });
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const assignableProperties = useMemo(() => {
        return properties.filter(p => p.status === PropertyStatus.Vacant || p.id === tenant?.propertyId);
    }, [properties, tenant]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, isGuarantor = false) => {
        const { name, value } = e.target;
        
        if (isGuarantor) {
            setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor!, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name] || (isGuarantor && errors[`guarantor${name}`])) {
            const errorKey = isGuarantor ? `guarantor${name}` : name;
            setErrors(prev => ({...prev, [errorKey]: ''}));
        }
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, profilePhoto: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const ninRegex = /^\d{11}$/;
        const emailRegex = /\S+@\S+\.\S+/;

        if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required.";
        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Email is not valid.";
        if (!formData.nin?.trim()) newErrors.nin = "Tenant NIN is required.";
        else if (!ninRegex.test(formData.nin)) newErrors.nin = "NIN must be 11 digits.";

        if (!formData.guarantor?.fullName?.trim()) newErrors.guarantorfullName = "Guarantor name is required.";
        if (!formData.guarantor?.nin?.trim()) newErrors.guarantornin = "Guarantor NIN is required.";
        else if (!ninRegex.test(formData.guarantor.nin)) newErrors.guarantornin = "Guarantor NIN must be 11 digits.";

        if (!formData.propertyId) newErrors.propertyId = "A property must be assigned.";
        if (!formData.leaseStartDate) newErrors.leaseStartDate = "Lease start date is required.";
        if (!formData.leaseEndDate) newErrors.leaseEndDate = "Lease end date is required.";
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight to compare just the date part

        if (!formData.rentDueDate) {
            newErrors.rentDueDate = "Rent due date is required.";
        } else if (new Date(formData.rentDueDate) < today) {
            newErrors.rentDueDate = "Rent due date cannot be in the past.";
        }

        if (formData.leaseStartDate && formData.leaseEndDate && new Date(formData.leaseStartDate) >= new Date(formData.leaseEndDate)) {
            newErrors.leaseEndDate = "End date must be after start date.";
        }
        
        const selectedProperty = properties.find(p => p.id === formData.propertyId);
        if (selectedProperty && selectedProperty.status !== PropertyStatus.Vacant && selectedProperty.id !== tenant?.propertyId) {
            newErrors.propertyId = `Property "${selectedProperty.name}" is currently occupied.`;
        }
        
        if (formData.username?.trim()) {
            if (tenants.some(t => t.username === formData.username && t.id !== tenant?.id)) {
                newErrors.username = "This username is already taken.";
            }
        } else if (!tenant) { // Username required for new tenants
            newErrors.username = "Username is required for the tenant portal.";
        }

        if (password.trim()) {
            if (password.length < 6) {
                newErrors.password = "Password must be at least 6 characters long.";
            }
        } else if (!tenant) { // Password required for new tenants
            newErrors.password = "Password is required for new tenants.";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const finalPassword = password.trim() === '' ? undefined : password.trim();
        onSave({ id: tenant?.id || Date.now().toString(), ...formData } as Tenant, finalPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-2">Tenant Information</h3>
                 <div className="flex items-center gap-4 mb-4">
                    <img 
                        src={formData.profilePhoto || `https://i.pravatar.cc/150?u=${formData.fullName || 'default'}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    />
                    <div>
                        <label htmlFor="photo-upload" className="cursor-pointer bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-md text-sm font-medium">
                            Upload Photo
                        </label>
                        <input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                        <p className="text-xs text-text-secondary mt-2">Recommended: Square image (e.g., 200x200px)</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className={`w-full bg-secondary p-2 rounded border ${errors.fullName ? 'border-red-500' : 'border-border'}`} required />
                        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full bg-secondary p-2 rounded border border-border" />
                    <div>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className={`w-full bg-secondary p-2 rounded border ${errors.email ? 'border-red-500' : 'border-border'}`} />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full bg-secondary p-2 rounded border border-border" />
                    <div>
                        <input name="nin" value={formData.nin} onChange={handleChange} placeholder="Tenant NIN" className={`w-full bg-secondary p-2 rounded border ${errors.nin ? 'border-red-500' : 'border-border'}`} />
                         {errors.nin && <p className="text-red-400 text-xs mt-1">{errors.nin}</p>}
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">Guarantor Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input name="fullName" value={formData.guarantor?.fullName} onChange={(e) => handleChange(e, true)} placeholder="Guarantor Full Name" className={`w-full bg-secondary p-2 rounded border ${errors.guarantorfullName ? 'border-red-500' : 'border-border'}`} required />
                        {errors.guarantorfullName && <p className="text-red-400 text-xs mt-1">{errors.guarantorfullName}</p>}
                    </div>
                    <input name="phone" value={formData.guarantor?.phone} onChange={(e) => handleChange(e, true)} placeholder="Guarantor Phone" className="w-full bg-secondary p-2 rounded border border-border" />
                    <input name="address" value={formData.guarantor?.address} onChange={(e) => handleChange(e, true)} placeholder="Guarantor Address" className="w-full bg-secondary p-2 rounded border border-border" />
                    <div>
                        <input name="nin" value={formData.guarantor?.nin} onChange={(e) => handleChange(e, true)} placeholder="Guarantor NIN" className={`w-full bg-secondary p-2 rounded border ${errors.guarantornin ? 'border-red-500' : 'border-border'}`} />
                        {errors.guarantornin && <p className="text-red-400 text-xs mt-1">{errors.guarantornin}</p>}
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">Lease Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="md:col-span-2">
                        <select name="propertyId" value={formData.propertyId} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.propertyId ? 'border-red-500' : 'border-border'}`} required>
                            <option value="">Assign Property</option>
                            {assignableProperties.map(p => 
                                <option key={p.id} value={p.id}>
                                    {p.name} - ({p.status})
                                </option>
                            )}
                        </select>
                         {errors.propertyId && <p className="text-red-400 text-xs mt-1">{errors.propertyId}</p>}
                     </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Lease Start Date</label>
                        <input type="date" name="leaseStartDate" value={formData.leaseStartDate} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.leaseStartDate ? 'border-red-500' : 'border-border'}`} />
                        {errors.leaseStartDate && <p className="text-red-400 text-xs mt-1">{errors.leaseStartDate}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Lease End Date</label>
                        <input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.leaseEndDate ? 'border-red-500' : 'border-border'}`} />
                         {errors.leaseEndDate && <p className="text-red-400 text-xs mt-1">{errors.leaseEndDate}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Next Rent Due Date</label>
                        <input type="date" name="rentDueDate" value={formData.rentDueDate || ''} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.rentDueDate ? 'border-red-500' : 'border-border'}`} />
                        {errors.rentDueDate && <p className="text-red-400 text-xs mt-1">{errors.rentDueDate}</p>}
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">Login Credentials</h3>
                <p className="text-xs text-text-secondary mb-2">Create a username and password for the tenant to access their portal.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input name="username" value={formData.username || ''} onChange={handleChange} placeholder="Username (e.g., email)" className={`w-full bg-secondary p-2 rounded border ${errors.username ? 'border-red-500' : 'border-border'}`} />
                        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                    </div>
                    <div>
                        <input type="password" name="password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({...p, password: ''}))}} placeholder={tenant ? 'New Password (optional)' : 'Password'} className={`w-full bg-secondary p-2 rounded border ${errors.password ? 'border-red-500' : 'border-border'}`} />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">Tenant Notes</h3>
                <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    placeholder="Record any specific information about the tenant here..."
                    className="w-full bg-secondary p-2 rounded border border-border h-24"
                ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Tenant</button>
            </div>
        </form>
    );
};

const TenantDetailModal: React.FC<{
    tenant: Tenant;
    propertyName: string;
    onClose: () => void;
}> = ({ tenant, propertyName, onClose }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center border-b border-border pb-6">
                <img
                    src={tenant.profilePhoto || `https://i.pravatar.cc/150?u=${tenant.fullName}`}
                    alt={tenant.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary mb-4"
                />
                <h2 className="text-2xl font-bold text-text-primary">{tenant.fullName}</h2>
                <p className="text-text-secondary">
                    Tenant at <strong>{propertyName}</strong>
                </p>
                <div className="flex space-x-4 mt-2 text-sm text-text-secondary">
                    <span>{tenant.email || 'No Email'}</span>
                    <span>&bull;</span>
                    <span>{tenant.phone || 'No Phone'}</span>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Address:</strong> {tenant.address}</div>
                    <div><strong>NIN:</strong> {tenant.nin}</div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Lease Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Lease Start:</strong> {tenant.leaseStartDate}</div>
                    <div><strong>Lease End:</strong> {tenant.leaseEndDate}</div>
                    <div className="md:col-span-2"><strong>Next Rent Due:</strong> {tenant.rentDueDate}</div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Guarantor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Full Name:</strong> {tenant.guarantor.fullName}</div>
                    <div><strong>Phone:</strong> {tenant.guarantor.phone}</div>
                    <div><strong>Address:</strong> {tenant.guarantor.address}</div>
                    <div><strong>NIN:</strong> {tenant.guarantor.nin}</div>
                </div>
            </div>
            
            {tenant.notes && (
              <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Notes</h3>
                <p className="text-text-secondary italic bg-secondary p-3 rounded">{tenant.notes}</p>
              </div>
            )}
            
             <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        </div>
    );
};

const Tenants: React.FC<{
    tenants: Tenant[];
    properties: Property[];
    payments: Payment[];
    agents: Agent[];
    templates: NotificationTemplate[];
    setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    currentUser: User;
    roles: Role[];
    userHasPermission: (permission: Permission) => boolean;
    onPrintReceipt: (payment: Payment) => void;
    onSendSms: (tenant: Tenant, message: string) => { success: boolean, message: string };
    addAuditLog: (action: string, details: string, targetId?: string) => void;
}> = ({ tenants, properties, payments, agents, templates, setTenants, setPayments, setProperties, currentUser, roles, userHasPermission, onPrintReceipt, onSendSms, addAuditLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<Tenant | null>(null);
  const [selectedTenantForHistory, setSelectedTenantForHistory] = useState<Tenant | null>(null);
  const [selectedTenantForSms, setSelectedTenantForSms] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userRole = useMemo(() => roles.find(r => r.id === currentUser.roleId), [roles, currentUser.roleId]);
  const canManageTenantsGlobally = userHasPermission(Permission.MANAGE_TENANTS);
  const canManageOwnTenants = userRole?.name === 'Agent' && userHasPermission(Permission.AGENT_CAN_MANAGE_OWN_TENANTS);
  const canRecordOwnPayments = userRole?.name === 'Agent' && userHasPermission(Permission.AGENT_CAN_RECORD_PAYMENTS_FOR_OWN_TENANTS);
  const canManagePaymentsGlobally = userHasPermission(Permission.MANAGE_PAYMENTS);
  const canManageNotifications = userHasPermission(Permission.MANAGE_NOTIFICATIONS);
  const canViewOverdue = userHasPermission(Permission.VIEW_PAYMENTS);

  const agentHasVacantProperties = useMemo(() => {
    if (userRole?.name !== 'Agent') return true;
    return properties.some(p => p.agentId === currentUser.id && p.status === PropertyStatus.Vacant);
  }, [currentUser, properties, userRole]);

  // Computed value for the currently selected tenant to ensure we have the latest data from the tenants array
  const activeTenant = useMemo(() => {
    if (!selectedTenant) return null;
    return tenants.find(t => t.id === selectedTenant.id) || selectedTenant;
  }, [selectedTenant, tenants]);
  
  const filteredTenants = useMemo(() => {
      if (!searchQuery) {
          return tenants;
      }
      const lowercasedQuery = searchQuery.toLowerCase();
      return tenants.filter(tenant =>
          tenant.fullName.toLowerCase().includes(lowercasedQuery) ||
          (tenant.email && tenant.email.toLowerCase().includes(lowercasedQuery)) ||
          (tenant.phone && tenant.phone.includes(lowercasedQuery))
      );
  }, [tenants, searchQuery]);
  
  const tenantsWithPaymentStatus = useMemo(() => {
    return filteredTenants.map(tenant => {
        const property = properties.find(p => p.id === tenant.propertyId);
        if (!property) {
            return { ...tenant, totalDue: 0, rentDue: 0, depositDue: 0, rentStatus: 'N/A' as const };
        }

        const rentPaid = payments.filter(p => p.tenantId === tenant.id && p.paymentType === PaymentType.Rent).reduce((acc, p) => acc + p.amountPaid, 0);
        const rentDue = property.rentAmount - rentPaid;

        const depositPaid = payments.filter(p => p.tenantId === tenant.id && p.paymentType === PaymentType.Deposit).reduce((acc, p) => acc + p.amountPaid, 0);
        const depositDue = property.depositAmount - depositPaid;
        
        const totalDue = (rentDue > 0 ? rentDue : 0) + (depositDue > 0 ? depositDue : 0);

        const leaseHasStarted = new Date(tenant.leaseStartDate) <= new Date();
        if (!leaseHasStarted) {
            return { ...tenant, totalDue, rentDue, depositDue, rentStatus: 'Upcoming' as const };
        }

        if (totalDue > 0) {
            return { ...tenant, totalDue, rentDue, depositDue, rentStatus: 'Overdue' as const };
        } else {
            return { ...tenant, totalDue: 0, rentDue: 0, depositDue: 0, rentStatus: 'Paid' as const };
        }
    });
  }, [filteredTenants, properties, payments]);

  const overdueTenants = useMemo(() => {
    return tenantsWithPaymentStatus
        .filter(t => t.rentStatus === 'Overdue')
        .map(tenant => {
            const property = properties.find(p => p.id === tenant.propertyId);
            if (!property) return null;

            const leaseStartDate = new Date(tenant.leaseStartDate);
            const today = new Date();
            let daysOverdue = 0;
            if (today > leaseStartDate) {
                daysOverdue = Math.floor((today.getTime() - leaseStartDate.getTime()) / (1000 * 3600 * 24));
            }

            return {
                ...tenant,
                propertyName: property.name,
                daysOverdue,
            };
    }).filter(Boolean) as (typeof tenantsWithPaymentStatus[0] & { propertyName: string; daysOverdue: number; })[];
  }, [tenantsWithPaymentStatus, properties]);

  const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'N/A';
  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const getTenantName = (tenantId: string) => tenants.find(t => t.id === tenantId)?.fullName || 'N/A';
  
  const handleSave = (tenant: Tenant, password?: string) => {
    const isUpdating = !!selectedTenant;
    const oldPropertyId = selectedTenant?.propertyId;
    const newPropertyId = tenant.propertyId;

    let tenantToSave = { ...tenant };
    if (password) {
        tenantToSave.password = password; // In a real app, this should be hashed
    }

    if (isUpdating) {
        const oldTenant = tenants.find(t => t.id === tenant.id);
        if (!password && oldTenant) {
            tenantToSave.password = oldTenant.password;
        }

        setTenants(tenants.map(t => (t.id === tenant.id ? tenantToSave : t)));
        addAuditLog('UPDATED_TENANT', `Updated tenant: ${tenant.fullName}`, tenant.id);

        if (oldPropertyId && newPropertyId && oldPropertyId !== newPropertyId) {
            setProperties(prev =>
                prev.map(p => {
                    if (p.id === oldPropertyId) return { ...p, status: PropertyStatus.Vacant };
                    if (p.id === newPropertyId) return { ...p, status: PropertyStatus.Occupied };
                    return p;
                })
            );
        }
        setIsModalOpen(false);
        setSelectedTenant(null);
    } else {
        setTenants(prev => [...prev, tenantToSave]);
        addAuditLog('CREATED_TENANT', `Registered new tenant: ${tenant.fullName}`, tenant.id);
        setProperties(prev =>
            prev.map(p =>
                p.id === newPropertyId ? { ...p, status: PropertyStatus.Occupied } : p
            )
        );
        setIsModalOpen(false);
        setSelectedTenant(tenantToSave);
        setIsAgreementOpen(true);
    }
  };
  
  const handleDeleteTenant = () => {
    if (!tenantToDelete) return;

    const propertyToVacateId = tenantToDelete.propertyId;
    addAuditLog('DELETED_TENANT', `Deleted tenant: ${tenantToDelete.fullName}`, tenantToDelete.id);

    // Remove tenant
    setTenants(tenants.filter(t => t.id !== tenantToDelete.id));

    // Mark the vacated property as 'Vacant'
    if (propertyToVacateId) {
        setProperties(prev => 
            prev.map(p => 
                p.id === propertyToVacateId ? { ...p, status: PropertyStatus.Vacant } : p
            )
        );
    }
    
    // Note: Associated payments are kept for historical/auditing purposes.

    setIsConfirmModalOpen(false);
    setTenantToDelete(null);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsConfirmModalOpen(true);
  };

  const handleSavePayment = (payment: Payment) => {
    const property = properties.find(p => p.id === payment.propertyId);
    const paymentWithAgent = {
        ...payment,
        agentId: property ? property.agentId : undefined,
    };
    
    setPayments(prev => [...prev, paymentWithAgent]);
    addAuditLog('CREATED_PAYMENT', `Recorded payment of ${formatCurrency(payment.amountPaid)} for ${getTenantName(payment.tenantId)}`, payment.id);
    setIsPaymentModalOpen(false);
    setSelectedTenantForPayment(null);
  };

  const handleRecordPaymentClick = (tenant: Tenant) => {
    setSelectedTenantForPayment(tenant);
    setIsPaymentModalOpen(true);
  };

  const handleSendSmsClick = (tenant: Tenant) => {
    setSelectedTenantForSms(tenant);
    setIsSmsModalOpen(true);
  };
  
  const handleSaveSignature = (tenantId: string, signatureData: string, type: 'tenant' | 'management') => {
      setTenants(prev => prev.map(t => {
          if (t.id === tenantId) {
              return type === 'tenant' 
                  ? { ...t, tenantSignature: signatureData }
                  : { ...t, managementSignature: signatureData };
          }
          return t;
      }));
      const tenantName = tenants.find(t => t.id === tenantId)?.fullName;
      addAuditLog(
          type === 'tenant' ? 'TENANT_SIGNED_AGREEMENT' : 'MANAGEMENT_SIGNED_AGREEMENT',
          `Agreement signed for tenant ${tenantName}`,
          tenantId
      );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tenants</h2>
        {(canManageTenantsGlobally || canManageOwnTenants) && (
            <button 
                onClick={() => { setSelectedTenant(null); setIsModalOpen(true); }} 
                className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={canManageOwnTenants && !agentHasVacantProperties}
                title={canManageOwnTenants && !agentHasVacantProperties ? "You have no vacant properties to assign a tenant to." : "Register a new tenant"}
            >
              Register Tenant
            </button>
        )}
      </div>
      
      <div className="mb-6">
        <input
            type="text"
            placeholder="Search tenants by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-lg bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          />
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-x-auto mb-8">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Property</th>
              <th className="p-4">Balance Status</th>
              <th className="p-4">Lease End</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenantsWithPaymentStatus.map(tenant => {
              const property = properties.find(p => p.id === tenant.propertyId);
              return (
              <tr key={tenant.id} className="border-b border-border/50 hover:bg-secondary">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                        src={tenant.profilePhoto || `https://i.pravatar.cc/150?u=${tenant.fullName}`} 
                        alt={tenant.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <span>{tenant.fullName}</span>
                        {tenant.rentStatus === 'Overdue' && (
                          <span className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full inline-block" title={`Overdue: ₦${tenant.totalDue.toLocaleString()}`}></span>
                        )}
                    </div>
                  </div>
                </td>
                <td className="p-4">{getPropertyName(tenant.propertyId)}</td>
                <td className="p-4">
                  {tenant.rentStatus === 'Overdue' ? (
                      <div className="flex flex-col">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 self-start">Overdue</span>
                          <span className="text-xs text-text-secondary mt-1">Total: ₦{tenant.totalDue.toLocaleString()}</span>
                          {tenant.rentDue > 0 && <span className="text-xs text-red-400/80">Rent: ₦{tenant.rentDue.toLocaleString()}</span>}
                          {tenant.depositDue > 0 && <span className="text-xs text-yellow-400/80">Deposit: ₦{tenant.depositDue.toLocaleString()}</span>}
                      </div>
                  ) : tenant.rentStatus === 'Paid' ? (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400`}>
                          Paid
                      </span>
                  ) : (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400`}>
                          {tenant.rentStatus}
                      </span>
                  )}
                </td>
                <td className="p-4">{tenant.leaseEndDate}</td>
                <td className="p-4 space-x-2 whitespace-nowrap">
                  <button onClick={() => { setSelectedTenant(tenant); setIsDetailModalOpen(true); }} className="text-cyan-400 hover:text-cyan-300">View</button>
                  
                  {(canManageTenantsGlobally || (canManageOwnTenants && property?.agentId === currentUser.id)) && (
                    <button onClick={() => { setSelectedTenant(tenant); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                  )}
                  {canManageTenantsGlobally && (
                    <button onClick={() => handleDeleteClick(tenant)} className="text-red-400 hover:text-red-300">Delete</button>
                  )}
                  
                  <button onClick={() => { setSelectedTenant(tenant); setIsAgreementOpen(true); }} className="text-green-400 hover:text-green-300">Agreement</button>
                  <button onClick={() => { setSelectedTenantForHistory(tenant); setIsHistoryModalOpen(true); }} className="text-yellow-400 hover:text-yellow-300">History</button>
                  
                  {(canManagePaymentsGlobally || (canRecordOwnPayments && property?.agentId === currentUser.id)) && (
                     <button onClick={() => handleRecordPaymentClick(tenant)} className="text-green-400 hover:text-green-300">Record Payment</button>
                  )}
                  {canManageNotifications && (
                    <button onClick={() => handleSendSmsClick(tenant)} className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                      {ICONS.sms} Send SMS
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {canViewOverdue && overdueTenants.length > 0 && (
          <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Overdue Payments</h3>
              <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="border-b border-border">
                          <tr>
                              <th className="p-4">Tenant</th>
                              <th className="p-4">Property</th>
                              <th className="p-4">Total Due</th>
                              <th className="p-4">Days Since Lease Start</th>
                              <th className="p-4">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {overdueTenants.map(tenant => {
                            const property = properties.find(p => p.id === tenant.propertyId);
                            return (
                              <tr key={tenant.id} className="border-b border-border/50 hover:bg-secondary">
                                  <td className="p-4">{tenant.fullName}</td>
                                  <td className="p-4">{tenant.propertyName}</td>
                                  <td className="p-4 text-red-400">
                                      <div className="flex flex-col">
                                        <span>₦{tenant.totalDue.toLocaleString()}</span>
                                        {tenant.rentDue > 0 && <span className="text-xs text-red-400/80">Rent: ₦{tenant.rentDue.toLocaleString()}</span>}
                                        {tenant.depositDue > 0 && <span className="text-xs text-yellow-400/80">Deposit: ₦{tenant.depositDue.toLocaleString()}</span>}
                                      </div>
                                  </td>
                                  <td className="p-4">{tenant.daysOverdue} days</td>
                                  <td className="p-4">
                                     {(canManagePaymentsGlobally || (canRecordOwnPayments && property?.agentId === currentUser.id)) && (
                                          <button onClick={() => handleRecordPaymentClick(tenant)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                                              Record Payment
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          )})}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTenant ? 'Edit Tenant' : 'Register New Tenant'}>
        <TenantForm 
            tenant={activeTenant} 
            properties={properties} 
            tenants={tenants} 
            onSave={handleSave} 
            onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Tenant Details`}>
        {activeTenant && (
            <TenantDetailModal
                tenant={activeTenant}
                propertyName={getPropertyName(activeTenant.propertyId)}
                onClose={() => setIsDetailModalOpen(false)}
            />
        )}
      </Modal>

      <Modal isOpen={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} title="Tenancy Agreement">
          {activeTenant && (
              <TenancyAgreement
                  tenant={activeTenant}
                  property={properties.find(p => p.id === activeTenant.propertyId)!}
                  currentUser={currentUser}
                  onSaveTenantSignature={(sig) => handleSaveSignature(activeTenant.id, sig, 'tenant')}
                  onSaveManagementSignature={(sig) => handleSaveSignature(activeTenant.id, sig, 'management')}
                  onClose={() => setIsAgreementOpen(false)}
                  companyName="EstateFlow Inc."
              />
          )}
      </Modal>


      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        {selectedTenantForPayment && (
            <PaymentForm
                payment={{ tenantId: selectedTenantForPayment.id, propertyId: selectedTenantForPayment.propertyId, paymentType: PaymentType.Rent }}
                tenants={tenants}
                properties={properties}
                payments={payments}
                onSave={handleSavePayment}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        )}
      </Modal>
      
       <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Payment History for ${selectedTenantForHistory?.fullName}`}>
        <PaymentHistoryModal
            tenant={selectedTenantForHistory}
            payments={payments}
            properties={properties}
            agents={agents}
            onClose={() => setIsHistoryModalOpen(false)}
            onPrintReceipt={onPrintReceipt}
        />
    </Modal>
    <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteTenant}
        title="Confirm Tenant Deletion"
        message={`Are you sure you want to delete ${tenantToDelete?.fullName}? This will also mark their property as vacant.`}
      />
    <SmsModal 
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        tenant={selectedTenantForSms}
        templates={templates}
        onSend={onSendSms}
    />
    </div>
  );
};

export default Tenants;
