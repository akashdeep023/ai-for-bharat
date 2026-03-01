// Unit tests for logger utility

import { logger } from '../logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(consoleDebugSpy).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should include data in log messages', () => {
    const testData = { key: 'value' };
    logger.info('Test with data', testData);
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test with data'),
      testData
    );
  });
});
