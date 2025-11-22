
import { SmsLogEntry, EmailLogEntry, Tenant, ApiKeys, User } from '../types';

export const sendSms = (
  tenant: Tenant,
  message: string,
  apiKeys: ApiKeys,
  addSmsLogEntry: (log: SmsLogEntry) => void
): { success: boolean; message: string } => {
  // 1. Check for API keys
  if (!apiKeys.twilioSid || !apiKeys.twilioToken) {
    const errorMsg = "Twilio credentials are not configured in settings.";
    console.warn(errorMsg);
    return { success: false, message: errorMsg };
  }
  
  // 2. Check if tenant has a phone number
  if (!tenant.phone) {
      const errorMsg = `Tenant ${tenant.fullName} has no phone number.`;
      console.warn(errorMsg);
      return { success: false, message: errorMsg };
  }

  // 3. Simulate sending SMS
  console.log(`
    --- SIMULATING TWILIO SMS ---
    To: ${tenant.phone} (${tenant.fullName})
    Message: ${message}
    Using SID: ${apiKeys.twilioSid.substring(0, 5)}...
    -----------------------------
  `);

  // 4. Create a log entry
  const logEntry: SmsLogEntry = {
    id: `sms_${Date.now()}`,
    timestamp: new Date().toISOString(),
    recipientPhone: tenant.phone,
    recipientName: tenant.fullName,
    message: message,
  };
  addSmsLogEntry(logEntry);

  return { success: true, message: "SMS sent successfully (simulated)." };
};

export const sendEmail = (
    recipient: { email: string; name: string },
    subject: string,
    body: string,
    apiKeys: ApiKeys,
    addEmailLogEntry: (log: EmailLogEntry) => void
): { success: boolean; message: string } => {
    // 1. Validation
    if (!recipient.email) {
        return { success: false, message: "Recipient has no email address." };
    }

    // 2. Simulate Resend API Call
    console.log(`
    --- SIMULATING RESEND EMAIL ---
    To: ${recipient.name} <${recipient.email}>
    Subject: ${subject}
    Body: ${body}
    Provider: Resend (Simulated)
    -------------------------------
    `);

    // 3. Create Log Entry
    const logEntry: EmailLogEntry = {
        id: `email_${Date.now()}`,
        timestamp: new Date().toISOString(),
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        subject: subject,
        body: body
    };
    addEmailLogEntry(logEntry);

    return { success: true, message: "Email sent via Resend (simulated)." };
};
