declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    type: string;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    details: any;
  }

  export interface NetInfoSubscription {
    (): void;
  }

  const NetInfo: {
    fetch: () => Promise<NetInfoState>;
    addEventListener: (
      listener: (state: NetInfoState) => void
    ) => NetInfoSubscription;
  };

  export default NetInfo;
}
