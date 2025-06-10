import { Temporal } from '@js-temporal/polyfill';

import { Notification } from '@up-from/core/notification';
import { Loader } from '@up-from/repository/dataloader';
import { VisibleError, logger } from '@up-from/util';

// According to Cron scheduler expected call happens every 15 minutes (XX:00, XX:15, XX:30, XX:45) + a few seconds of delay
export async function main() {
  logger.debug('Send scheduled notifications: Sending notifications about awaiting invitation');

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  // Create a time range for event start (NOW ... from: +1h <-> to: +1h 14m 59s)
  // Adds 1 hour and rounds DOWN to 00/15/30/45 minutes.
  // Result is always > +45m and <= +1
  // Example: Now = 02:01 AM - from = 03:00 AM or Now = 10:47 AM - from = 11:45 AM
  const from = Temporal.Now.instant().add({ hours: 1 }).round({
    smallestUnit: 'minute',
    roundingIncrement: 15,
    roundingMode: 'floor',
  });

  // Adds 1 hour and rounds UP to 00/15/30/45 minutes. Expected that rounding UP adds up to 15 minutes.
  // Then one millisecond is substracted from result which should give 14 minutes 59 seconds and 999 milliseconds instead of 15 minutes
  // Which is equal to 1h 15m without last millisecond to exclude overlapping
  // Result is always > +1h and <= 1h 14m 59s 999ms
  // Logic: Now = 02:01:00.000 AM - to = 03:14:59.999 AM or Now = 10:47:18.153 AM - to = 11:59:59.999 AM
  const to = Temporal.Now.instant()
    .add({ hours: 1 })
    .round({
      smallestUnit: 'minute',
      roundingIncrement: 15,
      roundingMode: 'ceil',
    })
    .subtract({ milliseconds: 1 });

  logger.debug('Event startsAt range', { from, to });

  try {
    await Notification.sendNotificationsOnAwaitingInvitations(
      new Date(from.epochMilliseconds),
      new Date(to.epochMilliseconds),
    );
  } catch (err) {
    new VisibleError('Failed to send scheduled notifications!', {
      isExposable: false,
      cause: err,
      extraInput: { from, to },
    });
  }

  return {};
}
