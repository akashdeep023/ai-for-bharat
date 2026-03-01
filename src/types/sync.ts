// Sync-related type definitions

export interface SyncQueueItem {
  queueId: string;
  userId: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  createdAt: Date;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: Date;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
  timestamp: Date;
}

export interface SyncStatus {
  lastSyncTime: Date;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}

export interface SyncError {
  queueId: string;
  error: string;
  timestamp: Date;
}

export interface StorageInfo {
  totalSize: number; // in bytes
  usedSize: number; // in bytes
  availableSize: number; // in bytes
  limitSize: number; // 500 MB in bytes
}
