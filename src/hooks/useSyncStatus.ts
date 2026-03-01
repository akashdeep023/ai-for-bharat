// React hook for accessing sync status

import { useState, useEffect } from 'react';
import { SyncStatus } from '../types/sync';
import { syncManager } from '../services/sync';

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: new Date(0),
    pendingChanges: 0,
    isOnline: false,
    isSyncing: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchSyncStatus = async () => {
      try {
        const status = await syncManager.getSyncStatus();
        if (mounted) {
          setSyncStatus(status);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching sync status:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchSyncStatus();

    // Poll for status updates every 5 seconds
    intervalId = setInterval(fetchSyncStatus, 5000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const triggerSync = async () => {
    try {
      await syncManager.syncNow();
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error triggering sync:', error);
    }
  };

  return {
    syncStatus,
    isLoading,
    triggerSync,
  };
};
