// Main sync manager orchestrating sync operations

import { SyncQueue } from './SyncQueue';
import { ConnectivityDetector } from './ConnectivityDetector';
import { SyncResult, SyncStatus, SyncError, SyncConflict } from '../../types/sync';
import { localDatabase } from '../storage/LocalDatabase';
import axios from 'axios';

export class SyncManager {
  private syncQueue: SyncQueue;
  private connectivityDetector: ConnectivityDetector;
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.syncQueue = new SyncQueue();
    this.connectivityDetector = new ConnectivityDetector();
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    // Initialize database
    await localDatabase.initialize();
    
    // Get database instance for sync queue
    const db = (localDatabase as any).db;
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    await this.syncQueue.initialize(db);
    await this.connectivityDetector.initialize();

    // Listen for connectivity changes
    this.connectivityDetector.addListener((isOnline) => {
      if (isOnline) {
        // Auto-sync when connectivity becomes available
        this.scheduleSyncWhenOnline();
      }
    });
  }

  /**
   * Perform sync operation now
   */
  async syncNow(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        itemsSynced: 0,
        conflicts: [],
        errors: [{ queueId: '', error: 'Sync already in progress', timestamp: new Date() }],
        timestamp: new Date(),
      };
    }

    if (!this.connectivityDetector.getIsOnline()) {
      return {
        success: false,
        itemsSynced: 0,
        conflicts: [],
        errors: [{ queueId: '', error: 'No internet connectivity', timestamp: new Date() }],
        timestamp: new Date(),
      };
    }

    this.isSyncing = true;
    const errors: SyncError[] = [];
    const conflicts: SyncConflict[] = [];
    let itemsSynced = 0;

    try {
      // Get pending items from queue
      const pendingItems = await this.syncQueue.getPendingItems();

      for (const item of pendingItems) {
        try {
          // Update status to syncing
          await this.syncQueue.updateStatus(item.queueId, 'syncing', true);

          // Sync item to cloud
          const result = await this.syncItemToCloud(item);

          if (result.conflict) {
            conflicts.push(result.conflict);
            // Mark as failed for manual resolution
            await this.syncQueue.updateStatus(item.queueId, 'failed');
          } else {
            // Mark as completed
            await this.syncQueue.updateStatus(item.queueId, 'completed');
            itemsSynced++;
          }
        } catch (error) {
          // Mark as failed and record error
          await this.syncQueue.updateStatus(item.queueId, 'failed');
          errors.push({
            queueId: item.queueId,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          });

          // Stop syncing after 5 consecutive errors
          if (errors.length >= 5) {
            break;
          }
        }
      }

      // Clean up completed items
      await this.syncQueue.removeCompleted();

      this.lastSyncTime = new Date();

      return {
        success: errors.length === 0,
        itemsSynced,
        conflicts,
        errors,
        timestamp: new Date(),
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Schedule sync when online
   */
  scheduleSyncWhenOnline(): void {
    if (this.connectivityDetector.getIsOnline() && !this.syncInterval) {
      // Sync immediately
      setTimeout(() => this.syncNow(), 1000);

      // Schedule periodic sync every 5 minutes
      this.syncInterval = setInterval(() => {
        if (this.connectivityDetector.getIsOnline()) {
          this.syncNow();
        }
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingChanges = await this.syncQueue.getPendingCount();

    return {
      lastSyncTime: this.lastSyncTime || new Date(0),
      pendingChanges,
      isOnline: this.connectivityDetector.getIsOnline(),
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Add item to sync queue
   */
  async queueForSync(
    userId: string,
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<string> {
    const queueId = await this.syncQueue.enqueue(userId, entityType, entityId, operation, data);

    // Trigger sync if online
    if (this.connectivityDetector.getIsOnline()) {
      setTimeout(() => this.syncNow(), 100);
    }

    return queueId;
  }

  /**
   * Sync individual item to cloud
   */
  private async syncItemToCloud(item: any): Promise<{ conflict?: SyncConflict }> {
    const endpoint = `${this.apiBaseUrl}/sync/${item.entityType}`;

    try {
      const response = await axios({
        method: item.operation === 'delete' ? 'delete' : item.operation === 'create' ? 'post' : 'put',
        url: endpoint,
        data: {
          entityId: item.entityId,
          data: item.data,
          timestamp: item.createdAt,
        },
        timeout: 10000,
      });

      // Check for conflicts
      if (response.data.conflict) {
        return {
          conflict: {
            id: item.queueId,
            entityType: item.entityType,
            localVersion: item.data,
            remoteVersion: response.data.remoteVersion,
            timestamp: new Date(),
          },
        };
      }

      return {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stop sync manager
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.connectivityDetector.destroy();
  }
}
