import { Event, EventUser, User, FileStorage, Team } from '@up-from/repository';
import { EventBus } from '@up-from/services/event-bus';
import { VisibleError, logger } from '@up-from/util';

export { EventShape } from '@up-from/repository/event';

const logName = 'Core Admin: Event';

export async function findOneById(eventId: string) {
  logger.debug(`${logName} Getting an event by ID`, { eventId });
  return Event.findOneById(eventId);
}

export async function getAll(range: Event.EventFindRange) {
  logger.debug(`${logName} Getting all events`, { range });
  return Event.getAll(range);
}

export async function findAllByTeamId(teamId: string) {
  logger.debug(`${logName} Getting all team events`, { teamId });
  return Event.findAll({ teamId });
}

export async function findAllByOrganizationId(organizationId: string, range: Event.EventFindRange) {
  logger.debug(`${logName} Getting all team events`, { organizationId, range });

  const teams = await Team.findAllByOrganizationId(organizationId);
  const teamIds = teams.map(({ id }) => id);
  return Event.findAllByMultipleTeamIds(teamIds, {}, range);
}

export async function findAllUserEventsByUserId(userId: string) {
  logger.debug(`${logName} Getting all user events`, { userId });
  return Event.findByInvitedUser(userId);
}

export async function cancel(eventId: string) {
  logger.debug(`${logName} Cancelling an event`, { eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (event.isCancelled) {
    throw new VisibleError('Failed to cancel an event: Event is already cancelled', {
      isExposable: true,
      extraInput: { eventId },
    });
  }

  const cancelledEvent = await Event.updateAsAdminOrThrow(eventId, { isCancelled: true });

  const isOwnerIncluded = true;
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

export async function restore(eventId: string) {
  logger.debug(`${logName} Restoring a cancelled event`, { eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (!event.isCancelled) {
    throw new VisibleError('Failed to restore an event: Event is not cancelled', {
      isExposable: true,
      extraInput: { eventId },
    });
  }

  return Event.updateAsAdminOrThrow(eventId, { isCancelled: false });
}

export async function create(eventDraft: Event.EventDraft, isOwnerAttending = true) {
  logger.debug(`${logName} Creating a new event`, { eventDraft, isOwnerAttending });

  const owner = await User.findOneById(eventDraft.ownerId);
  if (!owner) {
    throw new VisibleError('Failed to create a new event: Owner does not exist', {
      isExposable: true,
      extraInput: { eventDraft },
    });
  }

  const event = await Event.create(eventDraft);

  if (isOwnerAttending) {
    await EventUser.addEventUsers([event.ownerId], event.id, true);
  }

  // Send notifications on new All Teams Event
  if (!event.teamId) {
    const isOwnerIncluded = true;
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

export async function update(eventId: string, eventDraft: Event.EventUpdateable) {
  logger.debug(`${logName} Updating an event`, { eventId, eventDraft });

  if (eventDraft.ownerId) {
    try {
      await User.findOneByIdOrThrow(eventDraft.ownerId);
    } catch (err) {
      throw new VisibleError('Failed to update an event: New owner does not exist', {
        isExposable: true,
        extraInput: { eventDraft },
      });
    }
  }

  if (eventDraft.startsAt && eventDraft.endsAt && eventDraft.startsAt > eventDraft.endsAt) {
    throw new VisibleError('Failed to update event: New start date/time must precede new end date/time', {
      isExposable: true,
      extraInput: { eventDraft },
    });
  }

  const event = await Event.findOneByIdOrThrow(eventId);
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

  const updatedEvent = await Event.updateAsAdminOrThrow(eventId, eventDraft);
  if (!updatedEvent) {
    throw new VisibleError('Failed to update event: Event does not exist', {
      isExposable: true,
      extraInput: { eventId },
    });
  }

  // Send notifications on event location change
  const isOwnerIncluded = true;
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

  // Send notifications on event time/date change
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

export async function generateImageUploadUrl(eventId: string) {
  logger.debug(`${logName} Generating image upload url`, { eventId });

  const event = await Event.findOneByIdOrThrow(eventId);

  return FileStorage.generateImageUploadUrl(event.id, 'event');
}

export async function completeImageUpload(eventId: string) {
  logger.debug(`${logName} Completing event image upload`, { eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  const imageUrl = await FileStorage.completeImageUpload(event.id, 'event');
  return Event.updateAsAdminOrThrow(eventId, { imageUrl });
}

export async function removeImage(eventId: string) {
  logger.debug(`${logName} Removing event image`, { eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (!event.imageUrl) {
    throw new VisibleError('Failed to remove event image: Image does not exist', {
      isExposable: true,
      extraInput: { eventOwnerId: event.ownerId },
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

  return await Event.updateAsAdminOrThrow(eventId, { imageUrl: null });
}

export * as Event from './event.js';
