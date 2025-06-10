import { Summary } from '@up-from/repository/summary';
import { logger } from '@up-from/util';

export { SummaryCountersShape } from '@up-from/repository/summary';

const logName = 'Core Admin: Summary:';

export function getAllCounters() {
  logger.debug(`${logName} Getting all counters`);
  return Summary.getAllCounters();
}

export function getAllOrganizationCounters(organizationId: string) {
  logger.debug(`${logName} Getting all counters`);
  return Summary.getAllOrganizationCounters(organizationId);
}

export * as Summary from './summary.js';
