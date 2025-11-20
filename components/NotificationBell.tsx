import React, { useState, useRef, useEffect } from 'react';
import { Notification, User } from '../types';
import { ICONS } from '../constants';

interface NotificationBellProps {
    currentUser: User;
    notifications: Notification[];
    readNotificationIds: Set<string>;
    markNotificationAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser, notifications, readNotificationIds, markNotificationAsRead, markAllAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter notifications to show only those relevant to the current user
    const userNotifications = notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser.id);

    const unreadCount = userNotifications.filter(n => !n.read && !readNotificationIds.has(n.id)).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-text-secondary hover:text-text-primary p-2"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {ICONS.notification}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full ring-2 ring-secondary bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-xl border border-border z-50">
                    <div className="flex justify-between items-center p-3 border-b border-border">
                        <h4 className="font-semibold">Notifications</h4>
                        {unreadCount > 0 && (
                             <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {userNotifications.length > 0 ? (
                            userNotifications.map(notification => {
                                const isRead = readNotificationIds.has(notification.id) || notification.read;
                                return (
                                <div key={notification.id} className={`p-3 border-b border-border/50 ${isRead ? 'opacity-50' : 'hover:bg-secondary'}`}>
                                    <p className="text-sm font-semibold text-text-secondary">{notification.type}</p>
                                    <p className="text-sm">{notification.message}</p>
                                    {!isRead && (
                                        <button onClick={() => markNotificationAsRead(notification.id)} className="text-xs text-blue-400 hover:underline mt-1">Mark as read</button>
                                    )}
                                </div>
                                )
                            })
                        ) : (
                            <p className="p-4 text-center text-sm text-text-secondary">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
