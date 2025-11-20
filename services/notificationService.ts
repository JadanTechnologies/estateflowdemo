import { SmsLogEntry, Tenant, ApiKeys } from '../types';

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

  // 5. Return success
  return { success: true, message: "SMS sent successfully (simulated)." };
};
