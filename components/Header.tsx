
import React from 'react';
import { User, Notification, Role } from '../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  currentUser: User;
  users: User[];
  roles: Role[];
  setCurrentUser: (user: User) => void;
  activePage: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: Notification[];
  readNotificationIds: Set<string>;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  roles,
  activePage, 
  isSidebarOpen, 
  toggleSidebar,
  notifications,
  readNotificationIds,
  markNotificationAsRead,
  markAllAsRead,
  onLogout
}) => {
  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Unknown Role';

  return (
    <header className="bg-secondary/50 backdrop-blur-sm sticky top-0 z-30 h-20 border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="mr-4 text-text-secondary hover:text-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold capitalize">{activePage}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationBell 
            currentUser={currentUser}
            notifications={notifications}
            readNotificationIds={readNotificationIds}
            markNotificationAsRead={markNotificationAsRead}
            markAllAsRead={markAllAsRead}
        />
        
        <div className="text-right hidden md:block">
            <p className="font-semibold text-sm text-text-primary">{currentUser.name}</p>
            <p className="text-xs text-text-secondary">{getRoleName(currentUser.roleId)}</p>
        </div>

        <img
          className="w-10 h-10 rounded-full border-2 border-primary"
          src={`https://i.pravatar.cc/150?u=${currentUser.name}`}
          alt={currentUser.name}
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

export default Header;
