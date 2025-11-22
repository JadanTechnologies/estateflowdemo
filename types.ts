
export enum PropertyStatus {
  Vacant = 'Vacant',
  Occupied = 'Occupied',
  UnderMaintenance = 'Under Maintenance',
}

export interface Department {
  id: string;
  name: string;
}

export enum PaymentType {
  Rent = 'Rent',
  Deposit = 'Deposit',
  Other = 'Other',
  Subscription = 'Subscription', // New type for Platform Owner
}

export enum PaymentStatus {
  Paid = 'Paid',
  Deposit = 'Deposit',
  Unpaid = 'Unpaid',
  PendingApproval = 'Pending Approval',
}

export enum PaymentMethod {
  Cash = 'Cash',
  Transfer = 'Bank Transfer',
  POS = 'POS',
  Cheque = 'Cheque',
  Manual = 'Manual Entry',
  Paystack = 'Paystack (Online)',
  Flutterwave = 'Flutterwave (Online)',
}

export enum Permission {
  // Platform Owner
  VIEW_PLATFORM_DASHBOARD = 'view_platform_dashboard',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions', // New permission

  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',

  // Properties
  VIEW_PROPERTIES = 'view_properties',
  MANAGE_PROPERTIES = 'manage_properties', // Create, Edit, Delete

  // Tenants
  VIEW_TENANTS = 'view_tenants',
  MANAGE_TENANTS = 'manage_tenants', // Create, Edit

  // Payments
  VIEW_PAYMENTS = 'view_payments',
  MANAGE_PAYMENTS = 'manage_payments', // Create, Edit

  // Maintenance
  VIEW_MAINTENANCE = 'view_maintenance',
  MANAGE_MAINTENANCE = 'manage_maintenance', // Create, Edit

  // Reports
  VIEW_REPORTS = 'view_reports',
  VIEW_EMAIL_LOG = 'view_email_log',
  VIEW_PUSH_LOG = 'view_push_log',
  VIEW_SMS_LOG = 'view_sms_log',

  // Agents
  VIEW_AGENTS = 'view_agents',
  MANAGE_AGENTS = 'manage_agents', // Create, Edit

  // Users
  MANAGE_USERS = 'manage_users',
  VIEW_AUDIT_LOG = 'view_audit_log',

  // Settings & Roles
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  MANAGE_COMMUNICATIONS = 'manage_communications',
  MANAGE_COMMISSIONS = 'manage_commissions',


  // Agent Specific Permissions
  AGENT_CAN_EDIT_OWN_PROPERTIES = 'agent_can_edit_own_properties',
  AGENT_CAN_MANAGE_OWN_TENANTS = 'agent_can_manage_own_tenants', // Add, Edit for their properties
  AGENT_CAN_RECORD_PAYMENTS_FOR_OWN_TENANTS = 'agent_can_record_payments_for_own_tenants',
}

export interface CommissionPayment {
  id: string;
  agentId: string;
  amount: number;
  paymentDate: string;
  periodStartDate: string;
  periodEndDate: string;
  notes?: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  departmentId: string;
  commissionRate?: number; // Commission percentage
}

export interface PropertyDocument {
  name: string;
  url: string;
}

export interface Property {
  id:string;
  name: string;
  unitNumber: string;
  location: string;
  departmentId: string;
  rentAmount: number;
  depositAmount: number;
  owner: string;
  description: string;
  status: PropertyStatus;
  agentId: string;
  images: string[];
  documents: PropertyDocument[];
  notes: string;
}

export interface Guarantor {
  fullName: string;
  phone: string;
  address: string;
  nin: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  nin: string;
  guarantor: Guarantor;
  propertyId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rentDueDate: string;
  profilePhoto?: string;
  notes?: string;
  username?: string;
  password?: string;
  tenantSignature?: string;
  managementSignature?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  date: string;
  notes: string;
  receiptPrinted?: boolean;
  agentId?: string;
  proofOfPayment?: string;
}

