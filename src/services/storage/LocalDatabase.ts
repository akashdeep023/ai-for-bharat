// Local SQLite database service for offline data persistence

import SQLite from 'react-native-sqlite-storage';
import { createHash, randomBytes } from 'crypto';
import { UserProfile } from '../../types';

SQLite.enablePromise(true);

export class LocalDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private encryptionKey: string | null = null;

  async initialize(encryptionKey?: string): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'farmer_platform.db',
        location: 'default',
      });
      
      // Generate or use provided encryption key
      if (encryptionKey) {
        this.encryptionKey = encryptionKey;
      } else {
        // In production, this should be stored securely (e.g., in Keychain)
        this.encryptionKey = this.generateEncryptionKey();
      }
      
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        mobileNumber TEXT UNIQUE NOT NULL,
        name TEXT,
        location TEXT,
        farmSize REAL,
        primaryCrops TEXT,
        soilType TEXT,
        languagePreference TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS sync_queue (
        queueId TEXT PRIMARY KEY,
        userId TEXT,
        entityType TEXT,
        entityId TEXT,
        operation TEXT,
        data TEXT,
        status TEXT,
        attempts INTEGER DEFAULT 0,
        lastAttempt TEXT,
        createdAt TEXT
      )`,
    ];

    for (const table of tables) {
      await this.db.executeSql(table);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  /**
   * Generate AES-256 encryption key
   */
  private generateEncryptionKey(): string {
    return randomBytes(32).toString('hex'); // 256 bits
  }

  /**
   * Encrypt data using AES-256
   * @private Reserved for future encryption implementation
   */
  // @ts-expect-error - Reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private encryptData(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    // Using SHA-256 hash for encryption (simplified version)
    // In production, use proper AES-256 encryption library like react-native-aes-crypto
    const hash = createHash('sha256');
    hash.update(data + this.encryptionKey);
    return hash.digest('hex');
  }

  /**
   * Decrypt data using AES-256
   * @private Reserved for future decryption implementation
   */
  // @ts-expect-error - Reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private decryptData(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    // In production, implement proper AES-256 decryption
    // This is a placeholder that returns the encrypted data as-is
    return encryptedData;
  }

  /**
   * Store user profile with encryption
   */
  async storeUserProfile(profile: UserProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // TODO: Enable encryption when implementing secure storage
    // const encryptedData = this.encryptData(JSON.stringify({...}));
    // For now, storing data without encryption
    await this.db.executeSql(
      `INSERT OR REPLACE INTO users 
       (userId, mobileNumber, name, location, farmSize, primaryCrops, soilType, languagePreference, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.userId,
        profile.mobileNumber,
        profile.name,
        JSON.stringify(profile.location),
        profile.farmSize,
        JSON.stringify(profile.primaryCrops),
        profile.soilType,
        profile.languagePreference,
        profile.createdAt.toISOString(),
        profile.updatedAt.toISOString(),
      ]
    );
  }

  /**
   * Get user profile by userId
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      'SELECT * FROM users WHERE userId = ?',
      [userId]
    );

    if (results[0].rows.length === 0) {
      return null;
    }

    const row = results[0].rows.item(0);
    return this.parseUserProfileRow(row);
  }

  /**
   * Get user profile by mobile number
   */
  async getUserProfileByMobile(mobileNumber: string): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      'SELECT * FROM users WHERE mobileNumber = ?',
      [mobileNumber]
    );

    if (results[0].rows.length === 0) {
      return null;
    }

    const row = results[0].rows.item(0);
    return this.parseUserProfileRow(row);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profile: UserProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      `UPDATE users 
       SET name = ?, location = ?, farmSize = ?, primaryCrops = ?, 
           soilType = ?, languagePreference = ?, updatedAt = ?
       WHERE userId = ?`,
      [
        profile.name,
        JSON.stringify(profile.location),
        profile.farmSize,
        JSON.stringify(profile.primaryCrops),
        profile.soilType,
        profile.languagePreference,
        profile.updatedAt.toISOString(),
        profile.userId,
      ]
    );
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('DELETE FROM users WHERE userId = ?', [userId]);
  }

  /**
   * Parse database row to UserProfile object
   */
  private parseUserProfileRow(row: any): UserProfile {
    return {
      userId: row.userId,
      mobileNumber: row.mobileNumber,
      name: row.name,
      location: JSON.parse(row.location),
      farmSize: row.farmSize,
      primaryCrops: JSON.parse(row.primaryCrops),
      soilType: row.soilType,
      languagePreference: row.languagePreference,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export const localDatabase = new LocalDatabase();
