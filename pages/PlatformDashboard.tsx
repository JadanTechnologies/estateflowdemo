
import React from 'react';
import { User, Role } from '../types';
import DashboardCard from '../components/DashboardCard';
import { ICONS } from '../constants';

interface PlatformDashboardProps {
    users: User[];
    roles: Role[];
    toggleUserStatus: (userId: string) => void;
}

const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ users, roles, toggleUserStatus }) => {
    // Identify "Tenant Admins" - defined here as users with the 'Super Admin' role (excluding the platform owner)
    const superAdminRole = roles.find(r => r.name === 'Super Admin');
    const businessAdmins = users.filter(u => u.roleId === superAdminRole?.id && u.username !== 'owner@estateflow.com');
    
    const totalBusinesses = businessAdmins.length;
    // Mock calculation: Assuming each business pays ₦15,000/month
    const monthlyRevenue = totalBusinesses * 15000;
    const totalSystemUsers = users.length;

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Platform Overview</h2>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard 
                    title="Active Businesses" 
                    value={totalBusinesses} 
                    subValue="Tenant Admins"
                    icon={ICONS.users} 
                    colorClass="bg-indigo-600" 
                />
                <DashboardCard 
                    title="Monthly Revenue" 
                    value={`₦${monthlyRevenue.toLocaleString()}`} 
                    subValue="Estimated"
                    icon={ICONS.payments} 
                    colorClass="bg-green-600" 
                />
                <DashboardCard 
                    title="Total System Users" 
                    value={totalSystemUsers} 
                    subValue="Across all orgs"
                    icon={ICONS.dashboard} 
                    colorClass="bg-purple-600" 
                />
            </div>

            {/* Business Directory Table */}
            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-text-primary">Registered Businesses (Tenant Admins)</h3>
                    <p className="text-sm text-text-secondary">Manage the companies utilizing the EstateFlow platform.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="p-4 font-semibold text-text-secondary">Business Admin</th>
                                <th className="p-4 font-semibold text-text-secondary">Email (Username)</th>
                                <th className="p-4 font-semibold text-text-secondary">Subscription Plan</th>
                                <th className="p-4 font-semibold text-text-secondary">Status</th>
                                <th className="p-4 font-semibold text-text-secondary">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {businessAdmins.map(admin => (
                                <tr key={admin.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="p-4 font-medium text-text-primary">{admin.name}</td>
                                    <td className="p-4 text-text-secondary">{admin.username}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Professional
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => toggleUserStatus(admin.id)}
                                            className={`text-sm font-medium ${admin.status === 'Active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                                        >
                                            {admin.status === 'Active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {businessAdmins.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-text-secondary">
                                        No businesses registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlatformDashboard;