export interface Maintenance {
    id: string;
    propertyId: string;
    tenantId?: string;
    task: string;
    cost: number;
    date: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    notes: string;
    assignedToUserId?: string;
    images?: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export enum UserStatus {
    Active = 'Active',
    Suspended = 'Suspended',
    Banned = 'Banned',
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  roleId: string;
  status: UserStatus;
  departmentId?: string; // Optional: Only for Property Managers
  
  // Platform Subscription Fields (For Tenant Admins)
  subscriptionPlanId?: string; // ID of the plan
  subscriptionPlan?: string; // Name of the plan (legacy, kept for compatibility)
  subscriptionStatus?: 'Active' | 'Expired' | 'Trial';
  subscriptionExpiry?: string;
}

export enum NotificationType {
    LeaseExpiry = 'Lease Expiry Reminder',
    RentReminder = 'Rent Reminder',
    OverdueRent = 'Overdue Rent',
    MaintenanceUpdate = 'Maintenance Update',
    PushNotification = 'Push Notification',
    Sms = 'SMS',
    Email = 'Email',
    Global = 'Global Announcement',
}

export interface Notification {
    id: string;
    message: string;
    date: string;
    type: NotificationType;
    targetUserId?: string;
    targetTenantId?: string;
    read?: boolean;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    status?: string; // e.g., 'Published'
}

export interface EmailLogEntry {
    id: string;
    timestamp: string;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
}

export interface PushNotificationLogEntry {
    id: string;
    timestamp: string;
    recipientId: string;
    recipientName: string;
    title: string;
    body: string;
}

export interface SmsLogEntry {
    id: string;
    timestamp: string;
    recipientPhone: string;
    recipientName: string;
    message: string;
}

export interface ApiKeys {
    twilioSid: string;
    twilioToken: string;
    firebaseKey: string;
    paystackKey: string;
    flutterwaveKey: string;
    monnifyKey: string;
}

export interface ManualPaymentDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
}

export enum TemplateType {
    RentReminder = 'Rent Reminder',
    OverdueNotice = 'Overdue Notice',
    LeaseExpiry = 'Lease Expiry',
    Welcome = 'Welcome Email',
    Custom = 'Custom',
}

export interface NotificationTemplate {
    id: string;
    name: string;
    type: TemplateType;
    subject: string; // For email
    body: string; // For email/SMS content
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  targetId?: string; // ID of the property, tenant, user etc.
}

// Platform Global Configuration
export interface PlatformConfig {
    defaultTrialDurationDays: number;
}

// Landing Page Configuration Types
export interface LandingPageFeature {
    title: string;
    description: string;
    icon: string;
}

export interface LandingPagePricingPlan {
    id: string;
    name: string;
    price: string;
    period: string; // e.g., "/mo"
    features: string[]; // Text description of features for the landing page
    highlighted?: boolean;
    
    // System Limits & Feature Gates
    maxProperties: number; // -1 for unlimited
    maxUsers: number;
    maxTenants: number;
    enableAiReports: boolean;
    enableSms: boolean;
}

export interface LandingPageFaq {
    question: string;
    answer: string;
}

export interface LandingPageTestimonial {
    name: string;
    role: string;
    comment: string;
    avatarUrl?: string;
}

export interface LandingPageBlogPost {
    title: string;
    excerpt: string;
    date: string;
    imageUrl?: string;
}

export interface LandingPageConfig {
    hero: {
        title: string;
        subtitle: string;
        ctaText: string;
    };
    about: {
        title: string;
        description: string;
        imageUrl?: string;
    };
    features: {
        title: string;
        subtitle: string;
        items: LandingPageFeature[];
    };
    howItWorks: {
        title: string;
        steps: { title: string; description: string }[];
    };
    pricing: {
        title: string;
        subtitle: string;
        plans: LandingPagePricingPlan[];
    };
    testimonials: {
        title: string;
        items: LandingPageTestimonial[];
    };
    faqs: {
        title: string;
        items: LandingPageFaq[];
    };
    blog: {
        title: string;
        posts: LandingPageBlogPost[];
    };
    legal: {
        privacyPolicy: string;
        termsOfService: string;
        refundPolicy: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
    };
}
