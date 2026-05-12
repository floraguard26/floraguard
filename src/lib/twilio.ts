// Twilio Verify wrapper for OTP send/verify
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID in .env.local
import twilio from "twilio";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured. See .env.example.");
  }

  return twilio(accountSid, authToken);
}

/**
 * Normalize phone to E.164 format so Twilio send and verify always use
 * the exact same string. Strips spaces, dashes, parentheses.
 * e.g. "+91 98765 43210" → "+919876543210"
 */
function normalizePhone(phone: string): string {
  // Keep the leading + if present, strip everything else that isn't a digit
  const hasPlus = phone.trimStart().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** Send an OTP to the given phone number via Twilio Verify */
export async function sendOtp(phone: string): Promise<{ success: boolean; sid?: string }> {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!serviceSid) throw new Error("TWILIO_VERIFY_SERVICE_SID is not set.");

  const client = getClient();
  const verification = await client.verify.v2
    .services(serviceSid)
    .verifications.create({ to: normalizePhone(phone), channel: "sms" });

  return { success: true, sid: verification.sid };
}

/** Verify the OTP code entered by the user */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ valid: boolean }> {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!serviceSid) throw new Error("TWILIO_VERIFY_SERVICE_SID is not set.");

  const client = getClient();
  const check = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({ to: normalizePhone(phone), code });

  return { valid: check.status === "approved" };
}
