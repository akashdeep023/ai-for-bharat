// Unit tests for environment configuration

import { config, environment } from '../environment';

describe('Environment Configuration', () => {
  it('should have a valid environment', () => {
    expect(['development', 'staging', 'production', 'test']).toContain(environment);
  });

  it('should have required config properties', () => {
    expect(config).toHaveProperty('apiBaseUrl');
    expect(config).toHaveProperty('apiKey');
    expect(config).toHaveProperty('region');
    expect(config).toHaveProperty('enableLogging');
    expect(config).toHaveProperty('syncInterval');
    expect(config).toHaveProperty('maxStorageSize');
  });

  it('should have valid API base URL', () => {
    expect(config.apiBaseUrl).toBeTruthy();
    expect(typeof config.apiBaseUrl).toBe('string');
  });

  it('should have valid region', () => {
    expect(config.region).toBe('ap-south-1');
  });

  it('should have valid storage size limit', () => {
    expect(config.maxStorageSize).toBe(500);
  });

  it('should have positive sync interval', () => {
    expect(config.syncInterval).toBeGreaterThan(0);
  });
});
