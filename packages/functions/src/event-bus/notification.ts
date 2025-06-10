import { EventHandler } from 'sst/node/event-bus';

import { Notification } from '@up-from/core/notification';
import { Loader } from '@up-from/repository/dataloader';
import { Events } from '@up-from/services/event-bus';
import { VisibleError, logger } from '@up-from/util';

const logName = 'Lambda: Notification:';

export const eventAllTeamsCreatedHandler = EventHandler(Events.AppEventAllTeamsCreated, async event => {
  logger.debug(`${logName} Notifying users that new All Teams event has been created`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    const { eventId, isOwnerIncluded } = event.properties;
    await Notification.notifyOnEventNewAllTeams(eventId, isOwnerIncluded);
  } catch (err) {
    new VisibleError('Failed to complete notification job that new All Team event has been created!', {
      cause: err,
      extraInput: { event },
    });
  }
});

export const eventCancelledHandler = EventHandler(Events.AppEventCancelled, async event => {
  logger.debug(`${logName} Notifying users that event has been cancelled`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    const { eventId, isOwnerIncluded } = event.properties;
    await Notification.notifyOnEventCancellation(eventId, isOwnerIncluded);
  } catch (err) {
    new VisibleError('Failed to complete notification job that event has been cancelled!', {
      cause: err,
      extraInput: { event },
    });
  }
});

export const eventDateTimeUpdatedHandler = EventHandler(Events.AppEventDateTimeUpdated, async event => {
  logger.debug(`${logName} Notifying users that event scheduling has been updated`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    const { eventId, isOwnerIncluded } = event.properties;
    await Notification.notifyOnEventDateTimeUpdate(eventId, isOwnerIncluded);
  } catch (err) {
    new VisibleError('Failed to complete notification job that event schedule has been updated!', {
      cause: err,
      extraInput: { event },
    });
  }
});

export const eventLocationUpdatedHandler = EventHandler(Events.AppEventLocationUpdated, async event => {
  logger.debug(`${logName} Notifying users that event location has been updated`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    const { eventId, isOwnerIncluded } = event.properties;
    await Notification.notifyOnEventLocationUpdate(eventId, isOwnerIncluded);
  } catch (err) {
    new VisibleError('Failed to complete notification job that event location has been updated!', {
      cause: err,
      extraInput: { event },
    });
  }
});

export const eventGuestListUpdatedHandler = EventHandler(Events.AppEventGuestListUpdated, async event => {
  logger.debug(`${logName} Notifying users that have been affected by event guest list update`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    const { eventId, addUserIds, removeUserIds, isOwnerIncluded } = event.properties;
    await Notification.notifyOnEventGuestListUpdate(eventId, addUserIds, removeUserIds, isOwnerIncluded);
  } catch (err) {
    new VisibleError('Failed to complete notification job that event guest list has been created!', {
      cause: err,
      extraInput: { event },
    });
  }
});

export const teamNewMemberAddedHandler = EventHandler(Events.AppTeamNewMemberAdded, async event => {
  logger.debug(`${logName} Notifying users that a new team member has been added`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    const { newMemberUserId, teamIds } = event.properties;
    await Notification.notifyOnTeamNewMember(newMemberUserId, teamIds);
  } catch (err) {
    new VisibleError('Failed to complete notification job that new team member has been added!', {
      cause: err,
      extraInput: { event },
    });
  }
});
