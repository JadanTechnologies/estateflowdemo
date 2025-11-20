
import React from 'react';
import { Tenant } from '../types';
import { Logo } from '../constants';

interface TenantHeaderProps {
    tenant: Tenant;
    onLogout: () => void;
}

const TenantHeader: React.FC<TenantHeaderProps> = ({ tenant, onLogout }) => {
    return (
        <header className="bg-secondary sticky top-0 z-30 h-20 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center">
                <Logo className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-xl font-bold">Tenant Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
                 <div className="text-right">
                    <p className="font-semibold text-text-primary">{tenant.fullName}</p>
                    <p className="text-xs text-text-secondary">Tenant</p>
                </div>
                <img
                    className="w-10 h-10 rounded-full border-2 border-primary"
                    src={tenant.profilePhoto || `https://i.pravatar.cc/150?u=${tenant.fullName}`}
                    alt={tenant.fullName}
                />
                <button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default TenantHeader;
