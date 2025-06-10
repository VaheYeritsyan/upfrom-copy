import AWS from 'aws-sdk';
import { Logger } from '@aws-lambda-powertools/logger';
import { LogLevel } from '@aws-lambda-powertools/logger/lib/types';

import { Config } from 'sst/node/config';

const stageName = Config.STAGE || 'unknown-stage';
const appName = Config.APP || 'up-from';

function getLogLevel(): LogLevel {
  if (process.env.IS_LOCAL && process.env.IS_LOCAL.toLowerCase() === 'true') {
    process.env.POWERTOOLS_DEV = 'true'; // turns on pretty-printing for local logs
    return Config.LOG_LEVEL as LogLevel;
  }

  try {
    return Config.LOG_LEVEL as LogLevel;
  } catch (err) {
    console.error('Logger: Failed to read Config.LOG_LEVEL! Defaulting to "INFO" level!', err);
    return 'INFO';
  }
}

export const logger = new Logger({
  serviceName: `${appName}-${stageName}`,
  logLevel: getLogLevel(),
});

AWS.config.logger = {
  log: (messages: unknown[]) => logger.info('AWS INFO', { messages }),
  warn: (messages: unknown[]) => logger.warn('AWS WARN', { messages }),
};

export * as Logger from './logger.js';
