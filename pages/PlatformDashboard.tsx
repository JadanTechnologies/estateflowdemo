
import React, { useState } from 'react';
import { User, Role, LandingPageConfig, LandingPagePricingPlan, PlatformConfig, NotificationTemplate, ManualPaymentDetails } from '../types';
import DashboardCard from '../components/DashboardCard';
import { ICONS } from '../constants';
import UserForm from '../components/UserForm';
import Modal from '../components/Modal';
import CommunicationForm from '../components/CommunicationForm';
import TemplateManager from '../components/TemplateManager';

interface PlatformDashboardProps {
    users: User[];
    roles: Role[];
    landingPageConfig: LandingPageConfig;
    platformConfig: PlatformConfig;
    onSaveLandingPageConfig: (config: LandingPageConfig) => void;
    onSavePlatformConfig: (config: PlatformConfig) => void;
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
    onDeleteUser: (userId: string) => void;
    onAddStaffUser: (user: User, password?: string) => void;
    templates: NotificationTemplate[];
    setTemplates: React.Dispatch<React.SetStateAction<NotificationTemplate[]>>;
    onSendGlobalNotification: (target: 'all' | 'staff' | 'tenants', type: 'sms' | 'email' | 'in-app', message: string, subject?: string) => void;
}

const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ users, roles, landingPageConfig, platformConfig, onSaveLandingPageConfig, onSavePlatformConfig, onUpdateUser, onDeleteUser, onAddStaffUser, templates, setTemplates, onSendGlobalNotification }) => {
    const [activeSection, setActiveSection] = useState<'overview' | 'businesses' | 'staff' | 'config' | 'communications' | 'templates' | 'settings'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<LandingPagePricingPlan> | null>(null);
    
    // Modal States for Dashboard Cards
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
    const [userListTitle, setUserListTitle] = useState('');
    const [userListFilter, setUserListFilter] = useState<(u: User) => boolean>(() => () => false);

    // Role Filters
    const superAdminRole = roles.find(r => r.name === 'Super Admin');
    const platformOwnerRole = roles.find(r => r.name === 'Platform Owner');
    
    // Data Segregation
    const businessAdmins = users.filter(u => u.roleId === superAdminRole?.id);
    const staffUsers = users.filter(u => u.roleId !== superAdminRole?.id); 

    // KPIs
    const totalBusinesses = businessAdmins.length;
    const activeSubscriptions = businessAdmins.filter(u => u.subscriptionStatus === 'Active').length;
    const trialUsers = businessAdmins.filter(u => u.subscriptionStatus === 'Trial').length;
    
    // Mock Revenue Calculation
    const monthlyRevenue = businessAdmins.reduce((sum, u) => {
        const plan = landingPageConfig.pricing.plans.find(p => p.name === u.subscriptionPlan);
        const price = plan ? parseInt(plan.price.replace(/[^0-9]/g, '')) : 0;
        return sum + (isNaN(price) ? 0 : price);
    }, 0);

    // --- Handlers ---

    const handleCardClick = (title: string, filter: (u: User) => boolean) => {
        setUserListTitle(title);
        setUserListFilter(() => filter);
        setIsUserListModalOpen(true);
    };

    const handlePlanSave = (plan: LandingPagePricingPlan) => {
        const updatedPlans = editingPlan && landingPageConfig.pricing.plans.find(p => p.id === plan.id)
            ? landingPageConfig.pricing.plans.map(p => p.id === plan.id ? plan : p)
            : [...landingPageConfig.pricing.plans, plan];
        
        onSaveLandingPageConfig({
            ...landingPageConfig,
            pricing: { ...landingPageConfig.pricing, plans: updatedPlans }
        });
        setIsPlanModalOpen(false);
        setEditingPlan(null);
    };

    const handleDeletePlan = (planId: string) => {
        if(window.confirm("Are you sure you want to delete this plan?")) {
            const updatedPlans = landingPageConfig.pricing.plans.filter(p => p.id !== planId);
            onSaveLandingPageConfig({
                ...landingPageConfig,
                pricing: { ...landingPageConfig.pricing, plans: updatedPlans }
            });
        }
    };

    const handleTrialDurationChange = (days: number) => {
        onSavePlatformConfig({ ...platformConfig, defaultTrialDurationDays: days });
    };

    const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onSavePlatformConfig({
            ...platformConfig,
            subscriptionBankDetails: {
                ...(platformConfig.subscriptionBankDetails || { bankName: '', accountName: '', accountNumber: '' }),
                [name]: value
            }
        });
    };

    const toggleUserStatus = (user: User) => {
        onUpdateUser(user.id, { status: user.status === 'Active' ? 'Suspended' : 'Active' });
    };

    // Filter roles for Platform Staff only (exclude Tenant roles and Super Admin)
    const platformRoles = roles.filter(r => 
        r.name !== 'Super Admin' && 
        r.name !== 'Property Manager' && 
        r.name !== 'Agent' && 
        r.name !== 'Accountant'
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Platform Administration</h2>
            </div>

            {/* Top Navigation Tabs */}
            <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveSection('overview')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Overview</button>
                <button onClick={() => setActiveSection('businesses')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'businesses' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Businesses</button>
                <button onClick={() => setActiveSection('staff')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'staff' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Platform Staff</button>
                <button onClick={() => setActiveSection('communications')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'communications' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Communication</button>
                <button onClick={() => setActiveSection('templates')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'templates' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Templates</button>
                <button onClick={() => setActiveSection('config')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'config' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Plans & Config</button>
                <button onClick={() => setActiveSection('settings')} className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeSection === 'settings' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Payment Settings</button>
            </div>

            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <DashboardCard 
                            title="Total Revenue" 
                            value={`₦${monthlyRevenue.toLocaleString()}`} 
                            subValue="Monthly Recurring" 
                            icon={ICONS.payments} 
                            colorClass="bg-green-600" 
                        />
                        <DashboardCard 
                            title="Total Businesses" 
                            value={totalBusinesses} 
                            subValue={`${trialUsers} on Trial`} 
                            icon={ICONS.properties} 
                            colorClass="bg-blue-600"
                            onClick={() => handleCardClick('Registered Businesses', (u) => u.roleId === superAdminRole?.id)} 
                        />
                        <DashboardCard 
                            title="Trial Users" 
                            value={trialUsers} 
                            subValue="On Free Plan" 
                            icon={ICONS.reports} 
                            colorClass="bg-yellow-600"
                            onClick={() => handleCardClick('Trial Users', (u) => u.roleId === superAdminRole?.id && u.subscriptionStatus === 'Trial')}
                        />
                        <DashboardCard 
                            title="Total Staff" 
                            value={staffUsers.length} 
                            subValue="Platform Team" 
                            icon={ICONS.users} 
                            colorClass="bg-purple-600"
                            onClick={() => handleCardClick('Platform Staff', (u) => u.roleId !== superAdminRole?.id)}
                        />
                    </div>
                </div>
            )}

            {/* BUSINESS MANAGEMENT SECTION */}
            {activeSection === 'businesses' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Tenant Businesses</h3>
                        <input 
                            type="text" 
                            placeholder="Search businesses..." 
                            className="bg-card p-2 rounded border border-border w-64 focus:ring-1 focus:ring-primary focus:outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-card rounded-lg shadow overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-secondary border-b border-border text-text-secondary">
                                <tr>
                                    <th className="p-4">Business Name</th>
                                    <th className="p-4">Admin Email</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Expiry</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {businessAdmins.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(admin => (
                                    <tr key={admin.id} className="hover:bg-secondary/20">
                                        <td className="p-4 font-medium">
                                            <div>{admin.name}</div>
                                            {admin.businessProfile && <div className="text-xs text-text-secondary">{admin.businessProfile.country} • {admin.businessProfile.currency}</div>}
                                        </td>
                                        <td className="p-4 text-sm text-text-secondary">{admin.username}</td>
                                        <td className="p-4"><span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs border border-blue-700">{admin.subscriptionPlan}</span></td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${admin.subscriptionStatus === 'Active' ? 'bg-green-900 text-green-200' : admin.subscriptionStatus === 'Trial' ? 'bg-yellow-900 text-yellow-200' : 'bg-red-900 text-red-200'}`}>
                                                {admin.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">{admin.subscriptionExpiry}</td>
                                        <td className="p-4 space-x-2">
                                            <button onClick={() => toggleUserStatus(admin)} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                                                {admin.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                            <button onClick={() => onDeleteUser(admin.id)} className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* STAFF MANAGEMENT SECTION */}
            {activeSection === 'staff' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Platform Staff</h3>
                        <button onClick={() => setIsStaffModalOpen(true)} className="bg-primary hover:bg-primary-hover px-4 py-2 rounded font-bold text-white">Add Staff Member</button>
                    </div>
                    <p className="text-text-secondary">Manage internal team members who help run the platform (Support, Content, Sales).</p>
                    <div className="bg-card rounded-lg shadow overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary border-b border-border text-text-secondary">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {staffUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-secondary/20">
                                        <td className="p-4">{user.name}</td>
                                        <td className="p-4 text-sm text-text-secondary">{user.username}</td>
                                        <td className="p-4">{roles.find(r => r.id === user.roleId)?.name}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{user.status}</span></td>
                                        <td className="p-4 space-x-2">
                                            {user.roleId !== platformOwnerRole?.id && (
                                                <>
                                                    <button onClick={() => toggleUserStatus(user)} className="text-yellow-400 text-sm hover:underline">{user.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                                                    <button onClick={() => onDeleteUser(user.id)} className="text-red-400 text-sm hover:underline">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COMMUNICATIONS CENTER */}
            {activeSection === 'communications' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold">Global Communication Center</h3>
                    <p className="text-text-secondary">Broadcast system-wide messages to all businesses or internal platform staff.</p>
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <CommunicationForm templates={templates} onSend={onSendGlobalNotification} />
                    </div>
                </div>
            )}

            {/* TEMPLATE MANAGER */}
            {activeSection === 'templates' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold">Global System Notification Templates</h3>
                    <p className="text-text-secondary">Manage the default templates available for system notifications. These are distinct from tenant-specific templates.</p>
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <TemplateManager templates={templates} setTemplates={setTemplates} />
                    </div>
                </div>
            )}

            {/* PAYMENT SETTINGS */}
            {activeSection === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold">Payment Settings</h3>
                    <p className="text-text-secondary">Configure how the platform receives subscription payments from business clients.</p>
                    
                    <div className="bg-card p-6 rounded-lg border border-border max-w-xl">
                        <h3 className="text-lg font-bold mb-4">Subscription Bank Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Bank Name</label>
                                <input 
                                    name="bankName" 
                                    value={platformConfig.subscriptionBankDetails?.bankName || ''} 
                                    onChange={handleBankDetailsChange}
                                    className="w-full bg-secondary p-2 rounded border border-border" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Account Name</label>
                                <input 
                                    name="accountName" 
                                    value={platformConfig.subscriptionBankDetails?.accountName || ''} 
                                    onChange={handleBankDetailsChange}
                                    className="w-full bg-secondary p-2 rounded border border-border" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Account Number</label>
                                <input 
                                    name="accountNumber" 
                                    value={platformConfig.subscriptionBankDetails?.accountNumber || ''} 
                                    onChange={handleBankDetailsChange}
                                    className="w-full bg-secondary p-2 rounded border border-border" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SYSTEM CONFIGURATION SECTION */}
            {activeSection === 'config' && (
                <div className="space-y-8 animate-fade-in">
                    <h3 className="text-xl font-bold">System Configuration</h3>
                    
                    {/* Trial Settings */}
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <h4 className="text-lg font-bold mb-4">Trial Management</h4>
                        <div className="flex items-center gap-4">
                            <label className="text-text-secondary">Global Trial Duration (Days):</label>
                            <input 
                                type="number" 
                                value={platformConfig.defaultTrialDurationDays} 
                                onChange={e => handleTrialDurationChange(Number(e.target.value))}
                                className="bg-secondary p-2 rounded border border-border w-24 text-center"
                            />
                            <span className="text-sm text-text-secondary">New signups will get this many days free.</span>
                        </div>
                    </div>

                    {/* Pricing Plans */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-bold">Pricing Plans & Feature Gating</h4>
                            <button onClick={() => { setEditingPlan({}); setIsPlanModalOpen(true); }} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold text-white">Create New Plan</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {landingPageConfig.pricing.plans.map(plan => (
                                <div key={plan.id} className={`bg-card p-6 rounded-lg border ${plan.highlighted ? 'border-primary shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'border-border'} relative`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold">{plan.name}</h4>
                                            <p className="text-2xl font-extrabold text-primary">{plan.price}<span className="text-sm text-text-secondary">{plan.period}</span></p>
                                        </div>
                                        {plan.highlighted && <span className="bg-primary text-xs px-2 py-1 rounded text-white">Popular</span>}
                                    </div>
                                    
                                    <div className="space-y-2 mb-6 text-sm text-text-secondary">
                                        <p><strong>Max Properties:</strong> {plan.maxProperties === -1 ? 'Unlimited' : plan.maxProperties}</p>
                                        <p><strong>Max Users:</strong> {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</p>
                                        <p><strong>AI Reports:</strong> <span className={plan.enableAiReports ? 'text-green-400' : 'text-red-400'}>{plan.enableAiReports ? 'Enabled' : 'Disabled'}</span></p>
                                        <p><strong>SMS Notifs:</strong> <span className={plan.enableSms ? 'text-green-400' : 'text-red-400'}>{plan.enableSms ? 'Enabled' : 'Disabled'}</span></p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingPlan(plan); setIsPlanModalOpen(true); }} className="flex-1 bg-secondary hover:bg-gray-700 py-2 rounded border border-border text-sm">Edit</button>
                                        <button onClick={() => handleDeletePlan(plan.id)} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded border border-red-900/30 text-sm">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Staff Modal */}
            <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title="Add Platform Staff">
                <UserForm 
                    user={null} 
                    roles={platformRoles} // Only allow selection of Platform-specific roles
                    departments={[]} 
                    onSave={(user, pass) => { onAddStaffUser(user, pass); setIsStaffModalOpen(false); }} 
                    onClose={() => setIsStaffModalOpen(false)} 
                />
            </Modal>

            {/* Plan Editor Modal */}
            <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title={editingPlan?.id ? "Edit Pricing Plan" : "Create Pricing Plan"}>
                <PlanEditor plan={editingPlan} onSave={handlePlanSave} onClose={() => setIsPlanModalOpen(false)} />
            </Modal>

            {/* Generic User List Modal for Clickable Cards */}
            <Modal isOpen={isUserListModalOpen} onClose={() => setIsUserListModalOpen(false)} title={userListTitle}>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead className="bg-secondary text-text-secondary">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Plan/Role</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.filter(userListFilter).map(u => (
                                <tr key={u.id}>
                                    <td className="p-3">{u.name}</td>
                                    <td className="p-3 text-sm text-text-secondary">{u.username}</td>
                                    <td className="p-3 text-sm">{u.subscriptionPlan || roles.find(r => r.id === u.roleId)?.name}</td>
                                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{u.status}</span></td>
                                </tr>
                            ))}
                            {users.filter(userListFilter).length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-text-secondary">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={() => setIsUserListModalOpen(false)} className="bg-primary px-4 py-2 rounded text-white">Close</button>
                </div>
            </Modal>
        </div>
    );
};

// Sub-component for Plan Editing
const PlanEditor: React.FC<{ plan: Partial<LandingPagePricingPlan> | null, onSave: (p: LandingPagePricingPlan) => void, onClose: () => void }> = ({ plan, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<LandingPagePricingPlan>>(plan || {
        name: '', price: '', period: '/mo', features: [], 
        maxProperties: 5, maxUsers: 1, maxTenants: 10,
        enableAiReports: false, enableSms: false, highlighted: false
    });
    const [featureInput, setFeatureInput] = useState('');

    const handleChange = (field: keyof LandingPagePricingPlan, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput] }));
            setFeatureInput('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            id: plan?.id || `plan-${Date.now()}`,
            ...formData
        } as LandingPagePricingPlan);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold mb-1">Plan Name</label>
                    <input required value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" placeholder="e.g. Starter" />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1">Price (Display)</label>
                    <input required value={formData.price} onChange={e => handleChange('price', e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" placeholder="e.g. ₦5,000" />
                </div>
            </div>
            
            <div className="border-t border-border pt-4">
                <h4 className="font-bold mb-2 text-primary">System Limits</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Max Properties</label>
                        <input type="number" value={formData.maxProperties} onChange={e => handleChange('maxProperties', parseInt(e.target.value))} className="w-full bg-secondary p-2 rounded border border-border" />
                    </div>
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Max Users</label>
                        <input type="number" value={formData.maxUsers} onChange={e => handleChange('maxUsers', parseInt(e.target.value))} className="w-full bg-secondary p-2 rounded border border-border" />
                    </div>
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Max Tenants</label>
                        <input type="number" value={formData.maxTenants} onChange={e => handleChange('maxTenants', parseInt(e.target.value))} className="w-full bg-secondary p-2 rounded border border-border" />
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-4">
                <h4 className="font-bold mb-2 text-primary">Feature Gates</h4>
                <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.enableAiReports} onChange={e => handleChange('enableAiReports', e.target.checked)} />
                        <span>AI Reports</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.enableSms} onChange={e => handleChange('enableSms', e.target.checked)} />
                        <span>SMS Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.highlighted} onChange={e => handleChange('highlighted', e.target.checked)} />
                        <span>Highlight on Landing Page</span>
                    </label>
                </div>
            </div>

            <div className="border-t border-border pt-4">
                <h4 className="font-bold mb-2 text-primary">Display Features (Bullet Points)</h4>
                <div className="flex gap-2 mb-2">
                    <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} className="flex-1 bg-secondary p-2 rounded border border-border" placeholder="e.g. Priority Support" />
                    <button type="button" onClick={addFeature} className="bg-blue-600 px-3 rounded text-white">+</button>
                </div>
                <ul className="list-disc pl-5 text-sm text-text-secondary">
                    {formData.features?.map((f, i) => (
                        <li key={i}>{f}</li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                <button type="submit" className="bg-primary px-4 py-2 rounded text-white font-bold">Save Plan</button>
            </div>
        </form>
    );
}

export default PlatformDashboard;
