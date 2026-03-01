// Authentication Manager for login/logout flows

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { OTPService } from './otpService';
import { SessionManager } from './sessionManager';
import { OTPResponse, AuthToken } from './types';
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USER_TABLE = process.env.USER_TABLE || 'farmer-platform-users';

interface UserRecord {
  userId: string;
  mobileNumber: string;
  createdAt: number;
  updatedAt: number;
}

export class AuthenticationManager {
  private otpService: OTPService;
  private sessionManager: SessionManager;

  constructor() {
    this.otpService = new OTPService();
    this.sessionManager = new SessionManager();
  }

  /**
   * Send OTP to mobile number for authentication
   */
  async sendOTP(mobileNumber: string): Promise<OTPResponse> {
    return await this.otpService.generateOTP(mobileNumber);
  }

  /**
   * Verify OTP and create session (login)
   */
  async verifyOTP(
    mobileNumber: string,
    otp: string,
    deviceId: string
  ): Promise<{
    success: boolean;
    authToken?: AuthToken;
    message: string;
    attemptsRemaining?: number;
  }> {
    // Validate OTP
    const validation = await this.otpService.validateOTP(mobileNumber, otp);

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        attemptsRemaining: validation.attemptsRemaining,
      };
    }

    // Check if user exists, if not create new user
    let userId = await this.getUserIdByMobileNumber(mobileNumber);
    if (!userId) {
      userId = await this.createUser(mobileNumber);
    }

    // Create session
    const authToken = await this.sessionManager.createSession(
      userId,
      mobileNumber,
      deviceId
    );

    return {
      success: true,
      authToken,
      message: 'Authentication successful',
    };
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(token: string): Promise<{
    success: boolean;
    authToken?: AuthToken;
    message: string;
  }> {
    const newToken = await this.sessionManager.refreshToken(token);

    if (!newToken) {
      return {
        success: false,
        message: 'Failed to refresh token',
      };
    }

    return {
      success: true,
      authToken: newToken,
      message: 'Token refreshed successfully',
    };
  }

  /**
   * Logout user by deleting session
   */
  async logout(token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // Validate token to get session ID
    const validation = await this.sessionManager.validateToken(token);

    if (!validation.valid || !validation.sessionId) {
      return {
        success: false,
        message: 'Invalid token',
      };
    }

    // Delete session
    const deleted = await this.sessionManager.deleteSession(validation.sessionId);

    if (!deleted) {
      return {
        success: false,
        message: 'Failed to logout',
      };
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    message?: string;
  }> {
    return await this.sessionManager.validateToken(token);
  }

  /**
   * Get user ID by mobile number
   */
  private async getUserIdByMobileNumber(
    mobileNumber: string
  ): Promise<string | null> {
    try {
      const result = await docClient.send(
        new GetCommand({
          TableName: USER_TABLE,
          Key: { mobileNumber },
        })
      );

      const user = result.Item as UserRecord | undefined;
      return user?.userId || null;
    } catch (error) {
      console.error('Error getting user by mobile number:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  private async createUser(mobileNumber: string): Promise<string> {
    const userId = this.generateUserId();
    const now = Date.now();

    const userRecord: UserRecord = {
      userId,
      mobileNumber,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: USER_TABLE,
        Item: userRecord,
      })
    );

    return userId;
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return `user_${crypto.randomBytes(16).toString('hex')}`;
  }
}
