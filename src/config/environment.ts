// Environment configuration for different deployment stages

export type Environment = 'development' | 'staging' | 'production' | 'test';

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiKey: string;
  region: string;
  enableLogging: boolean;
  syncInterval: number; // in milliseconds
  maxStorageSize: number; // in MB
}

const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    apiKey: 'dev-api-key',
    region: 'ap-south-1',
    enableLogging: true,
    syncInterval: 60000, // 1 minute
    maxStorageSize: 500,
  },
  staging: {
    apiBaseUrl: 'https://staging-api.farmer-platform.com/api',
    apiKey: process.env.STAGING_API_KEY || '',
    region: 'ap-south-1',
    enableLogging: true,
    syncInterval: 300000, // 5 minutes
    maxStorageSize: 500,
  },
  production: {
    apiBaseUrl: 'https://api.farmer-platform.com/api',
    apiKey: process.env.PRODUCTION_API_KEY || '',
    region: 'ap-south-1',
    enableLogging: false,
    syncInterval: 600000, // 10 minutes
    maxStorageSize: 500,
  },
  test: {
    apiBaseUrl: 'http://localhost:3000/api',
    apiKey: 'test-api-key',
    region: 'ap-south-1',
    enableLogging: true,
    syncInterval: 60000, // 1 minute
    maxStorageSize: 500,
  },
};

const currentEnv: Environment =
  (process.env.NODE_ENV as Environment) || 'development';

export const config = configs[currentEnv];
export const environment = currentEnv;
