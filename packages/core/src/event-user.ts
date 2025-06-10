import { Event, EventUser } from '@up-from/repository';
import { EventBus } from '@up-from/services/event-bus';
import { VisibleError, logger } from '@up-from/util';

import { isEventStarted } from '@up-from/core/event';

export { EventUserShape } from '@up-from/repository/event-user';

const logName = 'Core Event User:';

async function findEventUsersByEventIdAndSort(eventId: string) {
  logger.debug(`${logName} Getting sorted event users by event ID`, { eventId });

  const eventUsers = await EventUser.findEventUsersByEventId(eventId);

  // Sort by invitation status (accepted first, then declined, pending last)
  eventUsers.sort((a: EventUser.EventUserShape, b: EventUser.EventUserShape) => {
    if (a.isAttending !== b.isAttending) {
      if (a.isAttending) return 1;
      if (b.isAttending) return -1;
      if (a.isAttending === false) return 1;
      if (b.isAttending === false) return -1;
    }
    return 0;
  });

  return eventUsers;
}

export async function findEventUsersByEventId(eventId: string) {
  logger.debug(`${logName} Getting guests by event ID`, { eventId });
  return findEventUsersByEventIdAndSort(eventId);
}

/**
 * Set new list of invited users for an Event.
 * Users that were previously on the list are not updated and their attendance statuses are not altered.
 */
export async function setListOfInvitedUsers(newUserIds: string[], eventId: string, ownerId: string) {
  logger.debug(`${logName} Setting list of invited users`, { userIds: newUserIds, eventId, ownerId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (isEventStarted(event)) {
    throw new VisibleError('Failed to set list of invited users: Event has already started', {
      isExposable: true,
      extraInput: { eventId: event.id, eventEndDate: event.endsAt },
    });
  }

  if (event.ownerId !== ownerId) {
    throw new VisibleError('Failed to set list of invited users: only owner can update Event', {
      isExposable: true,
      extraInput: { eventId: event.id, userIds: newUserIds, ownerId },
    });
  }

  if (event.isCancelled) {
    throw new VisibleError('Failed to set list of invited users: Event is cancelled', {
      isExposable: true,
      extraInput: { userIds: event.id, newUserIds, eventId, ownerId },
    });
  }

  if (!event.teamId) {
    throw new VisibleError('Failed to set list of invited users: All Team Events are public and visible by default', {
      isExposable: true,
      extraInput: { eventId: event.id, userIds: newUserIds, ownerId },
    });
  }

  const currentEventUsers = await findEventUsersByEventIdAndSort(event.id);
  const currentUserIds = currentEventUsers.map(({ userId }) => userId);
  const removeUserIds = currentUserIds.filter(currentUserId => {
    return !newUserIds.some(newUserId => newUserId === currentUserId);
  });
  const addUserIds = newUserIds.filter(newUserId => {
    return !currentUserIds.some(currentUserId => currentUserId === newUserId);
  });

  await EventUser.setEventUsers(addUserIds, removeUserIds, eventId, null);

  const isOwnerIncluded = false;
  try {
    await EventBus.publishOnEventGuestListUpdated(event.id, addUserIds, removeUserIds, isOwnerIncluded);
  } catch (err) {
    // No rethrowing (just log the error)
    new VisibleError('Failed to publish bus event on event guest list update!', {
      cause: err,
      extraInput: { eventId: event.id, addUserIds, removeUserIds, isOwnerIncluded },
    });
  }

  return event;
}

export async function updateInvitationStatus(userId: string, eventId: string, isAttending: boolean | null) {
  logger.debug(`${logName} Updating invitation status`, { userId, eventId, isAttending });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (isEventStarted(event)) {
    throw new VisibleError('Failed to update invitation status: Event has already started', {
      isExposable: true,
      extraInput: { eventId },
    });
  }

  if (event?.isCancelled) {
    throw new VisibleError('Failed to update invitation status: Event is cancelled', {
      isExposable: true,
      extraInput: { eventId },
    });
  }

  await EventUser.updateEventUser(userId, eventId, isAttending);

  return event;
}

export async function joinPublicEvent(userId: string, eventId: string) {
  logger.debug(`${logName} Joining a public event`, { userId, eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (isEventStarted(event)) {
    throw new VisibleError('Failed to join event: Event has already started', {
      isExposable: true,
      extraInput: { eventId: event.id, eventEndDate: event.endsAt },
    });
  }

  if (event?.teamId) {
    throw new VisibleError('Failed to join event: Event is not an All Team Event', {
      isExposable: true,
      extraInput: { eventId, userId },
    });
  }

  if (event?.isCancelled) {
    throw new VisibleError('Failed to join event: Event is cancelled', {
      isExposable: true,
      extraInput: { eventId, userId },
    });
  }

  await EventUser.addEventUsers([userId], eventId, true);

  return event;
}

export async function leavePublicEvent(userId: string, eventId: string) {
  logger.debug(`${logName} Leaving a public event`, { userId, eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (isEventStarted(event)) {
    throw new VisibleError('Failed to leave event: Event has already started', {
      isExposable: true,
      extraInput: { eventId: event.id, eventEndDate: event.endsAt },
    });
  }

  if (event?.teamId) {
    throw new VisibleError('Failed to leave event: Event is not an All Team Event', {
      isExposable: true,
      extraInput: { eventId, userId },
    });
  }

  if (event?.isCancelled) {
    throw new VisibleError('Failed to leave event: Event is cancelled', {
      isExposable: true,
      extraInput: { eventId, userId },
    });
  }

  await EventUser.removeEventUsers([userId], eventId);

  return event;
}

export * as EventUser from './event-user.js';
