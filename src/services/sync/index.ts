// Sync service exports

import { SyncManager } from './SyncManager';
import { ConflictResolver } from './ConflictResolver';
import { StorageManager } from './StorageManager';
import { ConnectivityDetector } from './ConnectivityDetector';

// Get API base URL from environment or config
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

// Create singleton instances
export const syncManager = new SyncManager(API_BASE_URL);
export const conflictResolver = new ConflictResolver();
export const storageManager = new StorageManager();
export const connectivityDetector = new ConnectivityDetector();

// Export classes for testing
export { SyncManager, ConflictResolver, StorageManager, ConnectivityDetector };

// Export sync queue
export { SyncQueue } from './SyncQueue';
