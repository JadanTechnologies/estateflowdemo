
import React from 'react';
import { Permission, PaymentMethod, LandingPageConfig } from './types';

export const Logo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM2 12l10 5 10-5-10-5-10 5z"></path>
  </svg>
);

export const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    properties: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    tenants: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.75 4.75a.75.75 0 00-1.5 0v1.25a.75.75 0 001.5 0V10.75zM16.19 8.243a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 3.72-3.72a.75.75 0 011.06 0zM14 6a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    payments: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-2.12 2.122h-1.698c.071-.221.164-.409.267-.567A4.002 4.002 0 018 4V2.52a6.5 6.5 0 00-5.63 3.48c-.069.13-.131.265-.185.4h1.439c.176 0 .321.143.321.321v2.122c0 .177-.145.321-.321.321H2.05c.054.135.116.27.185.4A6.5 6.5 0 008 17.48V16a4 4 0 01-3.567-2.082c-.103-.158-.196-.346-.267-.567h1.698c.221.071.409.164.567.267A2.5 2.5 0 0010 14.5v1.698a6.5 6.5 0 005.63-3.48c.069-.13.131.265.185-.4h-1.439c-.176 0-.321-.143-.321-.321V10.3c0-.177.145.321.321-.321H17.95c-.054-.135-.116-.27-.185-.4A6.5 6.5 0 0012 2.52V4a4 4 0 013.567 2.082z" /></svg>,
    maintenance: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 5.134V9.25c0 .414.336.75.75.75h2.5c.414 0 .75-.336.75-.75V5.134l.51-1.964zM12 11.25a.75.75 0 01.75.75v3.339l.51 1.964c.38 1.56 2.6 1.56 2.98 0l.51-1.964v-3.34a.75.75 0 011.5 0v3.34a2.25 2.25 0 01-1.623 2.175l-.51 1.965c-1.14 4.68-7.86 4.68-9 0l-.51-1.965A2.25 2.25 0 014 15.339v-3.34a.75.75 0 011.5 0v3.339l.51 1.964c.38 1.56 2.6 1.56 2.98 0l.51-1.964V12a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>,
    reports: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>,
    agents: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 5.134V9.25c0 .414.336.75.75.75h2.5c.414 0 .75-.336.75-.75V5.134l.51-1.964zM12 11.25a.75.75 0 01.75.75v3.339l.51 1.964c.38 1.56 2.6 1.56 2.98 0l.51-1.964v-3.34a.75.75 0 011.5 0v3.34a2.25 2.25 0 01-1.623 2.175l-.51 1.965c-1.14 4.68-7.86 4.68-9 0l-.51-1.965A2.25 2.25 0 014 15.339v-3.34a.75.75 0 011.5 0v3.339l.51 1.964c.38 1.56 2.6 1.56 2.98 0l.51-1.964V12a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>,
    notification: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    email: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>,
    push: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>,
    sms: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.832 8.832 0 01-4.323-.993l.865 1.049a.5.5 0 01-.73.69l-1.554-1.865A.5.5 0 014.5 15.5V14a8 8 0 118-4z" clipRule="evenodd" /></svg>,
    auditLog: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 0H4v2h12V5zM2 11a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 0H4v2h12v-2z" clipRule="evenodd" /></svg>,
};


