
import React, { useState } from 'react';
import { Role, Permission, User, Department, Property, Agent, ApiKeys, NotificationTemplate, TemplateType, Notification, NotificationType, ManualPaymentDetails, AuditLogEntry, LandingPageConfig } from '../types';
import { ALL_PERMISSIONS } from '../constants';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import TemplateManager from '../components/TemplateManager';
import CommunicationForm from '../components/CommunicationForm';
import LandingPageEditor from '../components/LandingPageEditor';


interface RoleFormProps {
    role: Partial<Role> | null;
    onSave: (role: Role) => void;
    onClose: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onClose }) => {
    const [name, setName] = useState(role?.name || '');
    const [permissions, setPermissions] = useState<Set<Permission>>(new Set(role?.permissions || []));
    const [error, setError] = useState('');

    const generalPermissions = ALL_PERMISSIONS.filter(p => !p.isAgentSpecific);
    const agentPermissions = ALL_PERMISSIONS.filter(p => p.isAgentSpecific);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        const newPermissions = new Set(permissions);
        if (checked) {
            newPermissions.add(permission);
        } else {
            newPermissions.delete(permission);
        }
        setPermissions(newPermissions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Role name is required.');
            return;
        }
        setError('');
        onSave({
            id: role?.id || Date.now().toString(),
            name,
            permissions: Array.from(permissions),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="roleName" className="block text-sm font-medium text-text-secondary mb-1">Role Name</label>
                <input
                    id="roleName"
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    className={`w-full bg-secondary p-2 rounded border ${error ? 'border-red-500' : 'border-border'}`}
                    required
                />
                 {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
            <div>
                <h4 className="text-md font-semibold mb-2">General Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-2 bg-secondary rounded mb-4">
                    {generalPermissions.map(p => (
                        <label key={p.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={permissions.has(p.id)}
                                onChange={e => handlePermissionChange(p.id, e.target.checked)}
                                className="form-checkbox h-4 w-4 text-primary bg-secondary border-border rounded focus:ring-primary"
                            />
                            <span>{p.label}</span>
                        </label>
                    ))}
                </div>
                 <h4 className="text-md font-semibold mb-2">Agent-Specific Permissions</h4>
                <p className="text-xs text-text-secondary mb-2">These permissions apply only to users with the 'Agent' role, granting them control over properties/tenants assigned to them.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-2 bg-secondary rounded">
                    {agentPermissions.map(p => (
                        <label key={p.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={permissions.has(p.id)}
                                onChange={e => handlePermissionChange(p.id, e.target.checked)}
                                className="form-checkbox h-4 w-4 text-primary bg-secondary border-border rounded focus:ring-primary"
                            />
                            <span>{p.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Role</button>
            </div>
        </form>
    );
};

const DepartmentForm: React.FC<{
    department: Partial<Department> | null;
    onSave: (department: Department) => void;
    onClose: () => void;
}> = ({ department, onSave, onClose }) => {
    const [name, setName] = useState(department?.name || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) {
            setError('Department name is required.');
            return;
        }
        setError('');
        onSave({
            id: department?.id || Date.now().toString(),
            name,
        });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="deptName" className="block text-sm font-medium text-text-secondary mb-1">Department Name</label>
                <input id="deptName" type="text" value={name} onChange={e => { setName(e.target.value); setError('') }} className={`w-full bg-secondary p-2 rounded border ${error ? 'border-red-500' : 'border-border'}`} required/>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Department</button>
            </div>
        </form>
    );
}

const ApiCredentialInput: React.FC<{ label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }> = ({ label, value, name, onChange, type = 'password' }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <div className="relative">
                <input
                    type={isVisible ? 'text' : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-secondary p-2 rounded border border-border pr-10"
                />
                <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary hover:text-text-primary"
                >
                    {isVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.018 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.018 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

interface SettingsProps {
    leaseEndReminderDays: string;
    setLeaseEndReminderDays: (days: string) => void;
    userHasPermission: (permission: Permission) => boolean;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    users: User[];
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    properties: Property[];
    agents: Agent[];
    apiKeys: ApiKeys;
    setApiKeys: React.Dispatch<React.SetStateAction<ApiKeys>>;
    templates: NotificationTemplate[];
    setTemplates: React.Dispatch<React.SetStateAction<NotificationTemplate[]>>;
    onSendGlobalNotification: (target: 'all' | 'staff' | 'tenants', type: 'sms' | 'email' | 'in-app', message: string, subject?: string) => void;
    manualPaymentDetails: ManualPaymentDetails;
    setManualPaymentDetails: React.Dispatch<React.SetStateAction<ManualPaymentDetails>>;
    addAuditLog: (action: string, details: string, targetId?: string) => void;
    landingPageConfig: LandingPageConfig;
    setLandingPageConfig: (config: LandingPageConfig) => void;
    branding: {
        platformName: string;
        companyEmail: string;
        companyPhone: string;
        companyAddress: string;
        currency: string;
        logoUrl: string;
    };
    setBranding: {
        setPlatformName: (v: string) => void;
        setCompanyEmail: (v: string) => void;
        setCompanyPhone: (v: string) => void;
        setCompanyAddress: (v: string) => void;
        setCurrency: (v: string) => void;
        setLogoUrl: (v: string) => void;
    };
}

const Settings: React.FC<SettingsProps> = ({ leaseEndReminderDays, setLeaseEndReminderDays, userHasPermission, roles, setRoles, users, departments, setDepartments, properties, agents, apiKeys, setApiKeys, templates, setTemplates, onSendGlobalNotification, manualPaymentDetails, setManualPaymentDetails, addAuditLog, landingPageConfig, setLandingPageConfig, branding, setBranding }) => {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [activeTab, setActiveTab] = useState('general');

    const [isRoleConfirmOpen, setIsRoleConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
    const [isDeptConfirmOpen, setIsDeptConfirmOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const canManageSettings = userHasPermission(Permission.MANAGE_SETTINGS);
    const canManageRoles = userHasPermission(Permission.MANAGE_ROLES);
    const canManageCommunications = userHasPermission(Permission.MANAGE_COMMUNICATIONS);
    // Determine if the current user is the Platform Owner
    const isPlatformOwner = userHasPermission(Permission.VIEW_PLATFORM_DASHBOARD);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setApiKeys(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBranding.setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveRole = (role: Role) => {
        if (selectedRole) {
            setRoles(roles.map(r => r.id === role.id ? role : r));
            addAuditLog('UPDATED_ROLE', `Updated role: ${role.name}`, role.id);
        } else {
            setRoles([...roles, role]);
            addAuditLog('CREATED_ROLE', `Created new role: ${role.name}`, role.id);
        }
        setIsRoleModalOpen(false);
        setSelectedRole(null);
    };

    const handleDeleteRoleClick = (roleId: string) => {
        const isRoleInUse = users.some(u => u.roleId === roleId);
        if (isRoleInUse) {
            alert("Cannot delete role. It is currently assigned to one or more users.");
            return;
        }
        setRoleToDelete(roleId);
        setIsRoleConfirmOpen(true);
    };

    const confirmDeleteRole = () => {
        if (!roleToDelete) return;
        const role = roles.find(r => r.id === roleToDelete);
        if(role) {
            addAuditLog('DELETED_ROLE', `Deleted role: ${role.name}`, role.id);
        }
        setRoles(roles.filter(r => r.id !== roleToDelete));
        setIsRoleConfirmOpen(false);
        setRoleToDelete(null);
    };

    const handleSaveDepartment = (department: Department) => {
        if (selectedDept) {
            setDepartments(departments.map(d => d.id === department.id ? department : d));
            addAuditLog('UPDATED_DEPARTMENT', `Updated department: ${department.name}`, department.id);
        } else {
            setDepartments([...departments, department]);
            addAuditLog('CREATED_DEPARTMENT', `Created new department: ${department.name}`, department.id);
        }
        setIsDeptModalOpen(false);
        setSelectedDept(null);
    }
    
    const handleDeleteDepartmentClick = (departmentId: string) => {
        const isDeptInUse = properties.some(p => p.departmentId === departmentId) || agents.some(a => a.departmentId === departmentId);
        if (isDeptInUse) {
            alert("Cannot delete department. It is currently assigned to properties or agents.");
            return;
        }
        setDeptToDelete(departmentId);
        setIsDeptConfirmOpen(true);
    };

     const confirmDeleteDepartment = () => {
        if(!deptToDelete) return;
        const dept = departments.find(d => d.id === deptToDelete);
        if (dept) {
            addAuditLog('DELETED_DEPARTMENT', `Deleted department: ${dept.name}`, dept.id);
        }
        setDepartments(departments.filter(d => d.id !== deptToDelete));
        setIsDeptConfirmOpen(false);
        setDeptToDelete(null);
    };

    const handleManualPaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setManualPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleResetData = () => {
        addAuditLog('RESET_APP_DATA', 'User triggered full application data reset.');
        localStorage.removeItem('estateFlowData');
        window.location.reload();
    };

    const handleLandingPageSave = (newConfig: LandingPageConfig) => {
        setLandingPageConfig(newConfig);
        addAuditLog('UPDATED_LANDING_PAGE', 'Updated landing page configuration.');
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            <div className="flex border-b border-border mb-6">
                <button onClick={() => setActiveTab('general')} className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}>General</button>
                {canManageSettings && <button onClick={() => setActiveTab('landing')} className={`px-4 py-2 font-medium ${activeTab === 'landing' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Landing Page</button>}
            </div>

            {activeTab === 'landing' && canManageSettings ? (
                <LandingPageEditor config={landingPageConfig} onSave={handleLandingPageSave} />
            ) : (
                <div className="space-y-8 max-w-4xl">
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4">Company Branding & Profile</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
                                    <input type="text" value={branding.platformName} onChange={e => setBranding.setPlatformName(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Currency</label>
                                    <select value={branding.currency} onChange={e => setBranding.setCurrency(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                                        <option value="NGN">NGN (₦)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="GHS">GHS (₵)</option>
                                        <option value="KES">KES (KSh)</option>
                                        <option value="ZAR">ZAR (R)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Company Logo</label>
                                <div className="flex items-center gap-4">
                                    {branding.logoUrl && (
                                        <img src={branding.logoUrl} alt="Company Logo" className="h-16 w-auto border border-border rounded p-1 bg-white" />
                                    )}
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Company Email</label>
                                <input type="text" value={branding.companyEmail} onChange={e => setBranding.setCompanyEmail(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Company Phone Numbers</label>
                                <input type="text" value={branding.companyPhone} onChange={e => setBranding.setCompanyPhone(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" placeholder="e.g., 08012345678, 09087654321"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Company Address</label>
                                <input type="text" value={branding.companyAddress} onChange={e => setBranding.setCompanyAddress(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" />
                            </div>
                        </div>
                    </div>

                    {/* Hide Department Management from Platform Owner */}
                    {canManageSettings && !isPlatformOwner && (
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Department Management</h3>
                                <button onClick={() => { setSelectedDept(null); setIsDeptModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
                                    Add Department
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                    <thead className="border-b border-border">
                                        <tr>
                                            <th className="p-3">Department Name</th>
                                            <th className="p-3">Properties</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.map(dept => (
                                            <tr key={dept.id} className="border-b border-border/50">
                                                <td className="p-3 font-semibold">{dept.name}</td>
                                                <td className="p-3">{properties.filter(p => p.departmentId === dept.id).length}</td>
                                                <td className="p-3 space-x-4">
                                                    <button onClick={() => { setSelectedDept(dept); setIsDeptModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                                                    <button onClick={() => handleDeleteDepartmentClick(dept.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                            </table>
                            </div>
                        </div>
                    )}
                    {canManageRoles && (
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Role Management</h3>
                                <button onClick={() => { setSelectedRole(null); setIsRoleModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
                                    Add New Role
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                    <thead className="border-b border-border">
                                        <tr>
                                            <th className="p-3">Role Name</th>
                                            <th className="p-3">Users</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map(role => (
                                            <tr key={role.id} className="border-b border-border/50">
                                                <td className="p-3 font-semibold">{role.name}</td>
                                                <td className="p-3">{users.filter(u => u.roleId === role.id).length}</td>
                                                <td className="p-3 space-x-4">
                                                    <button onClick={() => { setSelectedRole(role); setIsRoleModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                                                    {role.name !== 'Super Admin' && (
                                                        <button onClick={() => handleDeleteRoleClick(role.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                            </table>
                            </div>
                        </div>
                    )}

                    {/* Hide Manual Payment Gateway from Platform Owner */}
                    {canManageSettings && !isPlatformOwner && (
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold mb-4">Manual Payment Gateway Settings</h3>
                            <p className="text-sm text-text-secondary mb-4">Enter the bank account details that tenants will use for manual bank transfers. This information will be displayed to them when they choose this payment option.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Bank Name</label>
                                    <input type="text" name="bankName" value={manualPaymentDetails.bankName} onChange={handleManualPaymentDetailsChange} className="w-full bg-secondary p-2 rounded border border-border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Account Name</label>
                                    <input type="text" name="accountName" value={manualPaymentDetails.accountName} onChange={handleManualPaymentDetailsChange} className="w-full bg-secondary p-2 rounded border border-border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Account Number</label>
                                    <input type="text" name="accountNumber" value={manualPaymentDetails.accountNumber} onChange={handleManualPaymentDetailsChange} className="w-full bg-secondary p-2 rounded border border-border" />
                                </div>
                            </div>
                        </div>
                    )}

                    {canManageCommunications && (
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold mb-4">Communications</h3>
                            <CommunicationForm templates={templates} onSend={onSendGlobalNotification} />
                        </div>
                    )}
                    {canManageCommunications && (
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold mb-4">Notification Templates</h3>
                            <TemplateManager templates={templates} setTemplates={setTemplates} />
                        </div>
                    )}

                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4">API & Integration Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">SMS Provider (Twilio)</h4>
                                <div className="p-4 bg-secondary rounded-lg space-y-3">
                                    <ApiCredentialInput label="Twilio Account SID" value={apiKeys.twilioSid} name="twilioSid" onChange={handleApiKeyChange} />
                                    <ApiCredentialInput label="Twilio Auth Token" value={apiKeys.twilioToken} name="twilioToken" onChange={handleApiKeyChange} />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">Push Notifications (Firebase)</h4>
                                <div className="p-4 bg-secondary rounded-lg space-y-3">
                                <ApiCredentialInput label="Firebase Server Key" value={apiKeys.firebaseKey} name="firebaseKey" onChange={handleApiKeyChange} />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">Payment Gateways</h4>
                                <div className="p-4 bg-secondary rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ApiCredentialInput label="Paystack Secret Key" value={apiKeys.paystackKey} name="paystackKey" onChange={handleApiKeyChange} />
                                <ApiCredentialInput label="Flutterwave Secret Key" value={apiKeys.flutterwaveKey} name="flutterwaveKey" onChange={handleApiKeyChange} />
                                <ApiCredentialInput label="Monnify Secret Key" value={apiKeys.monnifyKey} name="monnifyKey" onChange={handleApiKeyChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hide Notification Settings from Platform Owner */}
                    {canManageSettings && !isPlatformOwner && (
                        <div className="bg-card p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="reminderDays" className="block text-sm font-medium text-text-secondary mb-1">Lease End Reminder Days</label>
                                    <input 
                                        id="reminderDays"
                                        type="text" 
                                        value={leaseEndReminderDays} 
                                        onChange={e => setLeaseEndReminderDays(e.target.value)} 
                                        className="w-full bg-secondary p-2 rounded border border-border" 
                                        placeholder="e.g., 90, 60, 30"
                                    />
                                    <p className="text-xs text-text-secondary mt-1">Enter days before lease expiry, separated by commas.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {canManageSettings && (
                        <div className="bg-card p-6 rounded-lg shadow-lg border border-red-900/30">
                            <h3 className="text-lg font-bold text-red-400 mb-4">System Actions</h3>
                            <p className="text-sm text-text-secondary mb-4">Be careful with these actions. Resetting data is irreversible and will restore the application to its initial demo state.</p>
                            <button
                                onClick={() => setIsResetConfirmOpen(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Reset Application Data
                            </button>
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <button className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Settings</button>
                    </div>
                </div>
            )}

            <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={selectedRole ? 'Edit Role' : 'Add New Role'}>
                <RoleForm role={selectedRole} onSave={handleSaveRole} onClose={() => setIsRoleModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={selectedDept ? 'Edit Department' : 'Add New Department'}>
                <DepartmentForm department={selectedDept} onSave={handleSaveDepartment} onClose={() => setIsDeptModalOpen(false)} />
            </Modal>

            <ConfirmationModal
                isOpen={isRoleConfirmOpen}
                onClose={() => setIsRoleConfirmOpen(false)}
                onConfirm={confirmDeleteRole}
                title="Confirm Role Deletion"
                message="Are you sure you want to delete this role? This action cannot be undone."
            />

            <ConfirmationModal
                isOpen={isDeptConfirmOpen}
                onClose={() => setIsDeptConfirmOpen(false)}
                onConfirm={confirmDeleteDepartment}
                title="Confirm Department Deletion"
                message="Are you sure you want to delete this department? This action cannot be undone."
            />

            <ConfirmationModal
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                onConfirm={handleResetData}
                title="Confirm Data Reset"
                message="Are you sure you want to reset all application data? This action is permanent and will restore the application to its initial state."
            />
        </div>
    );
};

export default Settings;
