# Offline Sync Module

This module implements the offline-first synchronization system for the Farmer Decision Support Platform.

## Components

### 1. SyncManager
Main orchestrator for sync operations.

**Features:**
- Automatic sync when connectivity is restored
- Background sync scheduling (every 5 minutes when online)
- Queue-based sync with retry logic
- Conflict detection and resolution

**Usage:**
```typescript
import { syncManager } from './services/sync';

// Initialize
await syncManager.initialize();

// Queue data for sync
await syncManager.queueForSync(
  userId,
  'user_profile',
  profileId,
  'update',
  profileData
);

// Manual sync
const result = await syncManager.syncNow();

// Get sync status
const status = await syncManager.getSyncStatus();
```

### 2. ConnectivityDetector
Monitors network connectivity and notifies listeners of changes.

**Features:**
- Real-time connectivity monitoring
- Event-based notifications
- Automatic sync trigger on connectivity restoration

### 3. SyncQueue
Manages pending sync operations in local database.

**Features:**
- FIFO queue with priority support
- Retry tracking with attempt counts
- Status management (pending, syncing, completed, failed)
- Automatic cleanup of completed items

### 4. ConflictResolver
Handles sync conflicts using timestamp-based resolution.

**Features:**
- Most recent data wins strategy
- Conflict logging for audit
- Manual conflict resolution support
- Conflict history tracking

**Resolution Strategy:**
- Extracts timestamps from data (updatedAt, timestamp, modifiedAt, createdAt)
- Compares timestamps and selects most recent version
- Logs all conflicts for review

### 5. StorageManager
Enforces 500 MB storage limit and manages cached data.

**Features:**
- Storage usage tracking
- Automatic cleanup of old cached data
- Essential data protection (never deleted)
- Storage usage by entity type

**Priority:**
1. User-generated content (never deleted)
2. Essential data (current crop plans, upcoming alerts, recent weather)
3. Cached data (old price history, completed lessons)

## Data Models

### SyncQueueItem
```typescript
{
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
```

### SyncConflict
```typescript
{
  id: string;
  entityType: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: Date;
}
```

### SyncResult
```typescript
{
  success: boolean;
  itemsSynced: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
  timestamp: Date;
}
```

### SyncStatus
```typescript
{
  lastSyncTime: Date;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}
```

## UI Components

### OfflineModeIndicator
React Native component showing connectivity and sync status.

**Features:**
- Visual status indicator (online/offline/syncing)
- Pending changes count
- Last sync time
- Expandable details view
- Manual sync trigger button

**Usage:**
```typescript
import { OfflineModeIndicator } from './components/OfflineModeIndicator';
import { useSyncStatus } from './hooks/useSyncStatus';

function MyScreen() {
  const { syncStatus, triggerSync } = useSyncStatus();
  
  return (
    <OfflineModeIndicator 
      syncStatus={syncStatus}
      onSyncPress={triggerSync}
    />
  );
}
```

## Installation

### Required Dependencies

Add the following dependencies to your project:

```bash
npm install @react-native-community/netinfo uuid react-native-fs
npm install --save-dev @types/uuid
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup required.

## Configuration

### API Base URL

Set the API base URL in your environment:

```bash
export API_BASE_URL=https://api.yourplatform.com
```

Or update `src/services/sync/index.ts`:

```typescript
const API_BASE_URL = 'https://api.yourplatform.com';
```

### Storage Limit

Default: 500 MB

To change, update `STORAGE_LIMIT_MB` in `src/services/sync/StorageManager.ts`:

```typescript
const STORAGE_LIMIT_MB = 500; // Change this value
```

## Testing

### Unit Tests

```bash
npm test src/services/sync
```

### Property-Based Tests

Property tests are defined in the design document and should be implemented using fast-check.

## Requirements Validation

This implementation validates the following requirements:

- **11.3**: Offline mode indicator showing connectivity status
- **11.4**: Automatic sync when connectivity becomes available
- **11.5**: Timestamp-based conflict resolution with logging
- **11.6**: 500 MB storage limit enforcement
- **11.7**: Essential data prioritization
- **11.8**: Oldest cached data removal while preserving user content

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Application                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              SyncManager                          │  │
│  │  - Orchestrates sync operations                  │  │
│  │  - Handles auto-sync triggers                    │  │
│  └──────────────────────────────────────────────────┘  │
│           │              │              │               │
│           ▼              ▼              ▼               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  SyncQueue   │ │ Conflict     │ │  Storage     │  │
│  │              │ │ Resolver     │ │  Manager     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│           │                                             │
│           ▼                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │         ConnectivityDetector                      │  │
│  │  - Monitors network status                        │  │
│  │  - Triggers auto-sync                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  Cloud API   │
                  └──────────────┘
```

## Error Handling

### Network Errors
- Retry with exponential backoff (up to 5 attempts)
- Queue items marked as 'failed' after max attempts
- Automatic retry on next sync cycle

### Conflict Errors
- Logged for audit
- Automatic resolution using timestamp strategy
- Manual resolution available through ConflictResolver

### Storage Errors
- Automatic cleanup when limit reached
- Essential data protected from deletion
- User notification if critical

## Performance

### Sync Performance
- Batch size: 50 items per sync cycle
- Sync interval: 5 minutes when online
- Timeout: 10 seconds per API call

### Storage Performance
- Indexed queries for fast lookups
- Lazy cleanup (only when limit reached)
- Efficient storage tracking

## Security

### Data Encryption
- Local data encrypted using AES-256 (via LocalDatabase)
- Network communication over HTTPS/TLS
- Secure token-based authentication

### Privacy
- Minimal data collection
- User consent for sync operations
- Data deletion support

## Troubleshooting

### Sync Not Working
1. Check connectivity: `syncStatus.isOnline`
2. Check pending items: `syncStatus.pendingChanges`
3. Check sync errors in logs
4. Verify API endpoint configuration

### Storage Full
1. Check storage usage: `storageManager.getStorageInfo()`
2. Manually trigger cleanup: `storageManager.cleanupOldData()`
3. Review essential data marking

### Conflicts Not Resolving
1. Check conflict logs: `conflictResolver.getConflictHistory()`
2. Verify timestamp fields in data
3. Manually resolve: `conflictResolver.manualResolve()`

## Future Enhancements

1. **Selective Sync**: Allow users to choose what to sync
2. **Compression**: Compress data before sync to reduce bandwidth
3. **Delta Sync**: Only sync changed fields, not entire objects
4. **Conflict UI**: User interface for manual conflict resolution
5. **Sync Analytics**: Track sync performance and patterns
6. **Background Sync**: Use background tasks for iOS/Android
7. **Peer-to-Peer Sync**: Sync between devices without cloud