export const NAV_LINKS = [
    { name: 'Dashboard', href: '#', icon: ICONS.dashboard, requiredPermission: Permission.VIEW_DASHBOARD },
    { name: 'Properties', href: '#properties', icon: ICONS.properties, requiredPermission: Permission.VIEW_PROPERTIES },
    { name: 'Tenants', href: '#tenants', icon: ICONS.tenants, requiredPermission: Permission.VIEW_TENANTS },
    { name: 'Payments', href: '#payments', icon: ICONS.payments, requiredPermission: Permission.VIEW_PAYMENTS },
    { name: 'Maintenance', href: '#maintenance', icon: ICONS.maintenance, requiredPermission: Permission.VIEW_MAINTENANCE },
    { name: 'Reports', href: '#reports', icon: ICONS.reports, requiredPermission: Permission.VIEW_REPORTS },
    { name: 'Agents', href: '#agents', icon: ICONS.agents, requiredPermission: Permission.VIEW_AGENTS },
    { name: 'Email Log', href: '#emaillog', icon: ICONS.email, requiredPermission: Permission.VIEW_EMAIL_LOG },
    { name: 'Push Log', href: '#pushlog', icon: ICONS.push, requiredPermission: Permission.VIEW_PUSH_LOG },
    { name: 'SMS Log', href: '#smslog', icon: ICONS.sms, requiredPermission: Permission.VIEW_SMS_LOG },
    { name: 'Users', href: '#users', icon: ICONS.users, requiredPermission: Permission.MANAGE_USERS },
    { name: 'Audit Log', href: '#auditlog', icon: ICONS.auditLog, requiredPermission: Permission.VIEW_AUDIT_LOG },
    { name: 'Settings', href: '#settings', icon: ICONS.settings, requiredPermission: Permission.MANAGE_SETTINGS },
];

export const ALL_PERMISSIONS: { id: Permission, label: string, isAgentSpecific?: boolean }[] = [
    { id: Permission.VIEW_DASHBOARD, label: 'View Dashboard' },
    { id: Permission.VIEW_PROPERTIES, label: 'View Properties' },
    { id: Permission.MANAGE_PROPERTIES, label: 'Manage Properties (Add, Edit, Delete)' },
    { id: Permission.VIEW_TENANTS, label: 'View Tenants' },
    { id: Permission.MANAGE_TENANTS, label: 'Manage Tenants (Add, Edit)' },
    { id: Permission.VIEW_PAYMENTS, label: 'View Payments' },
    { id: Permission.MANAGE_PAYMENTS, label: 'Manage Payments (Add, Edit)' },
    { id: Permission.VIEW_MAINTENANCE, label: 'View Maintenance' },
    { id: Permission.MANAGE_MAINTENANCE, label: 'Manage Maintenance (Add, Edit)' },
    { id: Permission.VIEW_REPORTS, label: 'View Reports' },
    { id: Permission.VIEW_EMAIL_LOG, label: 'View Email Log' },
    { id: Permission.VIEW_PUSH_LOG, label: 'View Push Notification Log' },
    { id: Permission.VIEW_SMS_LOG, label: 'View SMS Log' },
    { id: Permission.VIEW_AGENTS, label: 'View Agents' },
    { id: Permission.MANAGE_AGENTS, label: 'Manage Agents (Add, Edit)' },
    { id: Permission.MANAGE_USERS, label: 'Manage Users (Add, Edit, Delete)' },
    { id: Permission.VIEW_AUDIT_LOG, label: 'View Audit Log' },
    { id: Permission.MANAGE_SETTINGS, label: 'Manage System Settings' },
    { id: Permission.MANAGE_ROLES, label: 'Manage Roles & Permissions' },
    { id: Permission.MANAGE_COMMUNICATIONS, label: 'Manage Global Communications' },
    { id: Permission.MANAGE_COMMISSIONS, label: 'Manage Agent Commissions' },

    // New Agent Permissions
    { id: Permission.AGENT_CAN_EDIT_OWN_PROPERTIES, label: '[Agent] Can Edit Assigned Properties', isAgentSpecific: true },
    { id: Permission.AGENT_CAN_MANAGE_OWN_TENANTS, label: '[Agent] Can Manage Tenants in Assigned Properties', isAgentSpecific: true },
    { id: Permission.AGENT_CAN_RECORD_PAYMENTS_FOR_OWN_TENANTS, label: '[Agent] Can Record Payments for Assigned Tenants', isAgentSpecific: true },
];

// FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactElement> = {
  [PaymentMethod.Cash]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2H4z" clipRule="evenodd" /></svg>,
  [PaymentMethod.Transfer]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
  [PaymentMethod.POS]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v6a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  [PaymentMethod.Cheque]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
  [PaymentMethod.Manual]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
  [PaymentMethod.Paystack]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V5z" clipRule="evenodd" /></svg>,
  [PaymentMethod.Flutterwave]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V5z" clipRule="evenodd" /></svg>,
};

