import { Notification, NotificationType } from '@up-from/services/notification';
import { Event, EventUser, UserNotificationPref, User, TeamUser } from '@up-from/repository';
import { VisibleError, logger, ArrayUtil } from '@up-from/util';

const logName = 'Core Notification:';

async function findEventUserIdsByEventId(event: Event.EventShape, isOwnerIncluded = false) {
  const eventUsers = await EventUser.findEventUsersByEventId(event.id);
  const eventUserIds = eventUsers.map(eventUser => eventUser.userId);

  if (!isOwnerIncluded) {
    ArrayUtil.exclude(eventUserIds, event.ownerId);
  }

  return eventUserIds;
}

export async function notifyOnTeamNewMember(newMemberUserId: string, teamIds: string[]) {
  logger.debug(`${logName} Notifying on new team member`, { newMemberUserId, teamIds });

  const teamMembers = await TeamUser.findAllByTeamIds(teamIds);
  const teammateIds = teamMembers.map(member => member.userId);
  const uniqueTeammateIds = [...new Set(teammateIds)];

  ArrayUtil.exclude(uniqueTeammateIds, newMemberUserId);

  if (!uniqueTeammateIds.length) return;

  try {
    const recipients = await UserNotificationPref.findRecipientsByUserId(uniqueTeammateIds);

    await Notification.notify(recipients, Notification.NotificationType.TeamNewMember, {
      metadata: { userId: newMemberUserId },
    });
  } catch (err) {
    throw new VisibleError('Failed to send notifications on new team member', {
      isExposable: true,
      cause: err,
      extraInput: { newMemberUserId, teammateIds: uniqueTeammateIds },
    });
  }
}

export async function notifyOnEventCancellation(eventId: string, isOwnerIncluded = false) {
  logger.debug(`${logName} Notifying on Event cancelation`, { eventId, isOwnerIncluded });

  try {
    const event = await Event.findOneByIdOrThrow(eventId);
    if (!event.isCancelled) {
      new VisibleError('Failed to send notifications on Event cancelation: Event is not cancelled', {
        isExposable: true,
        extraInput: { eventId, isOwnerIncluded },
      });
      return;
    }

    const recipientUserIds = await findEventUserIdsByEventId(event, isOwnerIncluded);
    if (!recipientUserIds.length) return;

    const recipients = await UserNotificationPref.findRecipientsByUserId(recipientUserIds);

    await Notification.notify(recipients, NotificationType.EventCancelled, {
      eventName: event.title,
      metadata: { eventId: event.id },
    });
  } catch (err) {
    throw new VisibleError('Failed to send notifications on Event cancelation', {
      isExposable: true,
      cause: err,
      extraInput: { eventId, isOwnerIncluded },
    });
  }
}

export async function notifyOnEventDateTimeUpdate(eventId: string, isOwnerIncluded = false) {
  logger.debug(`${logName} Notifying on Event date/time update`, { eventId, isOwnerIncluded });

  try {
    const event = await Event.findOneByIdOrThrow(eventId);
    if (event.isCancelled) {
      logger.info(`${logName} Skipping sending notifications on Event date/time update: Event is cancelled`);
      return;
    }

    const recipientUserIds = await findEventUserIdsByEventId(event, isOwnerIncluded);
    if (!recipientUserIds.length) return;

    const recipients = await UserNotificationPref.findRecipientsByUserId(recipientUserIds);

    await Notification.notify(recipients, NotificationType.EventUpdatedDateTime, {
      eventName: event.title,
      metadata: { eventId: event.id },
    });
  } catch (err) {
    throw new VisibleError('Failed to send notifications on Event date/time update', {
      isExposable: true,
      cause: err,
      extraInput: { eventId, isOwnerIncluded },
    });
  }
}

export async function notifyOnEventLocationUpdate(eventId: string, isOwnerIncluded = false) {
  logger.debug(`${logName} Notifying on Event location update`, { eventId, isOwnerIncluded });

  try {
    const event = await Event.findOneByIdOrThrow(eventId);
    if (event.isCancelled) {
      logger.info(`${logName} Skipping sending notifications on Event location update: Event is cancelled`);
      return;
    }

    const recipientUserIds = await findEventUserIdsByEventId(event, isOwnerIncluded);
    if (!recipientUserIds.length) return;

    const recipients = await UserNotificationPref.findRecipientsByUserId(recipientUserIds);

    await Notification.notify(recipients, NotificationType.EventUpdatedLocation, {
      eventName: event.title,
      metadata: { eventId: event.id },
    });
  } catch (err) {
    throw new VisibleError('Failed to send notifications on Event location update', {
      isExposable: true,
      cause: err,
      extraInput: { eventId, isOwnerIncluded },
    });
  }
}

