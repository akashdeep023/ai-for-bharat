// Session Manager for token management

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { SessionRecord, AuthToken } from './types';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SESSION_TABLE = process.env.SESSION_TABLE || 'farmer-platform-sessions';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const SESSION_EXPIRATION_DAYS = 30;
const INACTIVITY_TIMEOUT_DAYS = 30;

export class SessionManager {
  /**
   * Create a new session for a user
   */
  async createSession(
    userId: string,
    mobileNumber: string,
    deviceId: string
  ): Promise<AuthToken> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const expiresAt = now + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId,
        sessionId,
        mobileNumber,
        deviceId,
      },
      JWT_SECRET,
      {
        expiresIn: `${SESSION_EXPIRATION_DAYS}d`,
      }
    );

    // Store session in DynamoDB
    const sessionRecord: SessionRecord = {
      sessionId,
      userId,
      authToken: token,
      deviceId,
      expiresAt,
      lastActivityAt: now,
      createdAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: SESSION_TABLE,
        Item: sessionRecord,
      })
    );

    return {
      token,
      userId,
      expiresAt: new Date(expiresAt),
    };
  }

  /**
   * Validate a session token
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    sessionId?: string;
    message?: string;
  }> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        sessionId: string;
        mobileNumber: string;
        deviceId: string;
      };

      // Retrieve session from DynamoDB
      const result = await docClient.send(
        new GetCommand({
          TableName: SESSION_TABLE,
          Key: { sessionId: decoded.sessionId },
        })
      );

      const session = result.Item as SessionRecord | undefined;

      if (!session) {
        return {
          valid: false,
          message: 'Session not found',
        };
      }

      // Check if session has expired
      const now = Date.now();
      if (now > session.expiresAt) {
        return {
          valid: false,
          message: 'Session has expired',
        };
      }

      // Check for inactivity timeout (30 days)
      const inactivityThreshold = INACTIVITY_TIMEOUT_DAYS * 24 * 60 * 60 * 1000;
      if (now - session.lastActivityAt > inactivityThreshold) {
        // Auto-logout due to inactivity
        await this.deleteSession(decoded.sessionId);
        return {
          valid: false,
          message: 'Session expired due to inactivity',
        };
      }

      // Update last activity timestamp
      await this.updateLastActivity(decoded.sessionId);

      return {
        valid: true,
        userId: decoded.userId,
        sessionId: decoded.sessionId,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          message: 'Invalid token',
        };
      }
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          message: 'Token has expired',
        };
      }
      console.error('Error validating token:', error);
      return {
        valid: false,
        message: 'Internal error validating token',
      };
    }
  }

  /**
   * Refresh an existing session token
   */
  async refreshToken(oldToken: string): Promise<AuthToken | null> {
    try {
      // Validate the old token first
      const validation = await this.validateToken(oldToken);
      if (!validation.valid || !validation.userId || !validation.sessionId) {
        return null;
      }

      // Get the session record
      const result = await docClient.send(
        new GetCommand({
          TableName: SESSION_TABLE,
          Key: { sessionId: validation.sessionId },
        })
      );

      const session = result.Item as SessionRecord | undefined;
      if (!session) {
        return null;
      }

      // Generate new token with extended expiration
      const now = Date.now();
      const expiresAt = now + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

      const decoded = jwt.verify(oldToken, JWT_SECRET) as {
        userId: string;
        sessionId: string;
        mobileNumber: string;
        deviceId: string;
      };

      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          mobileNumber: decoded.mobileNumber,
          deviceId: decoded.deviceId,
        },
        JWT_SECRET,
        {
          expiresIn: `${SESSION_EXPIRATION_DAYS}d`,
        }
      );

      // Update session record
      await docClient.send(
        new UpdateCommand({
          TableName: SESSION_TABLE,
          Key: { sessionId: validation.sessionId },
          UpdateExpression:
            'SET authToken = :token, expiresAt = :expiresAt, lastActivityAt = :lastActivityAt',
          ExpressionAttributeValues: {
            ':token': newToken,
            ':expiresAt': expiresAt,
            ':lastActivityAt': now,
          },
        })
      );

      return {
        token: newToken,
        userId: validation.userId,
        expiresAt: new Date(expiresAt),
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Delete a session (logout)
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: SESSION_TABLE,
          Key: { sessionId },
        })
      );
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Update last activity timestamp for a session
   */
  private async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await docClient.send(
        new UpdateCommand({
          TableName: SESSION_TABLE,
          Key: { sessionId },
          UpdateExpression: 'SET lastActivityAt = :lastActivityAt',
          ExpressionAttributeValues: {
            ':lastActivityAt': Date.now(),
          },
        })
      );
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
