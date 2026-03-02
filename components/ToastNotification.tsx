import React, { useState, useEffect } from 'react';
import { Notification } from '../types';

interface ToastNotificationProps {
    notification: Notification;
    onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 5000); // Show for 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const getTypeStyles = () => {
        switch (notification.type) {
            case 'Rent Reminder':
                return 'bg-yellow-600 border-yellow-400';
            case 'Overdue Rent':
                return 'bg-red-600 border-red-400';
            case 'Lease Expiry':
                return 'bg-orange-600 border-orange-400';
            case 'Maintenance Update':
                return 'bg-blue-600 border-blue-400';
            default:
                return 'bg-primary border-primary-hover';
        }
    };

    return (
        <div 
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className={`rounded-lg shadow-lg border-l-4 ${getTypeStyles()} bg-card overflow-hidden`}>
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-white">
                                {notification.type}
                            </p>
                            <p className="mt-1 text-sm text-gray-200">
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(onClose, 300);
                                }}
                                className="inline-flex text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToastNotification;
