
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import MaintenancePage from './pages/Maintenance';
import Reports from './pages/Reports';
import Agents from './pages/Agents';
import Users from './pages/Users';
import Settings from './pages/Settings';
import EmailLog from './pages/EmailLog';
import PushNotificationLog from './pages/PushNotificationLog';
import SmsLog from './pages/SmsLog';
import AuditLog from './pages/AuditLog';
import AccessDenied from './pages/AccessDenied';
import ThermalReceipt from './components/ThermalReceipt';
import TenantDashboard from './pages/TenantDashboard';
import LandingPage from './pages/LandingPage';
import { NAV_LINKS, Logo, INITIAL_LANDING_PAGE_CONFIG } from './constants';
import { sendSms } from './services/notificationService';
import { NOTIFICATION_SOUND_BASE64 } from './components/NotificationSound';

import { 
  User, Agent, Property, Tenant, Payment, Maintenance, Role, Permission,
  Department, PropertyStatus, PaymentType, PaymentStatus, PaymentMethod,
  Notification, NotificationType, EmailLogEntry, PushNotificationLogEntry, SmsLogEntry,
  Announcement,
  UserStatus,
  ApiKeys,
  NotificationTemplate,
  TemplateType,
  CommissionPayment,
  ManualPaymentDetails,
  AuditLogEntry,
  LandingPageConfig,
} from './types';

// MOCK DATA

// --- SAMPLE LOGIN CREDENTIALS ---
//
// === Platform Owner ===
// Owner:
//   - username: owner@estateflow.com
//   - password: owner123
//
// === Staff Logins ===
// Super Admin:
//   - username: admin@estateflow.com
//   - password: admin123
//
// Property Manager:
//   - username: manager@estateflow.com
//   - password: manager123
//
// Accountant:
//   - username: accountant@estateflow.com
//   - password: accountant123
//
// Agent:
//   - username: agent@estateflow.com
//   - password: agent123
//
// === Tenant Login ===
// Tenant:
//   - username: tenant@estateflow.com
//   - password: tenant123
// ------------------------------------

const initialDepartments: Department[] = [
  { id: 'dept_res', name: 'Residential' },
  { id: 'dept_com', name: 'Commercial' },
  { id: 'dept_off', name: 'Office' },
  { id: 'dept_ind', name: 'Industrial' },
];

const initialRoles: Role[] = [
    { 
      id: 'role_super_admin', 
      name: 'Super Admin', 
      permissions: Object.values(Permission) // Super admin has all permissions
    },
    {
      id: 'role_manager',
      name: 'Property Manager',
      permissions: [
        Permission.VIEW_DASHBOARD, Permission.VIEW_PROPERTIES, Permission.MANAGE_PROPERTIES,
        Permission.VIEW_TENANTS, Permission.MANAGE_TENANTS, Permission.VIEW_PAYMENTS,
        Permission.MANAGE_PAYMENTS, Permission.VIEW_MAINTENANCE, Permission.MANAGE_MAINTENANCE,
        Permission.VIEW_AGENTS, Permission.MANAGE_AGENTS, Permission.VIEW_REPORTS, Permission.MANAGE_USERS,
        Permission.VIEW_EMAIL_LOG, Permission.VIEW_PUSH_LOG, Permission.VIEW_SMS_LOG, Permission.VIEW_AUDIT_LOG,
        Permission.MANAGE_NOTIFICATIONS, Permission.MANAGE_COMMUNICATIONS,
      ]
    },
    {
      id: 'role_accountant',
      name: 'Accountant',
      permissions: [
        Permission.VIEW_DASHBOARD, Permission.VIEW_PAYMENTS, Permission.MANAGE_PAYMENTS, Permission.VIEW_REPORTS, Permission.MANAGE_COMMISSIONS
      ]
    },
    {
      id: 'role_agent',
      name: 'Agent',
      permissions: [
        Permission.VIEW_DASHBOARD, Permission.VIEW_PROPERTIES, Permission.VIEW_TENANTS,
        Permission.AGENT_CAN_RECORD_PAYMENTS_FOR_OWN_TENANTS,
        Permission.MANAGE_NOTIFICATIONS,
      ]
    }
];

