// OTP Service with SMS gateway integration

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { OTPResponse, OTPRecord } from './types';
import { sendSMS } from './smsGateway';
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const OTP_TABLE = process.env.OTP_TABLE || 'farmer-platform-otp';
const OTP_EXPIRATION_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const OTP_LENGTH = 6;

export class OTPService {
  /**
   * Generate a cryptographically secure random OTP
   */
  private generateSecureOTP(): string {
    // Generate random bytes and convert to numeric string
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    // Ensure OTP is exactly 6 digits
    const otp = (randomNumber % 1000000).toString().padStart(OTP_LENGTH, '0');
    return otp;
  }

  /**
   * Generate and send OTP to mobile number
   */
  async generateOTP(mobileNumber: string): Promise<OTPResponse> {
    try {
      // Validate mobile number format (Indian mobile numbers)
      if (!this.isValidMobileNumber(mobileNumber)) {
        return {
          success: false,
          expiresAt: new Date(),
          attemptsRemaining: 0,
          message: 'Invalid mobile number format',
        };
      }

      // Generate secure OTP
      const otp = this.generateSecureOTP();
      const now = Date.now();
      const expiresAt = now + OTP_EXPIRATION_MINUTES * 60 * 1000;

      // Store OTP in DynamoDB
      const otpRecord: OTPRecord = {
        mobileNumber,
        otp,
        expiresAt,
        attempts: 0,
        createdAt: now,
      };

      await docClient.send(
        new PutCommand({
          TableName: OTP_TABLE,
          Item: otpRecord,
        })
      );

      // Send OTP via SMS
      const smsResult = await sendSMS(
        mobileNumber,
        `Your OTP for Farmer Platform is: ${otp}. Valid for ${OTP_EXPIRATION_MINUTES} minutes. Do not share with anyone.`
      );

      if (!smsResult.success) {
        return {
          success: false,
          expiresAt: new Date(expiresAt),
          attemptsRemaining: MAX_ATTEMPTS,
          message: 'Failed to send OTP via SMS',
        };
      }

      return {
        success: true,
        expiresAt: new Date(expiresAt),
        attemptsRemaining: MAX_ATTEMPTS,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      console.error('Error generating OTP:', error);
      return {
        success: false,
        expiresAt: new Date(),
        attemptsRemaining: 0,
        message: 'Internal error generating OTP',
      };
    }
  }

  /**
   * Validate OTP for a mobile number
   */
  async validateOTP(
    mobileNumber: string,
    otp: string
  ): Promise<{ valid: boolean; message: string; attemptsRemaining: number }> {
    try {
      // Retrieve OTP record from DynamoDB
      const result = await docClient.send(
        new GetCommand({
          TableName: OTP_TABLE,
          Key: { mobileNumber },
        })
      );

      const otpRecord = result.Item as OTPRecord | undefined;

      if (!otpRecord) {
        return {
          valid: false,
          message: 'No OTP found for this mobile number',
          attemptsRemaining: 0,
        };
      }

      // Check if OTP has expired
      const now = Date.now();
      if (now > otpRecord.expiresAt) {
        return {
          valid: false,
          message: 'OTP has expired',
          attemptsRemaining: 0,
        };
      }

      // Check if max attempts exceeded
      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        return {
          valid: false,
          message: 'Maximum attempts exceeded',
          attemptsRemaining: 0,
        };
      }

      // Validate OTP
      if (otpRecord.otp === otp) {
        // OTP is valid - we can delete it or mark as used
        // For now, we'll leave it to expire naturally
        return {
          valid: true,
          message: 'OTP validated successfully',
          attemptsRemaining: MAX_ATTEMPTS - otpRecord.attempts,
        };
      } else {
        // Increment attempt counter
        const newAttempts = otpRecord.attempts + 1;
        await docClient.send(
          new UpdateCommand({
            TableName: OTP_TABLE,
            Key: { mobileNumber },
            UpdateExpression: 'SET attempts = :attempts',
            ExpressionAttributeValues: {
              ':attempts': newAttempts,
            },
          })
        );

        return {
          valid: false,
          message: 'Invalid OTP',
          attemptsRemaining: MAX_ATTEMPTS - newAttempts,
        };
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      return {
        valid: false,
        message: 'Internal error validating OTP',
        attemptsRemaining: 0,
      };
    }
  }

  /**
   * Validate Indian mobile number format
   */
  private isValidMobileNumber(mobileNumber: string): boolean {
    // Indian mobile numbers: +91 followed by 10 digits starting with 6-9
    const regex = /^\+91[6-9]\d{9}$/;
    return regex.test(mobileNumber);
  }
}
