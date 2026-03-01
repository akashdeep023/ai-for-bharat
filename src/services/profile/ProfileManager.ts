import { UserProfile } from '../../types';
import { LocalDatabase } from '../storage/LocalDatabase';
import { randomBytes } from 'crypto';

/**
 * ProfileManager handles CRUD operations for user profiles
 * Supports both local (SQLite) and cloud (DynamoDB) storage
 */
export class ProfileManager {
  private localDB: LocalDatabase;

  constructor(localDB: LocalDatabase) {
    this.localDB = localDB;
  }

  /**
   * Create a new user profile
   */
  async createProfile(profile: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const userId = this.generateUserId();
    const now = new Date();
    
    const newProfile: UserProfile = {
      ...profile,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    // Store locally with encryption
    await this.localDB.storeUserProfile(newProfile);

    return newProfile;
  }

  /**
   * Get user profile by userId
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    return await this.localDB.getUserProfile(userId);
  }

  /**
   * Get user profile by mobile number
   */
  async getProfileByMobile(mobileNumber: string): Promise<UserProfile | null> {
    return await this.localDB.getUserProfileByMobile(mobileNumber);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>): Promise<UserProfile> {
    const existingProfile = await this.getProfile(userId);
    
    if (!existingProfile) {
      throw new Error(`Profile not found for userId: ${userId}`);
    }

    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      userId: existingProfile.userId, // Ensure userId cannot be changed
      createdAt: existingProfile.createdAt, // Preserve creation date
      updatedAt: new Date(),
    };

    await this.localDB.updateUserProfile(updatedProfile);

    return updatedProfile;
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    await this.localDB.deleteUserProfile(userId);
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile !== null;
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return randomBytes(16).toString('hex');
  }
}
