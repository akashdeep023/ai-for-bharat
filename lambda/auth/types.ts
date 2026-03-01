// Authentication types and interfaces

export interface OTPResponse {
  success: boolean;
  expiresAt: Date;
  attemptsRemaining: number;
  message?: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface OTPRecord {
  mobileNumber: string;
  otp: string;
  expiresAt: number; // Unix timestamp
  attempts: number;
  createdAt: number; // Unix timestamp
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  authToken: string;
  deviceId: string;
  expiresAt: number; // Unix timestamp
  lastActivityAt: number; // Unix timestamp
  createdAt: number; // Unix timestamp
}
