// Sync queue management for pending changes

import type SQLite from 'react-native-sqlite-storage';
import { SyncQueueItem } from '../../types/sync';
import { v4 as uuidv4 } from 'uuid';

export class SyncQueue {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize sync queue with database connection
   */
  async initialize(db: SQLite.SQLiteDatabase): Promise<void> {
    this.db = db;
    await this.createTables();
  }

  /**
   * Create sync queue tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        queueId TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        lastAttempt TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // Create index for faster queries
    await this.db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status 
      ON sync_queue(status, createdAt)
    `);
  }

  /**
   * Add item to sync queue
   */
  async enqueue(
    userId: string,
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const queueId = uuidv4();
    const now = new Date().toISOString();

    await this.db.executeSql(
      `INSERT INTO sync_queue 
       (queueId, userId, entityType, entityId, operation, data, status, attempts, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [queueId, userId, entityType, entityId, operation, JSON.stringify(data), 'pending', 0, now]
    );

    return queueId;
  }

  /**
   * Get pending items from queue
   */
  async getPendingItems(limit: number = 50): Promise<SyncQueueItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      `SELECT * FROM sync_queue 
       WHERE status = 'pending' OR status = 'failed'
       ORDER BY createdAt ASC
       LIMIT ?`,
      [limit]
    );

    const items: SyncQueueItem[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      items.push(this.parseQueueItem(results[0].rows.item(i)));
    }

    return items;
  }

  /**
   * Update queue item status
   */
  async updateStatus(
    queueId: string,
    status: 'pending' | 'syncing' | 'completed' | 'failed',
    incrementAttempts: boolean = false
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    if (incrementAttempts) {
      await this.db.executeSql(
        `UPDATE sync_queue 
         SET status = ?, attempts = attempts + 1, lastAttempt = ?
         WHERE queueId = ?`,
        [status, now, queueId]
      );
    } else {
      await this.db.executeSql(
        `UPDATE sync_queue 
         SET status = ?, lastAttempt = ?
         WHERE queueId = ?`,
        [status, now, queueId]
      );
    }
  }

  /**
   * Remove completed items from queue
   */
  async removeCompleted(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(
      `DELETE FROM sync_queue WHERE status = 'completed'`
    );

    return result[0].rowsAffected;
  }

  /**
   * Get count of pending items
   */
  async getPendingCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      `SELECT COUNT(*) as count FROM sync_queue 
       WHERE status = 'pending' OR status = 'failed'`
    );

    return results[0].rows.item(0).count;
  }

  /**
   * Clear all items from queue (for testing/reset)
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('DELETE FROM sync_queue');
  }

  /**
   * Parse database row to SyncQueueItem
   */
  private parseQueueItem(row: any): SyncQueueItem {
    return {
      queueId: row.queueId,
      userId: row.userId,
      entityType: row.entityType,
      entityId: row.entityId,
      operation: row.operation,
      data: JSON.parse(row.data),
      status: row.status,
      attempts: row.attempts,
      lastAttempt: row.lastAttempt ? new Date(row.lastAttempt) : undefined,
      createdAt: new Date(row.createdAt),
    };
  }
}
