// Connectivity detection service for monitoring network status

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type ConnectivityListener = (isOnline: boolean) => void;

export class ConnectivityDetector {
  private isOnline: boolean = false;
  private listeners: Set<ConnectivityListener> = new Set();
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize connectivity monitoring
   */
  async initialize(): Promise<void> {
    // Get initial connectivity state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    // Subscribe to connectivity changes
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Notify listeners if connectivity changed
      if (wasOnline !== this.isOnline) {
        this.notifyListeners();
      }
    });
  }

  /**
   * Get current connectivity status
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add listener for connectivity changes
   */
  addListener(listener: ConnectivityListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: ConnectivityListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of connectivity change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isOnline);
      } catch (error) {
        console.error('Error notifying connectivity listener:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

export const connectivityDetector = new ConnectivityDetector();
