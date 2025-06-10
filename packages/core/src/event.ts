import { Event, EventUser, User, Team, FileStorage, TeamUser } from '@up-from/repository';
import { EventBus } from '@up-from/services/event-bus';
import { VisibleError, logger } from '@up-from/util';

import { findEventUsersByEventId } from '@up-from/core/event-user';
import { getValidUser } from '@up-from/core/user';

export { TimeRange, EventShape } from '@up-from/repository/event';

const logName = 'Core Event:';

/**
 * Validate permission to view one event by a specific user.
 * Throws an error if user is not allowed to get the event.
 * Restricted to owner / team member / invited user / public event
 */
async function validateUserPermissionToViewEvent(event: Event.EventShape, user: User.UserShape) {
  await getValidUser(user.id); // will throw on invalid user

  // All Team Event is accessible by default
  if (!event.teamId) return event;

  // Own event is accessible to owner
  if (event.ownerId === user.id) return event;

  // Team event is accessible to team members
  const teamUser = await TeamUser.findOne(event.teamId, user.id);
  if (teamUser) return event;

  // Event is accessible to invited users
  const invitedUsers = await findEventUsersByEventId(event.id);
  const isInvitedUser = invitedUsers.some(({ userId }) => userId === user.id);
  if (isInvitedUser) return event;

  throw new VisibleError('User is not allowed to view this event', {
    isExposable: true,
    extraInput: { eventId: event.id, userId: user.id },
  });
}

export function isEventStarted(event: Pick<Event.EventShape, 'startsAt'>): boolean {
  return !event?.startsAt || event.startsAt.getTime() < Date.now();
}

export async function create(eventDraft: Event.EventDraft, isOwnerAttending = true, guestIds: string[] = []) {
  logger.debug(`${logName} Creating a new event`, { eventDraft, isOwnerAttending, guestIds });

  if (eventDraft.startsAt < new Date()) {
    throw new VisibleError('Failed to create new event: Start date/time must be later than current date/time', {
      isExposable: true,
      extraInput: { eventDraft },
    });
  }

  if (eventDraft.startsAt > eventDraft.endsAt) {
    throw new VisibleError('Failed to create new event: Start date/time must precede end date/time', {
      isExposable: true,
      extraInput: { eventDraft },
    });
  }

  await getValidUser(eventDraft.ownerId); // will throw on invalid user

  const event = await Event.create(eventDraft);

  if (isOwnerAttending) {
    await EventUser.addEventUsers([event.ownerId], event.id, true);
  }

  if (guestIds.length) {
    const guestsExceptOwner = guestIds.filter(guestId => guestId !== eventDraft.ownerId);
    await EventUser.addEventUsers(guestsExceptOwner, event.id);
  }

  // Send notifications on new All Team Event
  if (!event.teamId) {
    const isOwnerIncluded = false;
    try {
      await EventBus.publishOnEventAllTeamsCreated(event.id, isOwnerIncluded);
    } catch (err) {
      // No rethrowing (just log the error)
      new VisibleError('Failed to publish bus event on new All Teams event created!', {
        cause: err,
        extraInput: { eventId: event.id, isOwnerIncluded },
      });
    }
  }

  return event;
}