const initialUsers: User[] = [
    { id: 'owner', name: 'Platform Owner', username: 'owner@estateflow.com', password: 'owner123', roleId: 'role_super_admin', status: UserStatus.Active },
    { id: 'user1', name: 'Admin User', username: 'admin@estateflow.com', password: 'admin123', roleId: 'role_super_admin', status: UserStatus.Active },
    { id: 'user2', name: 'Manager User', username: 'manager@estateflow.com', password: 'manager123', roleId: 'role_manager', departmentId: 'dept_res', status: UserStatus.Active },
    { id: 'user3', name: 'Accountant User', username: 'accountant@estateflow.com', password: 'accountant123', roleId: 'role_accountant', status: UserStatus.Active },
    { id: 'agent1', name: 'Agent User', username: 'agent@estateflow.com', password: 'agent123', roleId: 'role_agent', departmentId: 'dept_res', status: UserStatus.Active },
];

const initialAgents: Agent[] = [
  { id: 'agent1', name: 'John Doe', phone: '123-456-7890', email: 'john@estate.com', departmentId: 'dept_res', commissionRate: 5 },
  { id: 'agent2', name: 'Jane Smith', phone: '098-765-4321', email: 'jane@estate.com', departmentId: 'dept_com', commissionRate: 4.5 },
];

const initialProperties: Property[] = [
  { id: 'prop1', name: 'Luxury Villa', unitNumber: 'Unit 1A', location: 'Lekki Phase 1', departmentId: 'dept_res', rentAmount: 5000000, depositAmount: 1000000, owner: 'Mr. A', description: 'A beautiful villa.', status: PropertyStatus.Occupied, agentId: 'agent1', images: [], documents: [{ name: 'tenancy_agreement.pdf', url: '#' }], notes: 'Needs repaint.' },
  { id: 'prop2', name: 'Ocean View Apt', unitNumber: 'Apt 2B', location: 'Victoria Island', departmentId: 'dept_res', rentAmount: 3500000, depositAmount: 700000, owner: 'Mrs. B', description: 'Cozy apartment.', status: PropertyStatus.Vacant, agentId: 'agent1', images: [], documents: [], notes: '' },
  { id: 'prop3', name: 'Corporate Tower', unitNumber: 'Floor 10', location: 'Ikoyi', departmentId: 'dept_off', rentAmount: 15000000, depositAmount: 3000000, owner: 'Big Corp', description: 'Grade A office space.', status: PropertyStatus.Occupied, agentId: 'agent2', images: [], documents: [], notes: '' },
];

const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

const initialTenants: Tenant[] = [
    { id: 'ten1', fullName: 'Alice Williams', phone: '111-222-3333', email: 'alice@mail.com', address: '123 Main St', nin: '12345678901', guarantor: { fullName: 'Bob Brown', phone: '444-555-6666', address: '456 Oak Ave', nin: '09876543210' }, propertyId: 'prop1', leaseStartDate: '2023-01-01', leaseEndDate: getFutureDate(30), rentDueDate: getFutureDate(5), profilePhoto: `https://i.pravatar.cc/150?u=alice`, notes: 'Tenant requested an additional parking spot.', username: 'tenant@estateflow.com', password: 'tenant123' },
    { id: 'ten2', fullName: 'Charlie Davis', phone: '777-888-9999', email: 'charlie@mail.com', address: '789 Pine Ln', nin: '11223344556', guarantor: { fullName: 'Diana Miller', phone: '000-111-2222', address: '101 Maple Dr', nin: '66554433221' }, propertyId: 'prop3', leaseStartDate: '2023-03-15', leaseEndDate: getFutureDate(60), rentDueDate: getFutureDate(15), profilePhoto: `https://i.pravatar.cc/150?u=charlie`, notes: 'Pays rent on time, but has had noise complaints from neighboring units.', username: 'charlie@tenant.com', password: 'password' },
    { id: 'ten3', fullName: 'David Lee', phone: '321-654-9870', email: 'david@mail.com', address: '321 Birch Rd', nin: '98765432109', guarantor: { fullName: 'Eva Green', phone: '123-987-6543', address: '654 Cedar St', nin: '01234567890' }, propertyId: 'prop2', leaseStartDate: '2023-08-01', leaseEndDate: getFutureDate(120), rentDueDate: getFutureDate(25), profilePhoto: `https://i.pravatar.cc/150?u=david`, notes: '', username: 'david@tenant.com', password: 'password' },
];

