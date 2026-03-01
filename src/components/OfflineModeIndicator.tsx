// Offline mode indicator component showing connectivity and sync status

import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SyncStatus } from '../types/sync';

interface OfflineModeIndicatorProps {
  syncStatus: SyncStatus;
  onSyncPress?: () => void;
}

export const OfflineModeIndicator: React.FC<OfflineModeIndicatorProps> = ({
  syncStatus,
  onSyncPress,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatLastSyncTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = (): string => {
    if (!syncStatus.isOnline) return '#EF4444'; // red
    if (syncStatus.isSyncing) return '#F59E0B'; // amber
    if (syncStatus.pendingChanges > 0) return '#F59E0B'; // amber
    return '#10B981'; // green
  };

  const getStatusText = (): string => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} pending`;
    return 'Online';
  };

  return (
    <View className="bg-white border-b border-gray-200">
      {/* Main Status Bar */}
      <TouchableOpacity
        onPress={() => setShowDetails(!showDetails)}
        className="flex-row items-center justify-between px-4 py-2"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Status Indicator Dot */}
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: getStatusColor() }}
          />
          
          {/* Status Text */}
          <Text className="text-sm font-medium text-gray-900">
            {getStatusText()}
          </Text>

          {/* Sync Progress Indicator */}
          {syncStatus.isSyncing && (
            <ActivityIndicator
              size="small"
              color="#F59E0B"
              className="ml-2"
            />
          )}
        </View>

        {/* Last Sync Time */}
        {syncStatus.lastSyncTime.getTime() > 0 && (
          <Text className="text-xs text-gray-500">
            {formatLastSyncTime(syncStatus.lastSyncTime)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Detailed Status (Expandable) */}
      {showDetails && (
        <View className="px-4 pb-3 border-t border-gray-100">
          <View className="mt-2 space-y-2">
            {/* Connection Status */}
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Connection</Text>
              <Text className="text-sm font-medium text-gray-900">
                {syncStatus.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>

            {/* Pending Changes */}
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Pending Changes</Text>
              <Text className="text-sm font-medium text-gray-900">
                {syncStatus.pendingChanges}
              </Text>
            </View>

            {/* Last Sync */}
            {syncStatus.lastSyncTime.getTime() > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Last Sync</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {syncStatus.lastSyncTime.toLocaleString()}
                </Text>
              </View>
            )}

            {/* Sync Button */}
            {syncStatus.isOnline && !syncStatus.isSyncing && onSyncPress && (
              <TouchableOpacity
                onPress={onSyncPress}
                className="mt-2 bg-blue-500 rounded-lg py-2 px-4"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-medium">
                  Sync Now
                </Text>
              </TouchableOpacity>
            )}

            {/* Offline Message */}
            {!syncStatus.isOnline && (
              <View className="mt-2 bg-yellow-50 rounded-lg p-3">
                <Text className="text-sm text-yellow-800">
                  You're offline. Changes will sync automatically when connection is restored.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
