# Sync Module Integration Guide

This guide shows how to integrate the offline sync module into your application.

## Step 1: Install Dependencies

```bash
npm install @react-native-community/netinfo uuid react-native-fs
npm install --save-dev @types/uuid
```

For iOS:
```bash
cd ios && pod install
```

## Step 2: Initialize Sync Manager

In your app's entry point (e.g., `App.tsx`):

```typescript
import React, { useEffect } from 'react';
import { syncManager } from './services/sync';

function App() {
  useEffect(() => {
    // Initialize sync manager on app start
    const initializeSync = async () => {
      try {
        await syncManager.initialize();
        console.log('Sync manager initialized');
      } catch (error) {
        console.error('Failed to initialize sync manager:', error);
      }
    };

    initializeSync();

    // Cleanup on unmount
    return () => {
      syncManager.destroy();
    };
  }, []);

  return (
    // Your app components
  );
}
```

## Step 3: Add Offline Indicator to Screens

Add the offline mode indicator to your main screens:

```typescript
import React from 'react';
import { View } from 'react-native';
import { OfflineModeIndicator } from './components/OfflineModeIndicator';
import { useSyncStatus } from './hooks/useSyncStatus';

function DashboardScreen() {
  const { syncStatus, triggerSync } = useSyncStatus();

  return (
    <View>
      <OfflineModeIndicator 
        syncStatus={syncStatus}
        onSyncPress={triggerSync}
      />
      
      {/* Your screen content */}
    </View>
  );
}
```

## Step 4: Queue Data for Sync

When users create or update data, queue it for sync:

```typescript
import { syncManager } from './services/sync';

async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Save to local database first
    await localDatabase.updateUserProfile(profileData);
    
    // Queue for sync
    await syncManager.queueForSync(
      userId,
      'user_profile',
      profileData.userId,
      'update',
      profileData
    );
    
    console.log('Profile updated and queued for sync');
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
}
```

## Step 5: Handle Sync Results

Listen for sync results to show user feedback:

```typescript
import { syncManager } from './services/sync';

async function performSync() {
  try {
    const result = await syncManager.syncNow();
    
    if (result.success) {
      console.log(`Synced ${result.itemsSynced} items`);
    } else {
      console.error('Sync failed:', result.errors);
    }
    
    if (result.conflicts.length > 0) {
      console.warn('Conflicts detected:', result.conflicts);
      // Show conflict resolution UI
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}
```

## Step 6: Monitor Storage Usage

Periodically check storage usage and show warnings:

```typescript
import { storageManager } from './services/sync';

async function checkStorage() {
  const info = await storageManager.getStorageInfo();
  const usagePercent = (info.usedSize / info.limitSize) * 100;
  
  if (usagePercent > 90) {
    // Show warning to user
    console.warn('Storage almost full:', usagePercent.toFixed(1) + '%');
  }
  
  // Enforce limit
  await storageManager.enforceStorageLimit();
}
```

## Complete Example

Here's a complete example integrating all components:

```typescript
// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { syncManager, storageManager } from './services/sync';
import { OfflineModeIndicator } from './components/OfflineModeIndicator';
import { useSyncStatus } from './hooks/useSyncStatus';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { syncStatus, triggerSync } = useSyncStatus();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize sync manager
        await syncManager.initialize();
        
        // Check storage on startup
        const storageInfo = await storageManager.getStorageInfo();
        console.log('Storage:', storageInfo);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        Alert.alert('Error', 'Failed to initialize app');
      }
    };

    initialize();

    return () => {
      syncManager.destroy();
    };
  }, []);

  const handleDataUpdate = async () => {
    try {
      const userId = 'user123';
      const data = {
        userId,
        name: 'John Farmer',
        farmSize: 5.5,
        updatedAt: new Date(),
      };

      // Queue for sync
      await syncManager.queueForSync(
        userId,
        'user_profile',
        userId,
        'update',
        data
      );

      Alert.alert('Success', 'Data saved and queued for sync');
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Offline indicator */}
      <OfflineModeIndicator 
        syncStatus={syncStatus}
        onSyncPress={triggerSync}
      />

      {/* App content */}
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>
          Farmer Dashboard
        </Text>

        <Button 
          title="Update Profile" 
          onPress={handleDataUpdate}
        />

        <View style={{ marginTop: 20 }}>
          <Text>Sync Status:</Text>
          <Text>Online: {syncStatus.isOnline ? 'Yes' : 'No'}</Text>
          <Text>Pending: {syncStatus.pendingChanges}</Text>
          <Text>Syncing: {syncStatus.isSyncing ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    </View>
  );
}

export default App;
```

## Backend API Requirements

Your backend API should support the following endpoints:

### POST /sync/:entityType
Create new entity
```json
{
  "entityId": "string",
  "data": {},
  "timestamp": "ISO8601"
}
```

Response:
```json
{
  "success": true,
  "conflict": false
}
```

### PUT /sync/:entityType
Update existing entity
```json
{
  "entityId": "string",
  "data": {},
  "timestamp": "ISO8601"
}
```

Response:
```json
{
  "success": true,
  "conflict": false,
  "remoteVersion": {} // if conflict detected
}
```

### DELETE /sync/:entityType
Delete entity
```json
{
  "entityId": "string",
  "timestamp": "ISO8601"
}
```

Response:
```json
{
  "success": true
}
```

## Testing Integration

Test the sync functionality:

```typescript
import { syncManager } from './services/sync';

describe('Sync Integration', () => {
  beforeAll(async () => {
    await syncManager.initialize();
  });

  afterAll(() => {
    syncManager.destroy();
  });

  it('should queue and sync data', async () => {
    const userId = 'test-user';
    const data = { name: 'Test', updatedAt: new Date() };

    // Queue data
    const queueId = await syncManager.queueForSync(
      userId,
      'test_entity',
      'entity-1',
      'create',
      data
    );

    expect(queueId).toBeDefined();

    // Check status
    const status = await syncManager.getSyncStatus();
    expect(status.pendingChanges).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Issue: Sync not triggering automatically

**Solution:**
1. Check if connectivity detector is initialized
2. Verify network permissions in AndroidManifest.xml and Info.plist
3. Check console logs for errors

### Issue: Storage limit reached

**Solution:**
1. Call `storageManager.enforceStorageLimit()` manually
2. Review essential data marking
3. Increase storage limit if needed

### Issue: Conflicts not resolving

**Solution:**
1. Ensure data objects have timestamp fields (updatedAt, timestamp, etc.)
2. Check conflict logs: `conflictResolver.getConflictHistory()`
3. Implement manual resolution UI if needed

## Best Practices

1. **Always save locally first**: Save to local database before queueing for sync
2. **Handle offline gracefully**: Show appropriate UI when offline
3. **Monitor storage**: Regularly check storage usage
4. **Test offline scenarios**: Test app behavior with no connectivity
5. **Handle conflicts**: Implement UI for manual conflict resolution
6. **Log sync events**: Log sync results for debugging
7. **Optimize sync frequency**: Balance between freshness and battery/bandwidth
8. **Protect essential data**: Mark critical data as essential
9. **Show sync progress**: Keep users informed of sync status
10. **Handle errors gracefully**: Show user-friendly error messages

## Next Steps

1. Implement backend sync endpoints
2. Add conflict resolution UI
3. Implement property-based tests
4. Add sync analytics
5. Optimize sync performance
6. Add background sync support