export const INITIAL_LANDING_PAGE_CONFIG: LandingPageConfig = {
    hero: {
        title: "The Future of Real Estate Management",
        subtitle: "EstateFlow isn't just a dashboard. It's a complete digital ecosystem for modern property management. Automate rent, manage tenants, and visualize your portfolio in real-time.",
        ctaText: "Get Started"
    },
    about: {
        title: "About EstateFlow",
        description: "Founded in 2023, EstateFlow aims to revolutionize the property management industry in Africa. We believe in transparency, efficiency, and leveraging technology to make property management seamless for landlords and comfortable for tenants.",
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    },
    features: {
        title: "Why Choose EstateFlow?",
        subtitle: "Comprehensive tools for modern property managers.",
        items: [
            { title: "Automated Payments", description: "Seamlessly track rent, deposits, and issue receipts automatically.", icon: "credit-card" },
            { title: "Tenant Portal", description: "Give tenants a dedicated space to pay rent, request maintenance, and view lease details.", icon: "users" },
            { title: "Maintenance Tracking", description: "Log, assign, and track maintenance requests from start to finish.", icon: "tool" }
        ]
    },
    howItWorks: {
        title: "How It Works",
        steps: [
            { title: "Register Properties", description: "Add your residential or commercial properties to the system." },
            { title: "Onboard Tenants", description: "Register tenants and assign them to units. They get instant access to the portal." },
            { title: "Automate & Relax", description: "Let EstateFlow handle rent reminders, payment tracking, and reporting." }
        ]
    },
    pricing: {
        title: "Simple, Transparent Pricing",
        subtitle: "Choose the plan that fits your portfolio size.",
        plans: [
            { name: "Starter", price: "₦0", period: "/mo", features: ["Up to 5 Properties", "Basic Reporting", "Tenant Portal"] },
            { name: "Professional", price: "₦15,000", period: "/mo", features: ["Up to 50 Properties", "Advanced Analytics", "SMS Notifications", "Priority Support"], highlighted: true },
            { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited Properties", "Dedicated Account Manager", "Custom Integrations", "White Labeling"] }
        ]
    },
    testimonials: {
        title: "What Our Customers Say",
        items: [
            { name: "Sarah Johnson", role: "Property Manager", comment: "EstateFlow has completely transformed how I manage my 20 units. The automated rent reminders alone have saved me hours every month.", avatarUrl: "https://i.pravatar.cc/150?u=sarah" },
            { name: "Michael Okonkwo", role: "Landlord", comment: "Finally, a system that is built for our local market. The reporting features are fantastic.", avatarUrl: "https://i.pravatar.cc/150?u=michael" }
        ]
    },
    faqs: {
        title: "Frequently Asked Questions",
        items: [
            { question: "Is my data secure?", answer: "Yes, we use industry-standard encryption to protect your data and your tenants' information." },
            { question: "Can I export my data?", answer: "Absolutely. You can export financial reports and tenant lists to PDF or CSV at any time." },
            { question: "Do you support local payment gateways?", answer: "Yes, we integrate with Paystack, Flutterwave, and Monnify for seamless transactions." }
        ]
    },
    blog: {
        title: "Latest from Our Blog",
        posts: [
            { title: "5 Tips for Better Tenant Retention", excerpt: "Keeping good tenants is cheaper than finding new ones. Here is how to keep them happy.", date: "2023-10-15", imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { title: "Understanding Property Tax in Lagos", excerpt: "A comprehensive guide to navigating the complex world of property taxation.", date: "2023-11-02", imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
        ]
    },
    legal: {
        privacyPolicy: "We value your privacy. This policy describes how we collect, use, and share your personal information...",
        termsOfService: "By using EstateFlow, you agree to the following terms and conditions...",
        refundPolicy: "Subscriptions can be cancelled at any time. Refunds are processed on a pro-rata basis..."
    },
    contact: {
        email: "contact@estateflow.com",
        phone: "+234 800 123 4567",
        address: "123 Innovation Drive, Tech City, Lagos"
    }
};
