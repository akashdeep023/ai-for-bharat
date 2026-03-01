// Conflict resolution service for sync conflicts

import type SQLite from 'react-native-sqlite-storage';
import { v4 as uuidv4 } from 'uuid';

export interface ConflictLog {
  conflictId: string;
  userId: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  resolution: 'local' | 'remote' | 'manual';
  resolvedVersion: any;
  status: 'unresolved' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export class ConflictResolver {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize conflict resolver with database connection
   */
  async initialize(db: SQLite.SQLiteDatabase): Promise<void> {
    this.db = db;
    await this.createTables();
  }

  /**
   * Create conflict logging tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS sync_conflicts (
        conflictId TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        localVersion TEXT NOT NULL,
        remoteVersion TEXT NOT NULL,
        resolution TEXT,
        resolvedVersion TEXT,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        resolvedAt TEXT
      )
    `);

    // Create index for faster queries
    await this.db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status 
      ON sync_conflicts(status, createdAt)
    `);
  }

  /**
   * Resolve conflict using timestamp-based strategy (most recent wins)
   */
  async resolveConflict(
    userId: string,
    entityType: string,
    entityId: string,
    localVersion: any,
    remoteVersion: any
  ): Promise<{ resolvedVersion: any; resolution: 'local' | 'remote' }> {
    // Extract timestamps
    const localTimestamp = this.extractTimestamp(localVersion);
    const remoteTimestamp = this.extractTimestamp(remoteVersion);

    // Most recent wins
    const resolution = localTimestamp > remoteTimestamp ? 'local' : 'remote';
    const resolvedVersion = resolution === 'local' ? localVersion : remoteVersion;

    // Log the conflict
    await this.logConflict(
      userId,
      entityType,
      entityId,
      localVersion,
      remoteVersion,
      resolution,
      resolvedVersion
    );

    return { resolvedVersion, resolution };
  }

  /**
   * Log conflict for audit purposes
   */
  async logConflict(
    userId: string,
    entityType: string,
    entityId: string,
    localVersion: any,
    remoteVersion: any,
    resolution: 'local' | 'remote' | 'manual',
    resolvedVersion: any
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const conflictId = uuidv4();
    const now = new Date().toISOString();

    await this.db.executeSql(
      `INSERT INTO sync_conflicts 
       (conflictId, userId, entityType, entityId, localVersion, remoteVersion, 
        resolution, resolvedVersion, status, createdAt, resolvedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conflictId,
        userId,
        entityType,
        entityId,
        JSON.stringify(localVersion),
        JSON.stringify(remoteVersion),
        resolution,
        JSON.stringify(resolvedVersion),
        'resolved',
        now,
        now,
      ]
    );

    return conflictId;
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(userId: string): Promise<ConflictLog[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      `SELECT * FROM sync_conflicts 
       WHERE userId = ? AND status = 'unresolved'
       ORDER BY createdAt DESC`,
      [userId]
    );

    const conflicts: ConflictLog[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      conflicts.push(this.parseConflictLog(results[0].rows.item(i)));
    }

    return conflicts;
  }

  /**
   * Get conflict history
   */
  async getConflictHistory(userId: string, limit: number = 50): Promise<ConflictLog[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.executeSql(
      `SELECT * FROM sync_conflicts 
       WHERE userId = ?
       ORDER BY createdAt DESC
       LIMIT ?`,
      [userId, limit]
    );

    const conflicts: ConflictLog[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      conflicts.push(this.parseConflictLog(results[0].rows.item(i)));
    }

    return conflicts;
  }

  /**
   * Manually resolve conflict
   */
  async manualResolve(
    conflictId: string,
    resolvedVersion: any
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    await this.db.executeSql(
      `UPDATE sync_conflicts 
       SET resolution = 'manual', resolvedVersion = ?, status = 'resolved', resolvedAt = ?
       WHERE conflictId = ?`,
      [JSON.stringify(resolvedVersion), now, conflictId]
    );
  }

  /**
   * Extract timestamp from data object
   */
  private extractTimestamp(data: any): number {
    // Try common timestamp fields
    if (data.updatedAt) {
      return new Date(data.updatedAt).getTime();
    }
    if (data.timestamp) {
      return new Date(data.timestamp).getTime();
    }
    if (data.modifiedAt) {
      return new Date(data.modifiedAt).getTime();
    }
    if (data.createdAt) {
      return new Date(data.createdAt).getTime();
    }

    // Default to current time if no timestamp found
    return Date.now();
  }

  /**
   * Parse database row to ConflictLog
   */
  private parseConflictLog(row: any): ConflictLog {
    return {
      conflictId: row.conflictId,
      userId: row.userId,
      entityType: row.entityType,
      entityId: row.entityId,
      localVersion: JSON.parse(row.localVersion),
      remoteVersion: JSON.parse(row.remoteVersion),
      resolution: row.resolution,
      resolvedVersion: JSON.parse(row.resolvedVersion),
      status: row.status,
      createdAt: new Date(row.createdAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    };
  }
}
