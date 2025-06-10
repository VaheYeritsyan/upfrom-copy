import { sql } from 'kysely';

import { VisibleError, logger } from '@up-from/util';

import { SQL, SelectableType } from '#sql';
import { loaders } from '#dataloader';

export { TimeRange } from '#sql';

export type EventUserShape = SelectableType['event_user'];

export type EventUserAttendanceShape = {
  userId: string;
  accepted: number;
  declined: number;
  pending: number;
  total: number;
};

export const tableName = 'event_user';

const logName = 'Repository Event User:';

export async function findEventUsersByEventId(eventId: string) {
  logger.debug(`${logName} Selecting event users`, { eventId });
  return loaders.eventUsersByEventId.load(eventId);
}

// Adds event_user entries and removes event_user entries in one transaction
export async function setEventUsers(
  addUserIds: string[],
  removeUserIds: string[],
  eventId: string,
  isAttending: boolean | null = null,
) {
  logger.debug(`${logName} Setting updated event_user list`, { addUserIds, removeUserIds, eventId, isAttending });

  if (!addUserIds.length && !removeUserIds.length) {
    return findEventUsersByEventId(eventId);
  }

  const insertValues = addUserIds.map(userId => ({ userId, eventId, isAttending }));

  try {
    await SQL.DB.transaction().execute(async transaction => {
      let response;
      if (removeUserIds.length) {
        response = await transaction
          .deleteFrom(tableName)
          .where('userId', 'in', removeUserIds)
          .where('eventId', '=', eventId)
          .execute();
      }

      if (insertValues.length) {
        response = await transaction.insertInto(tableName).values(insertValues).execute();
      }

      return response;
    });
  } catch (err) {
    let errorMessage = 'Failed to set new list of event users';
    if (err instanceof Error && err.message.indexOf('event_user_eventId_userId_key') !== -1) {
      errorMessage += ': one or more users already on the list';
    }

    throw new VisibleError(errorMessage, {
      isExposable: true,
      cause: err,
      extraInput: { addUserIds, removeUserIds, eventId, isAttending },
    });
  }

  loaders.eventUsersByEventId.clear(eventId);

  return findEventUsersByEventId(eventId);
}

export async function addEventUsers(userIds: string[], eventId: string, isAttending: boolean | null = null) {
  logger.debug(`${logName} Adding event_user`, { userIds, eventId, isAttending });

  const values = userIds.map(userId => ({ userId, eventId, isAttending }));

  try {
    const addedEventUsers = await SQL.DB.insertInto(tableName).values(values).returningAll().execute();

    loaders.eventUsersByEventId.clear(eventId);

    return addedEventUsers;
  } catch (err) {
    let errorMessage = 'Failed to add attendance statuses';
    if (err instanceof Error && err.message.indexOf('event_user_eventId_userId_key') !== -1) {
      errorMessage += ': one or more statuses already exist';
    }

    throw new VisibleError(errorMessage, {
      isExposable: true,
      cause: err,
      extraInput: { userIds, eventId, isAttending },
    });
  }
}

export async function removeEventUsers(userIds: string[], eventId: string) {
  logger.debug(`${logName} Removing event_user`, { userIds, eventId });

  try {
    const removedEventUsers = await SQL.DB.deleteFrom(tableName)
      .where('userId', 'in', userIds)
      .where('eventId', '=', eventId)
      .returningAll()
      .execute();

    loaders.eventUsersByEventId.clear(eventId);

    return removedEventUsers;
  } catch (err) {
    throw new VisibleError('Failed to remove attendance status', {
      isExposable: true,
      cause: err,
      extraInput: { userIds, eventId },
    });
  }
}

export async function updateEventUser(userId: string, eventId: string, isAttending: boolean | null = null) {
  logger.debug(`${logName} Updating attendance status`, { userId, eventId, isAttending });

  try {
    const eventUser = await SQL.DB.updateTable(tableName)
      .set({ isAttending })
      .where('userId', '=', userId)
      .where('eventId', '=', eventId)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.eventUsersByEventId.clear(eventId);

    return eventUser;
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update an invitation status: Invitation does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { userId, eventId, isAttending },
      });
    }

    throw new VisibleError('Failed to update attendance status', {
      isExposable: true,
      cause: err,
      extraInput: { userId, eventId, isAttending },
    });
  }
}

export async function findEventUsersByStatus(eventIds: readonly string[], isAttending: boolean | null) {
  logger.debug(`${logName} Selecting event users by event IDs and status`, { eventIds, isAttending });

  if (!eventIds?.length) return [];

  try {
    const eventUsers = await SQL.DB.selectFrom(tableName)
      .selectAll()
      .where(`${tableName}.eventId`, 'in', eventIds)
      .where(`${tableName}.isAttending`, 'is', isAttending)
      .orderBy('event_user.eventId', 'asc')
      .execute();

    eventIds.forEach(eventId => loaders.eventUsersByEventId.clear(eventId));

    return eventUsers;
  } catch (err) {
    throw new VisibleError('Failed to find event users by status', {
      isExposable: true,
      cause: err,
      extraInput: { eventIds },
    });
  }
}

export async function getAttendance(eventIds?: string[], userIds?: string[]): Promise<EventUserAttendanceShape[]> {
  logger.debug(`${logName} Selecting event attendance report grouped by users`, { userIds, eventIds });

  if (eventIds?.length === 0 || userIds?.length === 0) return [];

  try {
    let query = SQL.DB.selectFrom(tableName)
      .select('userId')
      .select(SQL.DB.fn.count<number>('userId').as('total'))
      .select(sql<number>`COUNT("userId") FILTER (WHERE "isAttending" IS TRUE)`.as('accepted'))
      .select(sql<number>`COUNT("userId") FILTER (WHERE "isAttending" IS FALSE)`.as('declined'))
      .select(sql<number>`COUNT("userId") FILTER (WHERE "isAttending" IS NULL)`.as('pending'));

    if (eventIds) {
      query = query.where('eventId', 'in', eventIds);
    }
    if (userIds) {
      query = query.where('userId', 'in', userIds);
    }

    return await query.groupBy('userId').orderBy('userId', 'asc').execute();
  } catch (err) {
    throw new VisibleError("Failed to select user's top", {
      isExposable: true,
      cause: err,
      extraInput: { userIds, eventIds },
    });
  }
}

// This function should be used only by loader
export async function loaderFindAllEventUsersByEventIds(eventIds: readonly string[]) {
  logger.debug(`${logName} Selecting event users for loader by event IDs`, { eventIds });

  if (!eventIds?.length) return [];

  try {
    return await SQL.DB.selectFrom(tableName)
      .selectAll()
      .where(`${tableName}.eventId`, 'in', eventIds)
      .orderBy('event_user.eventId', 'asc')
      .execute();
  } catch (err) {
    throw new VisibleError('Failed to find event users', {
      isExposable: true,
      cause: err,
      extraInput: { eventIds },
    });
  }
}

export * as EventUser from './event-user.js';
