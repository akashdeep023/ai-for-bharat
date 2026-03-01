import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { UserProfile } from './types';
import { randomBytes } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PROFILES_TABLE = process.env.PROFILES_TABLE || 'UserProfiles';

export class ProfileService {
  /**
   * Create a new user profile
   */
  async createProfile(
    profile: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfile> {
    const userId = this.generateUserId();
    const now = new Date().toISOString();

    const newProfile: UserProfile = {
      ...profile,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    // Validate required fields
    this.validateProfile(newProfile);

    await docClient.send(
      new PutCommand({
        TableName: PROFILES_TABLE,
        Item: newProfile,
        ConditionExpression: 'attribute_not_exists(userId)',
      })
    );

    return newProfile;
  }

  /**
   * Get user profile by userId
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: PROFILES_TABLE,
        Key: { userId },
      })
    );

    return (result.Item as UserProfile) || null;
  }

  /**
   * Get user profile by mobile number
   */
  async getProfileByMobile(mobileNumber: string): Promise<UserProfile | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: PROFILES_TABLE,
        IndexName: 'MobileNumberIndex',
        KeyConditionExpression: 'mobileNumber = :mobile',
        ExpressionAttributeValues: {
          ':mobile': mobileNumber,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return result.Items[0] as UserProfile;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>
  ): Promise<UserProfile> {
    const now = new Date().toISOString();

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'userId' && key !== 'createdAt') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Always update the updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const result = await docClient.send(
      new UpdateCommand({
        TableName: PROFILES_TABLE,
        Key: { userId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
        ConditionExpression: 'attribute_exists(userId)',
      })
    );

    return result.Attributes as UserProfile;
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: PROFILES_TABLE,
        Key: { userId },
        ConditionExpression: 'attribute_exists(userId)',
      })
    );
  }

  /**
   * Validate profile data
   */
  private validateProfile(profile: UserProfile): void {
    const requiredFields = [
      'userId',
      'mobileNumber',
      'name',
      'location',
      'farmSize',
      'primaryCrops',
      'soilType',
      'languagePreference',
    ];

    for (const field of requiredFields) {
      if (!profile[field as keyof UserProfile]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate mobile number format (Indian mobile numbers)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(profile.mobileNumber)) {
      throw new Error('Invalid mobile number format');
    }

    // Validate farm size
    if (profile.farmSize <= 0) {
      throw new Error('Farm size must be greater than 0');
    }

    // Validate location
    if (
      !profile.location.state ||
      !profile.location.district ||
      !profile.location.pincode
    ) {
      throw new Error('Incomplete location information');
    }

    // Validate coordinates
    if (
      profile.location.coordinates.latitude < -90 ||
      profile.location.coordinates.latitude > 90 ||
      profile.location.coordinates.longitude < -180 ||
      profile.location.coordinates.longitude > 180
    ) {
      throw new Error('Invalid coordinates');
    }
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return randomBytes(16).toString('hex');
  }
}