export async function update(eventId: string, ownerId: string, eventDraft: Event.EventUpdateArgs) {
  logger.debug(`${logName} Updating an event`, { eventId, ownerId, eventDraft });

  if (eventDraft.startsAt && eventDraft.startsAt < new Date()) {
    throw new VisibleError('Failed to update event: New start date/time must be later than current date/time', {
      isExposable: true,
      extraInput: { eventDraft },
    });
  }

  if (eventDraft.startsAt && eventDraft.endsAt && eventDraft.startsAt > eventDraft.endsAt) {
    throw new VisibleError('Failed to update event: New start date/time must precede new end date/time', {
      isExposable: true,
      extraInput: { eventDraft },
    });
  }

  await getValidUser(ownerId); // will throw on invalid user

  const event = await Event.findOneByIdOrThrow(eventId);
  if (event.ownerId !== ownerId) {
    throw new VisibleError('Failed to update event: Only owner can update this event', {
      isExposable: true,
      extraInput: { eventId, ownerId, eventDraft },
    });
  }

  if (isEventStarted(event)) {
    throw new VisibleError('Failed to update event: Event has already started', {
      isExposable: true,
      extraInput: { eventId, ownerId, eventDraft },
    });
  }

  if (event?.isCancelled) {
    throw new VisibleError('Failed to update event: Event is canceled', {
      isExposable: true,
      extraInput: { eventId, ownerId },
    });
  }

  if (eventDraft.startsAt && !eventDraft.endsAt && event.endsAt < eventDraft.startsAt) {
    throw new VisibleError('Failed to update event: New start date/time must precede end date/time', {
      isExposable: true,
      extraInput: { eventDraft, event },
    });
  }

  if (eventDraft.endsAt && !eventDraft.startsAt && event.startsAt > eventDraft.endsAt) {
    throw new VisibleError('Failed to update event: Start date/time must precede new end date/time', {
      isExposable: true,
      extraInput: { eventDraft, event },
    });
  }

  const updatedEvent = await Event.update(eventId, ownerId, eventDraft);
  if (!updatedEvent) {
    throw new VisibleError('Failed to update event: Event does not exist', {
      isExposable: true,
      extraInput: { eventId, ownerId },
    });
  }

  // Send notifications on location change
  const isOwnerIncluded = false;
  const isLocationChanged = event.location !== updatedEvent.location;
  if (isLocationChanged) {
    try {
      await EventBus.publishOnEventLocationUpdated(updatedEvent.id, isOwnerIncluded);
    } catch (err) {
      // No rethrowing (just log the error)
      new VisibleError('Failed to publish bus event on event location update!', {
        cause: err,
        extraInput: { eventId, isOwnerIncluded },
      });
    }
  }

  // Send notifications on time/date change
  const isStartsAtChanged = event.startsAt.getTime() !== updatedEvent.startsAt.getTime();
  const isEndsAtChanged = event.endsAt.getTime() !== updatedEvent.endsAt.getTime();
  if (isStartsAtChanged || isEndsAtChanged) {
    try {
      await EventBus.publishOnEventDateTimeUpdated(updatedEvent.id, isOwnerIncluded);
    } catch (err) {
      // No rethrowing (just log the error)
      new VisibleError('Failed to publish bus event on event date/time update!', {
        cause: err,
        extraInput: { eventId, isOwnerIncluded },
      });
    }
  }

  return updatedEvent;
}

export async function findOne(eventId: string, userId: string) {
  logger.debug(`${logName} Getting an event`, { eventId, userId });

  const event = await Event.findOneById(eventId);
  if (!event) return;

  const user = await User.findOneByIdOrThrow(userId);

  return await validateUserPermissionToViewEvent(event, user);
}

/**
 * Find all events with pending invitations (Invitations tab in app)
 */
export async function findPendingEvents(userId: string, range: Event.EventFindRange) {
  logger.debug(`${logName} Getting pending events`, { userId, range });

  await getValidUser(userId); // will throw on invalid user

  return Event.findByInvitedUser(userId, { range, isAttending: null });
}
/**
 * Find all events with declined invitations
 */
export async function findDeclinedEvents(userId: string, range: Event.EventFindRange) {
  logger.debug(`${logName} Getting events with declined invitations`, { userId, range });

  await getValidUser(userId); // will throw on invalid user

  return await Event.findByInvitedUser(userId, { range, isAttending: false });
}

/**
 * Find all events with accepted invitations (Your events tab in app)
 */
export async function findYourEvents(userId: string, range: Event.EventFindRange) {
  logger.debug(`${logName} Getting events with accepted invitations (Your Events)`, { userId, range });

  await getValidUser(userId); // will throw on invalid user

  return await Event.findByInvitedUser(userId, { range, isAttending: true });
}

/**
 * Find team events (Team events tab in app)
 */
export async function findTeamEvents(userId: string, range: Event.EventFindRange) {
  logger.debug(`${logName} Getting Team Events`, { userId, range });

  const user = await getValidUser(userId); // will throw on invalid user

  const userTeamIds = await TeamUser.findTeamIdsByUserId(user.id);
  if (!userTeamIds.length) return [];

  return await Event.findAllByMultipleTeamIds(userTeamIds, { isCancelled: false }, range);
}

/**
 * Find public team events (All Team events tab in app)
 */
export async function findAllTeamEvents(userId: string, range: Event.EventFindRange) {
  logger.debug(`${logName} Getting All Team Events`, { userId, range });

  await getValidUser(userId); // will throw on invalid user

  return await Event.findAll({ teamId: null, isCancelled: false }, range);
}