const initialPayments: Payment[] = [
  { id: 'pay1', tenantId: 'ten1', propertyId: 'prop1', paymentType: PaymentType.Rent, paymentStatus: PaymentStatus.Paid, paymentMethod: PaymentMethod.Transfer, amountPaid: 5000000, date: '2023-01-01T10:00:00Z', notes: 'Full year rent', receiptPrinted: true, agentId: 'agent1' },
  { id: 'pay2', tenantId: 'ten1', propertyId: 'prop1', paymentType: PaymentType.Deposit, paymentStatus: PaymentStatus.Paid, paymentMethod: PaymentMethod.Transfer, amountPaid: 1000000, date: '2023-01-01T10:05:00Z', notes: 'Security Deposit', agentId: 'agent1' },
  { id: 'pay3', tenantId: 'ten2', propertyId: 'prop3', paymentType: PaymentType.Rent, paymentStatus: PaymentStatus.Paid, paymentMethod: PaymentMethod.Paystack, amountPaid: 15000000, date: '2023-03-15T12:30:00Z', notes: 'Annual Rent via Paystack', agentId: 'agent2' },
  { id: 'pay4', tenantId: 'ten1', propertyId: 'prop1', paymentType: PaymentType.Other, paymentStatus: PaymentStatus.PendingApproval, paymentMethod: PaymentMethod.Manual, amountPaid: 50000, date: '2024-05-10T14:00:00Z', notes: 'Service Charge', agentId: 'agent1' }
];

const initialMaintenance: Maintenance[] = [
  { id: 'maint1', propertyId: 'prop1', tenantId: 'ten1', task: 'Fix leaking kitchen sink', cost: 15000, date: '2023-05-20', status: 'Completed', notes: 'Plumber called and issue resolved.', assignedToUserId: 'user2' },
  { id: 'maint2', propertyId: 'prop3', task: 'Service central AC unit', cost: 75000, date: '2023-06-10', status: 'In Progress', notes: 'Waiting for parts.' },
];

const initialNotifications: Notification[] = [
  { id: 'notif1', message: 'Rent for Luxury Villa is due in 15 days.', date: new Date().toISOString(), type: NotificationType.RentReminder, targetTenantId: 'ten1', read: false },
  { id: 'notif2', message: 'A new maintenance request has been submitted for Corporate Tower.', date: new Date().toISOString(), type: NotificationType.Global, read: true },
];

const initialCommissionPayments: CommissionPayment[] = [
    { id: 'comm1', agentId: 'agent1', amount: 250000, paymentDate: '2023-02-01', periodStartDate: '2023-01-01', periodEndDate: '2023-01-31', notes: 'January commission payment.' },
    { id: 'comm2', agentId: 'agent2', amount: 675000, paymentDate: '2023-04-01', periodStartDate: '2023-03-01', periodEndDate: '2023-03-31', notes: 'Q1 bonus included.' },
];

const initialEmailLog: EmailLogEntry[] = [];
const initialPushLog: PushNotificationLogEntry[] = [];
const initialSmsLog: SmsLogEntry[] = [];
const initialAuditLog: AuditLogEntry[] = [];

const initialAnnouncements: Announcement[] = [
    { id: 'ann1', title: 'Annual Fumigation Notice', content: 'Please be advised that the annual fumigation exercise for all residential properties will take place on Saturday, June 25th. Kindly ensure your apartment is accessible.', date: new Date().toISOString() }
];

const initialApiKeys: ApiKeys = {
  twilioSid: '',
  twilioToken: '',
  firebaseKey: '',
  paystackKey: '',
  flutterwaveKey: '',
  monnifyKey: '',
};

const initialManualPaymentDetails: ManualPaymentDetails = {
    bankName: 'Zenith Bank PLC',
    accountName: 'EstateFlow Management Inc.',
    accountNumber: '1020304050'
};

