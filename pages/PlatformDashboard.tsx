
import React, { useState } from 'react';
import { User, Role, LandingPageConfig, Permission } from '../types';
import DashboardCard from '../components/DashboardCard';
import { ICONS } from '../constants';
import LandingPageEditor from '../components/LandingPageEditor';

interface PlatformDashboardProps {
    users: User[];
    roles: Role[];
    landingPageConfig: LandingPageConfig;
    onSaveLandingPageConfig: (config: LandingPageConfig) => void;
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
    onDeleteUser: (userId: string) => void;
}

const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ users, roles, landingPageConfig, onSaveLandingPageConfig, onUpdateUser, onDeleteUser }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'users' | 'pricing'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Identify "Tenant Admins"
    const superAdminRole = roles.find(r => r.name === 'Super Admin');
    const businessAdmins = users.filter(u => u.roleId === superAdminRole?.id && u.username !== 'owner@estateflow.com');
    
    // KPIs
    const totalBusinesses = businessAdmins.length;
    const activeSubscriptions = businessAdmins.filter(u => u.subscriptionStatus === 'Active').length;
    // Mock calculation: Sum of plan prices roughly
    const monthlyRevenue = businessAdmins.reduce((sum, u) => sum + (u.subscriptionPlan === 'Professional' ? 15000 : u.subscriptionPlan === 'Enterprise' ? 50000 : 0), 0);
    const totalSystemUsers = users.length;

    // Filtered Global Users
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.roleId && roles.find(r => r.id === u.roleId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleExtendSubscription = (userId: string) => {
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);
        onUpdateUser(userId, { 
            subscriptionStatus: 'Active', 
            subscriptionExpiry: newExpiry.toISOString().split('T')[0] 
        });
        alert('Subscription extended by 30 days.');
    };

    const handleToggleUserStatus = (user: User) => {
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        onUpdateUser(user.id, { status: newStatus });
    };

    const handleDeleteUserClick = (user: User) => {
        if (window.confirm(`Are you sure you want to delete user ${user.name}? This action is irreversible.`)) {
            onDeleteUser(user.id);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-primary">Platform Administration</h2>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border mb-6 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'businesses', label: 'Subscriptions & Businesses' },
                    { id: 'users', label: 'Global User Management' },
                    { id: 'pricing', label: 'Pricing Plans' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <DashboardCard 
                        title="Total Revenue" 
                        value={`₦${monthlyRevenue.toLocaleString()}`} 
                        subValue="Monthly Recurring"
                        icon={ICONS.payments} 
                        colorClass="bg-green-600" 
                    />
                    <DashboardCard 
                        title="Active Businesses" 
                        value={activeSubscriptions} 
                        subValue={`of ${totalBusinesses} total`}
                        icon={ICONS.users} 
                        colorClass="bg-indigo-600" 
                    />
                    <DashboardCard 
                        title="Total Users" 
                        value={totalSystemUsers} 
                        subValue="Platform-wide"
                        icon={ICONS.dashboard} 
                        colorClass="bg-purple-600" 
                    />
                     <DashboardCard 
                        title="Plan Distribution" 
                        value={businessAdmins.filter(u => u.subscriptionPlan === 'Professional').length}
                        subValue="Pro Users"
                        icon={ICONS.reports} 
                        colorClass="bg-yellow-600" 
                    />
                </div>
            )}

            {/* TAB: BUSINESSES */}
            {activeTab === 'businesses' && (
                <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold text-text-primary">Business Subscriptions</h3>
                        <p className="text-sm text-text-secondary">Manage tenant admin accounts, plans, and billing status.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50 border-b border-border">
                                <tr>
                                    <th className="p-4 text-text-secondary">Business Name</th>
                                    <th className="p-4 text-text-secondary">Plan</th>
                                    <th className="p-4 text-text-secondary">Status</th>
                                    <th className="p-4 text-text-secondary">Expiry</th>
                                    <th className="p-4 text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {businessAdmins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-secondary/30">
                                        <td className="p-4">
                                            <div className="font-medium">{admin.name}</div>
                                            <div className="text-xs text-text-secondary">{admin.username}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-200 border border-blue-700">
                                                {admin.subscriptionPlan || 'Free'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${admin.subscriptionStatus === 'Active' ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
                                                {admin.subscriptionStatus || 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">{admin.subscriptionExpiry || 'N/A'}</td>
                                        <td className="p-4 space-x-2">
                                            <button onClick={() => handleExtendSubscription(admin.id)} className="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded">
                                                Simulate Payment
                                            </button>
                                            <button onClick={() => handleToggleUserStatus(admin)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded">
                                                {admin.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {businessAdmins.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-text-secondary">No businesses found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder="Search any user (name, email, role)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-card p-3 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/50 border-b border-border">
                                    <tr>
                                        <th className="p-4 text-text-secondary">User</th>
                                        <th className="p-4 text-text-secondary">Role</th>
                                        <th className="p-4 text-text-secondary">Status</th>
                                        <th className="p-4 text-text-secondary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredUsers.slice(0, 50).map(user => (
                                        <tr key={user.id} className="hover:bg-secondary/30">
                                            <td className="p-4">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-text-secondary">{user.username}</div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {roles.find(r => r.id === user.roleId)?.name || 'Unknown'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 space-x-2">
                                                <button onClick={() => handleToggleUserStatus(user)} className="text-yellow-400 hover:text-yellow-300 text-sm">
                                                    {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                                </button>
                                                <button onClick={() => handleDeleteUserClick(user)} className="text-red-400 hover:text-red-300 text-sm">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length > 50 && <div className="p-4 text-center text-xs text-text-secondary">Showing first 50 results...</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PRICING PLANS */}
            {activeTab === 'pricing' && (
                <div>
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded mb-6">
                        <h4 className="font-bold text-blue-400">Pricing Configuration</h4>
                        <p className="text-sm text-blue-200">Changes made here will be reflected on the public Landing Page immediately.</p>
                    </div>
                    {/* Reusing LandingPageEditor but forcing it to open on 'pricing' tab contextually effectively */}
                    <LandingPageEditor config={landingPageConfig} onSave={onSaveLandingPageConfig} />
                </div>
            )}
        </div>
    );
};

export default PlatformDashboard;