export async function generateImageUploadUrl(eventId: string, ownerId: string) {
  logger.debug(`${logName} Generating image upload url`, { eventId, ownerId });

  await getValidUser(ownerId); // will throw on invalid user

  const event = await Event.findOneByIdOrThrow(eventId);
  if (event.ownerId !== ownerId) {
    throw new VisibleError('Failed to generate image upload URL: Only Event owner can generate upload URL', {
      isExposable: true,
      extraInput: { ownerId, eventOwnerId: event.ownerId },
    });
  }

  return FileStorage.generateImageUploadUrl(eventId, 'event');
}

export async function completeImageUpload(eventId: string, ownerId: string) {
  logger.debug(`${logName} Completing event image upload`, { eventId, ownerId });

  await getValidUser(ownerId); // will throw on invalid user

  const event = await Event.findOneByIdOrThrow(eventId);
  if (event.ownerId !== ownerId) {
    throw new VisibleError('Failed to complete event image upload image: Only event owner can update event', {
      isExposable: true,
      extraInput: { ownerId, eventOwnerId: event.ownerId },
    });
  }

  const imageUrl = await FileStorage.completeImageUpload(eventId, 'event');
  const updatedEvent = await Event.update(eventId, ownerId, { imageUrl });
  if (!updatedEvent) {
    throw new VisibleError('Failed to set event image URL: Event not found!', {
      isExposable: true,
      extraInput: { eventId, ownerId },
    });
  }
  return updatedEvent;
}

export async function removeImage(eventId: string, ownerId: string) {
  logger.debug(`${logName} Removing event image`, { eventId, ownerId });

  await getValidUser(ownerId); // will throw on invalid user

  const event = await Event.findOneByIdOrThrow(eventId);
  if (event.ownerId !== ownerId) {
    throw new VisibleError('Failed to remove event image: Only Event owner can update event', {
      isExposable: true,
      extraInput: { ownerId, eventOwnerId: event.ownerId },
    });
  }

  if (!event.imageUrl) {
    throw new VisibleError('Failed to remove event image: Image does not exist', {
      isExposable: true,
      extraInput: { ownerId, eventOwnerId: event.ownerId },
    });
  }

  try {
    await FileStorage.removeImage(event.imageUrl, eventId, 'event');
  } catch (err) {
    logger.warn(`${logName} Removing event image: Failed to remove event image from S3 bucket.`, {
      eventId,
      url: event.imageUrl,
      cause: err,
    });
  }

  const updatedEvent = await Event.update(eventId, ownerId, { imageUrl: null });
  if (!updatedEvent) {
    throw new VisibleError('Failed to set event image: Event not found!', {
      isExposable: true,
      extraInput: { eventId, ownerId },
    });
  }
  return updatedEvent;
}

export async function findEventTeamForUser(event: Event.EventShape, userId: string) {
  logger.debug(`${logName} Getting an event team for a user`, { eventId: event.id, eventTeamId: event.teamId, userId });

  if (!event.teamId) return null;

  const teamMember = await TeamUser.findOne(event.teamId, userId);
  if (!teamMember) return null;

  return await Team.findOneById(event.teamId);
}

export async function cancelOne(eventId: string, ownerId: string) {
  logger.debug(`${logName} Marking an event as cancelled`, { eventId, ownerId });

  await getValidUser(ownerId); // will throw on invalid user

  const event = await Event.findOneByIdOrThrow(eventId);
  if (isEventStarted(event)) {
    throw new VisibleError('Failed to cancel event: Event has already started', {
      isExposable: true,
      extraInput: { eventId, ownerId },
    });
  }

  if (event?.isCancelled) {
    throw new VisibleError('Failed to cancel event: Event is already cancelled', {
      isExposable: true,
      extraInput: { eventId, ownerId },
    });
  }

  const cancelledEvent = await Event.update(eventId, ownerId, { isCancelled: true });

  const isOwnerIncluded = false;
  try {
    await EventBus.publishOnEventCancelled(cancelledEvent.id, isOwnerIncluded);
  } catch (err) {
    // No rethrowing (just log the error)
    new VisibleError('Failed to publish bus event on user enabling!', {
      cause: err,
      extraInput: { eventId, isOwnerIncluded },
    });
  }

  return cancelledEvent;
}

export async function searchByTitle(userId: string, searchString: string, pagination: Event.Pagination) {
  logger.debug(`${logName} Searching by title`, { userId, searchString, pagination });

  const user = await getValidUser(userId);

  const userTeamIds = await TeamUser.findTeamIdsByUserId(user.id);
  return await Event.searchByTitle(userTeamIds, searchString, pagination);
}

export * as Event from './event.js';