const initialTemplates: NotificationTemplate[] = [
    { id: 'tmpl-rent-reminder', name: 'Standard Rent Reminder', type: TemplateType.RentReminder, subject: 'Friendly Rent Reminder for {propertyName}', body: 'Dear {tenantName},\n\nThis is a friendly reminder that your rent of ₦{rentAmount} for {propertyName} is due on {rentDueDate}.\n\nThank you,\nEstateFlow Management' },
    { id: 'tmpl-overdue', name: 'Overdue Rent Notice', type: TemplateType.OverdueNotice, subject: 'URGENT: Overdue Rent for {propertyName}', body: 'Dear {tenantName},\n\nOur records show that your rent payment is overdue. Please make a payment as soon as possible to avoid penalties.\n\nThank you,\nEstateFlow Management' },
    { id: 'tmpl-welcome', name: 'Welcome Email', type: TemplateType.Welcome, subject: 'Welcome to {propertyName}!', body: 'Dear {tenantName},\n\nWelcome to your new home at {propertyName}! We are thrilled to have you as a tenant. Please find attached your tenancy agreement and other important documents.\n\nBest regards,\nEstateFlow Management' },
];

const LOCAL_STORAGE_KEY = 'estateFlowData';

const initialData = {
    departments: initialDepartments, roles: initialRoles, users: initialUsers, agents: initialAgents, properties: initialProperties, tenants: initialTenants, payments: initialPayments, maintenance: initialMaintenance, notifications: initialNotifications, commissionPayments: initialCommissionPayments, emailLog: initialEmailLog, pushLog: initialPushLog, smsLog: initialSmsLog, announcements: initialAnnouncements, apiKeys: initialApiKeys, manualPaymentDetails: initialManualPaymentDetails, templates: initialTemplates, leaseEndReminderDays: '90,60,30', auditLog: initialAuditLog, landingPageConfig: INITIAL_LANDING_PAGE_CONFIG
};

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onLogin: (user: User | Tenant) => void }> = ({ isOpen, onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const allLoginableUsers = useMemo(() => [...initialUsers, ...initialTenants], []);

    if(!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const foundUser = allLoginableUsers.find(u => u.username === username && u.password === password);

        if(foundUser) {
            onLogin(foundUser);
        } else {
            setError('Invalid username or password.');
        }
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
            <div className="p-8 bg-card rounded-lg shadow-2xl w-full max-w-sm border border-indigo-500/30">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                         <Logo className="h-10 w-10 text-primary" />
                         <span className="ml-2 text-xl font-bold text-white">Login</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-center text-text-secondary mb-6">Sign in to your EstateFlow account.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="mt-1 block w-full bg-secondary border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-white"
                            placeholder="e.g. admin@estateflow.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full bg-secondary border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-white"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition duration-200 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                        Login
                    </button>
                </form>
                 <div className="mt-6 text-center">
                     <p className="text-xs text-gray-500">Demo Credentials:</p>
                     <p className="text-xs text-gray-400">owner@estateflow.com / owner123 (Owner)</p>
                     <p className="text-xs text-gray-400">admin@estateflow.com / admin123</p>
                     <p className="text-xs text-gray-400">tenant@estateflow.com / tenant123</p>
                 </div>
            </div>
      </div>
    );
};

// Main App Component
const App = () => {
    const loadState = () => {
        try {
            const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (serializedState === null) {
                return initialData;
            }
            // Deep merge to ensure new properties (like landingPageConfig) are added if missing in old storage
            return { ...initialData, ...JSON.parse(serializedState) };
        } catch (error) {
            console.error("Error loading state from local storage:", error);
            return initialData;
        }
    };

    // State
    const [departments, setDepartments] = useState<Department[]>(() => loadState().departments);
    const [roles, setRoles] = useState<Role[]>(() => loadState().roles);
    const [users, setUsers] = useState<User[]>(() => loadState().users);
    const [agents, setAgents] = useState<Agent[]>(() => loadState().agents);
    const [properties, setProperties] = useState<Property[]>(() => loadState().properties);
    const [tenants, setTenants] = useState<Tenant[]>(() => loadState().tenants);
    const [payments, setPayments] = useState<Payment[]>(() => loadState().payments);
    const [maintenance, setMaintenance] = useState<Maintenance[]>(() => loadState().maintenance);
    const [notifications, setNotifications] = useState<Notification[]>(() => loadState().notifications);
    const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>(() => loadState().commissionPayments);
    const [emailLog, setEmailLog] = useState<EmailLogEntry[]>(() => loadState().emailLog);
    const [pushLog, setPushLog] = useState<PushNotificationLogEntry[]>(() => loadState().pushLog);
    const [smsLog, setSmsLog] = useState<SmsLogEntry[]>(() => loadState().smsLog);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => loadState().auditLog);
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadState().announcements);
    const [apiKeys, setApiKeys] = useState<ApiKeys>(() => loadState().apiKeys);
    const [manualPaymentDetails, setManualPaymentDetails] = useState<ManualPaymentDetails>(() => loadState().manualPaymentDetails);
    const [templates, setTemplates] = useState<NotificationTemplate[]>(() => loadState().templates);
    const [leaseEndReminderDays, setLeaseEndReminderDays] = useState(() => loadState().leaseEndReminderDays);
    const [landingPageConfig, setLandingPageConfig] = useState<LandingPageConfig>(() => loadState().landingPageConfig);
    
    // Auth & UI State
    const [currentUser, setCurrentUser] = useState<User | Tenant | null>(null);
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [paymentForReceipt, setPaymentForReceipt] = useState<Payment | null>(null);
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Save state to local storage whenever it changes
    useEffect(() => {
        const stateToSave = {
            departments, roles, users, agents, properties, tenants, payments, maintenance, notifications, commissionPayments, emailLog, pushLog, smsLog, announcements, apiKeys, manualPaymentDetails, templates, leaseEndReminderDays, auditLog, landingPageConfig
        };
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Error saving state to local storage:", error);
        }
    }, [departments, roles, users, agents, properties, tenants, payments, maintenance, notifications, commissionPayments, emailLog, pushLog, smsLog, announcements, apiKeys, manualPaymentDetails, templates, leaseEndReminderDays, auditLog, landingPageConfig]);


    const addAuditLog = (action: string, details: string, targetId?: string) => {
        if (!currentUser) return;
        const userForLog = currentUser;
        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            userId: userForLog.id,
            username: 'username' in userForLog ? userForLog.username! : userForLog.fullName,
            action,
            details,
            targetId,
        };
        setAuditLog(prev => [newLog, ...prev]);
    };

    const isStaff = currentUser && 'roleId' in currentUser;
    const staffUser = isStaff ? (currentUser as User) : null;
    
    const userHasPermission = useCallback((permission: Permission): boolean => {
        if (!staffUser) return false;
        const userRole = roles.find(r => r.id === staffUser.roleId);
        return userRole?.permissions.includes(permission) ?? false;
    }, [staffUser, roles]);

    const visibleData = useMemo(() => {
        if (!staffUser) {
            return { properties: [], payments: [], tenants: [], agents: [], maintenance: [], users: [], departments: [], roles: [], commissionPayments: [] };
        }
        const role = roles.find(r => r.id === staffUser.roleId);
        if (role?.name === 'Super Admin' || role?.name === 'Accountant') {
            return { properties, payments, tenants, agents, maintenance, users, departments, roles, commissionPayments };
        }
        if (role?.name === 'Property Manager') {
            const managerProperties = properties.filter(p => p.departmentId === staffUser.departmentId);
            const propertyIds = new Set(managerProperties.map(p => p.id));
            const managerTenants = tenants.filter(t => propertyIds.has(t.propertyId));
            const managerPayments = payments.filter(p => propertyIds.has(p.propertyId));
            const managerMaintenance = maintenance.filter(m => propertyIds.has(m.propertyId));
            const managerAgentIds = new Set(managerProperties.map(p => p.agentId));
            const managerAgents = agents.filter(a => managerAgentIds.has(a.id));
            const managerCommissionPayments = commissionPayments.filter(cp => managerAgentIds.has(cp.agentId));
            return { properties: managerProperties, payments: managerPayments, tenants: managerTenants, agents: managerAgents, maintenance: managerMaintenance, users, departments, roles, commissionPayments: managerCommissionPayments };
        }
        if (role?.name === 'Agent') {
            const agentProperties = properties.filter(p => p.agentId === staffUser.id);
            const propertyIds = new Set(agentProperties.map(p => p.id));
            const agentTenants = tenants.filter(t => propertyIds.has(t.propertyId));
            const agentPayments = payments.filter(p => propertyIds.has(p.propertyId));
            const agentMaintenance = maintenance.filter(m => propertyIds.has(m.propertyId));
            const agent = agents.find(a=>a.id === staffUser.id);
            const agentCommissionPayments = commissionPayments.filter(cp => cp.agentId === staffUser.id);
            return { properties: agentProperties, payments: agentPayments, tenants: agentTenants, agents: agent ? [agent] : [], maintenance: agentMaintenance, users, departments, roles, commissionPayments: agentCommissionPayments };
        }
        return { properties, payments, tenants, agents, maintenance, users, departments, roles, commissionPayments };
    }, [staffUser, roles, properties, payments, tenants, agents, maintenance, users, departments, commissionPayments]);
    
    const handleSendNotification = (message: string, type: NotificationType, targetUserId?: string, targetTenantId?: string) => {
        const newNotif: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            message,
            date: new Date().toISOString(),
            type,
            targetUserId,
            targetTenantId,
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const handleLogin = (user: User | Tenant) => {
        setCurrentUser(user);
        setIsLoginModalOpen(false);
        const username = 'username' in user ? user.username : user.fullName;
        const newLog: AuditLogEntry = {
            id: `log-login-${Date.now()}`, timestamp: new Date().toISOString(), userId: user.id, username: username || 'Unknown',
            action: 'USER_LOGIN', details: `User ${username} logged in.`
        };
        setAuditLog(prev => [newLog, ...prev]);

        if ('roleId' in user) {
            const staffUser = user as User;
            const hasPermission = (permission: Permission): boolean => {
                const userRole = roles.find(r => r.id === staffUser.roleId);
                return userRole?.permissions.includes(permission) ?? false;
            };

            const defaultPage = NAV_LINKS.find(link => hasPermission(link.requiredPermission))?.name.toLowerCase() || 'dashboard';
            setActivePage(defaultPage);
            window.location.hash = `#${defaultPage}`;
        } else {
            setActivePage('tenant-dashboard');
            window.location.hash = '#tenant-dashboard';
        }
    };

    const handleLogout = () => {
        if(currentUser) {
            const username = 'username' in currentUser ? currentUser.username : currentUser.fullName;
            addAuditLog('USER_LOGOUT', `User ${username} logged out.`);
        }
        setCurrentUser(null);
        window.location.hash = '';
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    
    const onPrintReceipt = (payment: Payment) => {
        setPaymentForReceipt(payment);
    };

    const onReceiptPrinted = () => {
        if (paymentForReceipt) {
            setPayments(prev => prev.map(p => p.id === paymentForReceipt.id ? { ...p, receiptPrinted: true } : p));
        }
        setPaymentForReceipt(null);
    };
    
    const addSmsLogEntry = (log: SmsLogEntry) => {
        setSmsLog(prev => [log, ...prev]);
    };

    const onSendSms = (tenant: Tenant, message: string) => {
        return sendSms(tenant, message, apiKeys, addSmsLogEntry);
    };

    const onSendGlobalNotification = (target: 'all' | 'staff' | 'tenants', type: 'sms' | 'email' | 'in-app', message: string, subject?: string) => {
        const newNotif: Notification = {
            id: `notif-global-${Date.now()}`,
            message: subject ? `${subject}: ${message}` : message,
            date: new Date().toISOString(),
            type: NotificationType.Global,
            read: false,
        };
        console.log('BROADCAST:', { target, type, message, subject });
        setNotifications(prev => [newNotif, ...prev]);
        addAuditLog('SENT_BROADCAST', `Sent ${type} broadcast to ${target}. Subject: ${subject || 'N/A'}`);
    };

    const markNotificationAsRead = (id: string) => {
        setReadNotificationIds(prev => new Set(prev).add(id));
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadNotificationIds(new Set(allIds));
    };

    useEffect(() => {
        const handleHashChange = () => {
            // Remove # from hash to set active page correctly
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setActivePage(hash);
            } else if (currentUser && 'roleId' in currentUser) {
                setActivePage('dashboard');
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial load
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentUser]);

    // Effect for automated notifications
    useEffect(() => {
        if (currentUser && 'roleId' in currentUser) { // Only run for staff
            const interval = setInterval(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                tenants.forEach(tenant => {
                    const dueDate = new Date(tenant.rentDueDate);
                    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysUntilDue > 0 && daysUntilDue <= 14) {
                        const existingNotifId = `rent-due-${tenant.id}-${daysUntilDue}`;
                        if (!notifications.some(n => n.id === existingNotifId) && !readNotificationIds.has(existingNotifId)) {
                            const newNotif: Notification = {
                                id: existingNotifId, message: `Rent for ${tenant.fullName} is due in ${daysUntilDue} days.`,
                                date: new Date().toISOString(), type: NotificationType.RentReminder, read: false
                            };
                            setNotifications(prev => [newNotif, ...prev]);
                            new Audio(NOTIFICATION_SOUND_BASE64).play().catch(e => console.error("Audio play failed:", e));
                        }
                    }
                });

                const reminderDays = leaseEndReminderDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

                tenants.forEach(tenant => {
                    const leaseEndDate = new Date(tenant.leaseEndDate);
                    leaseEndDate.setHours(0, 0, 0, 0); 
                    const timeDiff = leaseEndDate.getTime() - today.getTime();
                    const daysUntilExpiry = Math.round(timeDiff / (1000 * 60 * 60 * 24));

                    if (daysUntilExpiry >= 0 && reminderDays.includes(daysUntilExpiry)) {
                        const property = properties.find(p => p.id === tenant.propertyId);
                        const propertyName = property ? property.name : 'Unknown Property';
                        const existingNotifId = `lease-expiry-${tenant.id}-${daysUntilExpiry}`;

                        if (!notifications.some(n => n.id === existingNotifId)) {
                             const newNotif: Notification = {
                                id: existingNotifId, message: `Lease for ${tenant.fullName} at ${propertyName} expires in ${daysUntilExpiry} days.`,
                                date: new Date().toISOString(), type: NotificationType.LeaseExpiry, read: false,
                            };
                            setNotifications(prev => [newNotif, ...prev]);
                            new Audio(NOTIFICATION_SOUND_BASE64).play().catch(e => console.error("Audio play failed:", e));
                        }
                    }
                });

            }, 60000); // Check every minute

            return () => clearInterval(interval);
        }
    }, [tenants, notifications, readNotificationIds, currentUser, leaseEndReminderDays, properties]);
    
    if (!currentUser) {
        return (
            <>
                <LandingPage onLoginClick={() => setIsLoginModalOpen(true)} config={landingPageConfig} />
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
            </>
        );
    }

    const renderPage = () => {
        if (!isStaff) {
            const tenant = currentUser as Tenant;
            const propertyForTenant = properties.find(p => p.id === tenant.propertyId);
            if (!propertyForTenant) return <div>Error: Your assigned property could not be found. Please contact management.</div>
            
            const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
            const tenantMaintenance = maintenance.filter(m => m.tenantId === tenant.id);

            return <TenantDashboard tenant={tenant} property={propertyForTenant} payments={tenantPayments} maintenanceRequests={tenantMaintenance} announcements={announcements} setMaintenance={setMaintenance} setPayments={setPayments} onLogout={handleLogout} manualPaymentDetails={manualPaymentDetails} tenants={tenants} setTenants={setTenants} />;
        }

        const pageToRender = activePage.split('/')[0] || 'dashboard';

        const pagePermissionMap: { [key: string]: Permission } = {
            'dashboard': Permission.VIEW_DASHBOARD, 'properties': Permission.VIEW_PROPERTIES,
            'tenants': Permission.VIEW_TENANTS, 'payments': Permission.VIEW_PAYMENTS,
            'maintenance': Permission.VIEW_MAINTENANCE, 'reports': Permission.VIEW_REPORTS,
            'agents': Permission.VIEW_AGENTS, 'emaillog': Permission.VIEW_EMAIL_LOG,
            'pushlog': Permission.VIEW_PUSH_LOG, 'smslog': Permission.VIEW_SMS_LOG,
            'users': Permission.MANAGE_USERS, 'auditlog': Permission.VIEW_AUDIT_LOG,
            'settings': Permission.MANAGE_SETTINGS,
        };

        const requiredPermission = pagePermissionMap[pageToRender];
        if (requiredPermission && !userHasPermission(requiredPermission)) {
            return <AccessDenied />;
        }

        switch(pageToRender) {
          case 'dashboard': return <Dashboard {...visibleData} currentUser={staffUser!} />;
          case 'properties': return <Properties {...visibleData} setProperties={setProperties} currentUser={staffUser!} userHasPermission={userHasPermission} addAuditLog={addAuditLog} />;
          case 'tenants': return <Tenants {...visibleData} templates={templates} setTenants={setTenants} setPayments={setPayments} setProperties={setProperties} currentUser={staffUser!} userHasPermission={userHasPermission} onPrintReceipt={onPrintReceipt} onSendSms={onSendSms} addAuditLog={addAuditLog} />;
          case 'payments': return <Payments {...visibleData} setPayments={setPayments} currentUser={staffUser!} userHasPermission={userHasPermission} onPrintReceipt={onPrintReceipt} addAuditLog={addAuditLog} />;
          case 'maintenance': return <MaintenancePage maintenance={visibleData.maintenance} properties={visibleData.properties} tenants={visibleData.tenants} users={visibleData.users} setMaintenance={setMaintenance} currentUser={staffUser!} userHasPermission={userHasPermission} addAuditLog={addAuditLog} sendNotification={handleSendNotification} />;
          case 'reports': return <Reports {...visibleData} currentUser={staffUser!} />;
          case 'agents': return <Agents {...visibleData} setAgents={setAgents} currentUser={staffUser!} userHasPermission={userHasPermission} commissionPayments={commissionPayments} setCommissionPayments={setCommissionPayments} addAuditLog={addAuditLog} />;
          case 'users': return <Users {...visibleData} setUsers={setUsers} currentUser={staffUser!} userHasPermission={userHasPermission} addAuditLog={addAuditLog} />;
          case 'settings': return <Settings leaseEndReminderDays={leaseEndReminderDays} setLeaseEndReminderDays={setLeaseEndReminderDays} userHasPermission={userHasPermission} roles={roles} setRoles={setRoles} users={users} departments={departments} setDepartments={setDepartments} properties={properties} agents={agents} apiKeys={apiKeys} setApiKeys={setApiKeys} templates={templates} setTemplates={setTemplates} onSendGlobalNotification={onSendGlobalNotification} manualPaymentDetails={manualPaymentDetails} setManualPaymentDetails={setManualPaymentDetails} addAuditLog={addAuditLog} landingPageConfig={landingPageConfig} setLandingPageConfig={setLandingPageConfig} />;
          case 'emaillog': return <EmailLog emailLog={emailLog} />;
          case 'pushlog': return <PushNotificationLog pushLog={pushLog} />;
          case 'smslog': return <SmsLog smsLog={smsLog} />;
          case 'auditlog': return <AuditLog auditLog={auditLog} />;
          default: return <Dashboard {...visibleData} currentUser={staffUser!} />;
        }
    };

    return (
        <>
            <div className={`flex h-screen bg-background text-text-primary`}>
                {isStaff && <Sidebar currentUser={currentUser as User} activePage={activePage} setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} userHasPermission={userHasPermission} />}
                
                <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isStaff ? (isSidebarOpen ? 'ml-64' : 'ml-20') : ''}`}>
                    {isStaff && <Header 
                      currentUser={currentUser as User}
                      roles={roles}
                      activePage={activePage}
                      isSidebarOpen={isSidebarOpen}
                      toggleSidebar={toggleSidebar}
                      notifications={notifications}
                      readNotificationIds={readNotificationIds}
                      markNotificationAsRead={markNotificationAsRead}
                      markAllAsRead={markAllAsRead}
                      onLogout={handleLogout}
                    />
                    }
                    <main className="flex-1 overflow-y-auto">
                        {renderPage()}
                    </main>
                    <footer className="text-center p-4 text-xs text-text-secondary">
                        Developed by <span className="text-primary font-semibold">Jadan Technologies</span>
                    </footer>
                </div>
                
                {paymentForReceipt && 
                <ThermalReceipt 
                    payment={paymentForReceipt} 
                    tenant={tenants.find(t => t.id === paymentForReceipt.tenantId)!}
                    property={properties.find(p => p.id === paymentForReceipt.propertyId)!}
                    agent={agents.find(a => a.id === paymentForReceipt.agentId)}
                    onPrinted={onReceiptPrinted}
                />
                }
            </div>
        </>
    );
}

export default App;