export async function notifyOnEventNewAllTeams(eventId: string, isOwnerIncluded = false) {
  logger.debug(`${logName} Notifying on new All Teams Event`, { eventId, isOwnerIncluded });

  const event = await Event.findOneByIdOrThrow(eventId);

  if (event.teamId) {
    new VisibleError('Failed to send notifications on new All Teams event: Event is not an All Teams event', {
      isExposable: true,
      extraInput: { eventId, isOwnerIncluded },
    });
    return;
  }
  // It is technically possible to create a cancelled event
  if (event.isCancelled) {
    logger.info(`${logName} Skipping sending notifications on new All Teams event: Event is cancelled`);
    return;
  }

  const allUsers = await User.getAllRegistered();
  const recipientUserIds = allUsers.map(user => user.id);

  if (!isOwnerIncluded) {
    ArrayUtil.exclude(recipientUserIds, event.ownerId);
  }

  if (!recipientUserIds.length) return;

  try {
    const recipients = await UserNotificationPref.findRecipientsByUserId(recipientUserIds);

    await Notification.notify(recipients, NotificationType.EventNewAllTeams, {
      eventName: event.title,
      metadata: { eventId: event.id },
    });
  } catch (err) {
    throw new VisibleError('Failed to send notifications on new All Teams Event', {
      isExposable: true,
      cause: err,
      extraInput: { eventId: event.id, ownerId: event.ownerId },
    });
  }
}

export async function notifyOnEventGuestListUpdate(
  eventId: string,
  addedUserIds: string[],
  removedUserIds: string[],
  excludeOwner: boolean,
) {
  logger.debug(`${logName} Notifying on event guest list update`, {
    eventId,
    addedUserIds,
    removedUserIds,
    excludeOwner,
  });

  const newInvitationRecipientIds = [...addedUserIds];
  const eventCancelledRecipientIds = [...removedUserIds];
  const event = await Event.findOneByIdOrThrow(eventId);
  if (event.isCancelled) {
    logger.info(`${logName} Skipping sending notifications on event guest list update: Event is cancelled`);
    return;
  }

  if (excludeOwner) {
    ArrayUtil.exclude(newInvitationRecipientIds, event.ownerId);
    ArrayUtil.exclude(eventCancelledRecipientIds, event.ownerId);
  }

  // Send notification to added users
  if (newInvitationRecipientIds.length) {
    try {
      const addedRecipients = await UserNotificationPref.findRecipientsByUserId(newInvitationRecipientIds);

      await Notification.notify(addedRecipients, NotificationType.EventNewInvitation, {
        eventName: event.title,
        metadata: { eventId: event.id },
      });
    } catch (err) {
      throw new VisibleError('Failed to send New Invitation notifications to added guests', {
        isExposable: true,
        cause: err,
        extraInput: { addedUserIds, eventId: event.id, ownerId: event.ownerId },
      });
    }
  } else {
    logger.info(`${logName} No added guests in updated guest list`);
  }

  // Send notification to removed users
  if (eventCancelledRecipientIds.length) {
    try {
      const removedRecipients = await UserNotificationPref.findRecipientsByUserId(eventCancelledRecipientIds);

      await Notification.notify(removedRecipients, NotificationType.EventRemovedIndividual, {
        eventName: event.title,
        metadata: { eventId: event.id },
      });
    } catch (err) {
      throw new VisibleError('Failed to send Event Cancelled notifications', {
        isExposable: true,
        cause: err,
        extraInput: { addedUserIds, removedUserIds, eventId: event.id, ownerId: event.ownerId },
      });
    }
  } else {
    logger.info(`${logName} No removed guests in updated guest list`);
  }
}

export async function sendNotificationsOnAwaitingInvitations(from: Date, to: Date) {
  logger.debug(`${logName} Sending notifications to guests with awaiting invitations`, { from, to });

  const events = await Event.findAllByStartsAt(from, to, true);
  if (!events.length) {
    logger.info(`${logName} There are no active events starting in range`, { from, to });
    return;
  }

  const eventIds = events.map(event => event.id);
  const eventUsers = await EventUser.findEventUsersByStatus(eventIds, null);
  if (!eventUsers.length) {
    logger.info(`${logName} There are no pending event invitations for events starting in range`, { from, to });
    return;
  }

  // Make map of events (event IDs) and existing pending event invitations (user IDs)
  const eventIdUserIdMap = new Map<string, string[]>(); // Map<eventId, userId[]>
  for (let i = 0; i < eventUsers.length; i++) {
    const guests = eventIdUserIdMap.get(eventUsers[i].eventId);
    if (guests?.length) {
      guests.push(eventUsers[i].userId);
      continue;
    }

    eventIdUserIdMap.set(eventUsers[i].eventId, [eventUsers[i].userId]);
  }

  const eventIdUserIdEntries = [...eventIdUserIdMap.entries()];
  const notificationJobs = eventIdUserIdEntries.map(async ([eventId, userIds]) => {
    const { title: eventName } = await Event.findOneByIdOrThrow(eventId);
    const recipients = await UserNotificationPref.findRecipientsByUserId(userIds);

    return Notification.notify(recipients, NotificationType.EventAwaitingInvitation, {
      eventName,
      metadata: { eventId },
    });
  });

  const results = await Promise.allSettled(notificationJobs);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.warn(`${logName} Failed to send "Awaiting invitation" notification!`, {
        reason: result?.reason,
        result,
        job: { entry: eventIdUserIdEntries[index] },
      });
    }
  });
}

export * as Notification from './notification.js';
