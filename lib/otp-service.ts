import crypto from 'crypto';

export interface OTPData {
  otp: string;
  email: string;
  expiresAt: Date;
  attempts: number;
  type: 'registration' | 'login';
  userData?: any;
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, OTPData>();

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function storeOTP(email: string, otp: string, type: 'registration' | 'login', userData?: any): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStorage.set(email, {
    otp,
    email,
    expiresAt,
    attempts: 0,
    type,
    userData,
  });
  cleanupExpiredOTPs();
}

export function verifyOTP(email: string, inputOTP: string): { success: boolean; message: string; userData?: any } {
  const storedOTP = otpStorage.get(email);
  
  if (!storedOTP) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  if (new Date() > storedOTP.expiresAt) {
    otpStorage.delete(email);
    return { success: false, message: 'OTP has expired' };
  }
  
  if (storedOTP.attempts >= 3) {
    otpStorage.delete(email);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP' };
  }
  
  if (storedOTP.otp !== inputOTP) {
    storedOTP.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }
  const userData = storedOTP.userData;
  otpStorage.delete(email);
  
  return { success: true, message: 'OTP verified successfully', userData };
}

export function getOTPData(email: string): OTPData | null {
  return otpStorage.get(email) || null;
}

export function deleteOTP(email: string): void {
  otpStorage.delete(email);
}

function cleanupExpiredOTPs(): void {
  const now = new Date();
  for (const [email, { expiresAt }] of otpStorage.entries()) {
    if (now > expiresAt) {
      otpStorage.delete(email);
    }
  }
}

setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
