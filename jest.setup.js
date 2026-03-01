// Jest setup file for React Native testing
import '@testing-library/react-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    executeSql: jest.fn(),
  })),
}));

// Mock react-native-voice
jest.mock('react-native-voice', () => ({
  onSpeechStart: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechResults: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
