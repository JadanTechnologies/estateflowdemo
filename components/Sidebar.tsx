
import React from 'react';
import { User, Permission } from '../types';
import { NAV_LINKS, Logo } from '../constants';

interface SidebarProps {
  currentUser: User;
  activePage: string;
  setActivePage: (page: string) => void;
  isSidebarOpen: boolean;
  userHasPermission: (permission: Permission) => boolean;
  customLogo?: string;
  customTitle?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activePage, setActivePage, isSidebarOpen, userHasPermission, customLogo, customTitle }) => {
  const accessibleLinks = NAV_LINKS.filter(link => userHasPermission(link.requiredPermission));

  return (
    <aside className={`bg-secondary text-text-primary transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} h-screen flex flex-col fixed top-0 left-0 z-40`}>
      <div className="flex items-center justify-center h-20 border-b border-border overflow-hidden px-2">
        {customLogo ? (
            <img src={customLogo} alt="Logo" className="h-10 w-auto max-w-[40px] object-contain" />
        ) : (
            <Logo className={`h-8 w-8 text-primary transition-all ${isSidebarOpen ? 'mr-2' : ''}`} />
        )}
        
        {isSidebarOpen && (
            <h1 className="text-xl font-bold ml-2 truncate" title={customTitle || 'EstateFlow'}>
                {customTitle || 'EstateFlow'}
            </h1>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {accessibleLinks.map((link) => {
          // Derive page name from href (removing #) to match App.tsx switch keys
          // e.g. '#emaillog' -> 'emaillog'
          const pageName = link.href.replace('#', '');
          const isActive = activePage === pageName || (activePage === 'dashboard' && link.name === 'Dashboard');
          return (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => { e.preventDefault(); setActivePage(pageName); }}
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'hover:bg-card'} ${isSidebarOpen ? '' : 'justify-center'}`}
              title={link.name}
            >
              {link.icon}
              {isSidebarOpen && <span className="ml-4 font-medium">{link.name}</span>}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;