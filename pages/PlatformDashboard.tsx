
import React, { useState } from 'react';
import { User, Role, LandingPageConfig } from '../types';
import DashboardCard from '../components/DashboardCard';
import { ICONS } from '../constants';
import Modal from '../components/Modal';

interface PlatformDashboardProps {
    users: User[];
    roles: Role[];
    landingPageConfig: LandingPageConfig;
}

const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ users, roles, landingPageConfig }) => {
    // Modal States for Dashboard Cards
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
    const [userListTitle, setUserListTitle] = useState('');
    const [userListFilter, setUserListFilter] = useState<(u: User) => boolean>(() => () => false);

    // Role Filters
    const superAdminRole = roles.find(r => r.name === 'Super Admin');
    
    // Data Segregation
    const businessAdmins = users.filter(u => u.roleId === superAdminRole?.id);
    const staffUsers = users.filter(u => u.roleId !== superAdminRole?.id); 

    // KPIs
    const totalBusinesses = businessAdmins.length;
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Platform Overview</h2>
            </div>

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
                
                {/* Additional Charts or Stats could go here */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="font-bold mb-4">Recent Activity</h3>
                        <p className="text-text-secondary text-sm">Platform activity monitoring is active. Check Audit Log for details.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="font-bold mb-4">System Health</h3>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            <span>All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>

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

export default PlatformDashboard;
