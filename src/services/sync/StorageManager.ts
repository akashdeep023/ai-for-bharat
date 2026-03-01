// Storage management service for enforcing storage limits

import type SQLite from 'react-native-sqlite-storage';
import { StorageInfo } from '../../types/sync';
import RNFS from 'react-native-fs';

const STORAGE_LIMIT_MB = 500;
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_MB * 1024 * 1024;

export interface CachedDataInfo {
  entityType: string;
  entityId: string;
  size: number;
  lastAccessed: Date;
  isEssential: boolean;
}

export class StorageManager {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbPath: string = '';

  /**
   * Initialize storage manager with database connection
   */
  async initialize(db: SQLite.SQLiteDatabase, dbPath: string): Promise<void> {
    this.db = db;
    this.dbPath = dbPath;
    await this.createTables();
  }

  /**
   * Create storage tracking tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS cached_data (
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        size INTEGER NOT NULL,
        lastAccessed TEXT NOT NULL,
        isEssential INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        PRIMARY KEY (entityType, entityId)
      )
    `);

    // Create index for cleanup queries
    await this.db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_cached_data_cleanup 
      ON cached_data(isEssential, lastAccessed)
    `);
  }

  /**
   * Get current storage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      // Get database file size
      const dbStats = await RNFS.stat(this.dbPath);
      const usedSize = dbStats.size;

      return {
        totalSize: STORAGE_LIMIT_BYTES,
        usedSize,
        availableSize: STORAGE_LIMIT_BYTES - usedSize,
        limitSize: STORAGE_LIMIT_BYTES,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalSize: STORAGE_LIMIT_BYTES,
        usedSize: 0,
        availableSize: STORAGE_LIMIT_BYTES,
        limitSize: STORAGE_LIMIT_BYTES,
      };
    }
  }

  /**
   * Check if storage limit is reached
   */
  async isStorageLimitReached(): Promise<boolean> {
    const info = await this.getStorageInfo();
    return info.usedSize >= info.limitSize;
  }

  /**
   * Track cached data
   */
  async trackCachedData(
    entityType: string,
    entityId: string,
    size: number,
    isEssential: boolean
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    await this.db.executeSql(
      `INSERT OR REPLACE INTO cached_data 
       (entityType, entityId, size, lastAccessed, isEssential, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entityType, entityId, size, now, isEssential ? 1 : 0, now]
    );
  }

  /**
   * Update last accessed time for cached data
   */
  async updateLastAccessed(entityType: string, entityId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    await this.db.executeSql(
      `UPDATE cached_data 
       SET lastAccessed = ?
       WHERE entityType = ? AND entityId = ?`,
      [now, entityType, entityId]
    );
  }

  /**
   * Clean up old cached data to free space
   */
  async cleanupOldData(targetBytes: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    let freedBytes = 0;

    // Get non-essential cached data ordered by last accessed (oldest first)
    const results = await this.db.executeSql(
      `SELECT * FROM cached_data 
       WHERE isEssential = 0
       ORDER BY lastAccessed ASC`
    );

    for (let i = 0; i < results[0].rows.length && freedBytes < targetBytes; i++) {
      const row = results[0].rows.item(i);
      
      try {
        // Delete the actual data
        await this.deleteCachedEntity(row.entityType, row.entityId);
        
        // Remove from tracking
        await this.db.executeSql(
          `DELETE FROM cached_data 
           WHERE entityType = ? AND entityId = ?`,
          [row.entityType, row.entityId]
        );

        freedBytes += row.size;
      } catch (error) {
        console.error(`Error deleting cached data ${row.entityType}:${row.entityId}:`, error);
      }
    }

    return freedBytes;
  }

  /**
   * Enforce storage limit by cleaning up old data
   */
  async enforceStorageLimit(): Promise<void> {
    const info = await this.getStorageInfo();

    if (info.usedSize >= info.limitSize) {
      // Need to free up at least 10% of storage
      const targetBytes = Math.floor(info.limitSize * 0.1);
      const freedBytes = await this.cleanupOldData(targetBytes);
      
      console.log(`Storage limit reached. Freed ${freedBytes} bytes.`);
    }
  }

  /**
   * Mark data as essential (won't be deleted during cleanup)
   */
  async markAsEssential(entityType: string, entityId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      `UPDATE cached_data 
       SET isEssential = 1
       WHERE entityType = ? AND entityId = ?`,
      [entityType, entityId]
    );
  }

  /**
   * Get list of cached data
   */
  async getCachedDataList(): Promise<CachedDataInfo[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      `SELECT * FROM cached_data 
       ORDER BY lastAccessed DESC`
    );

    const dataList: CachedDataInfo[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      dataList.push({
        entityType: row.entityType,
        entityId: row.entityId,
        size: row.size,
        lastAccessed: new Date(row.lastAccessed),
        isEssential: row.isEssential === 1,
      });
    }

    return dataList;
  }

  /**
   * Delete cached entity data
   */
  private async deleteCachedEntity(entityType: string, entityId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete based on entity type
    switch (entityType) {
      case 'weather':
        await this.db.executeSql(
          'DELETE FROM weather_cache WHERE entityId = ?',
          [entityId]
        );
        break;
      case 'market_price':
        await this.db.executeSql(
          'DELETE FROM market_price_cache WHERE entityId = ?',
          [entityId]
        );
        break;
      case 'training_content':
        await this.db.executeSql(
          'DELETE FROM training_cache WHERE entityId = ?',
          [entityId]
        );
        break;
      default:
        console.warn(`Unknown entity type for deletion: ${entityType}`);
    }
  }

  /**
   * Get storage usage by entity type
   */
  async getStorageByType(): Promise<Map<string, number>> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      `SELECT entityType, SUM(size) as totalSize 
       FROM cached_data 
       GROUP BY entityType`
    );

    const storageMap = new Map<string, number>();
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      storageMap.set(row.entityType, row.totalSize);
    }

    return storageMap;
  }
}
