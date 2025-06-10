import { ulid } from 'ulid';
import { sql, SelectQueryBuilder } from 'kysely';

import { VisibleError, logger } from '@up-from/util';

import { tableName as eventUserTableName } from '@up-from/repository/event-user';
import { SQL, InsertableType, SelectableType, UpdateableType, NoResultError } from '#sql';
import { loaders } from '#dataloader';
import type { Database } from './rds/sql.generated.js';

export { TimeRange, Pagination } from '#sql';

export type EventShape = SelectableType['event'];

type EventInsertable = InsertableType['event'];
export type EventDraft = Omit<EventInsertable, 'createdAt' | 'updatedAt' | 'id'>;

export type EventUpdateable = UpdateableType['event'];
export type EventUpdateArgs = Omit<EventUpdateable, 'id' | 'createdAt' | 'ownerId'>;

export type EventFindArgs = Partial<Omit<EventShape, 'id'>>;

export type EventFindRange = {
  timeRange?: SQL.TimeRange;
  pagination?: SQL.Pagination;
  isOngoingIncluded?: boolean;
};
type EventInvitationArgs = {
  isAttending?: boolean | null; // true if going to visit event, false if not going to visit event, null if not responded, undefined - skip this filter
  range?: EventFindRange;
};

export const tableName = 'event';

const logName = 'Repository Event:';

function addPagination<QueryType extends SelectQueryBuilder<Database, 'event', object>>(
  query: QueryType,
  pagination?: SQL.Pagination,
) {
  if (!pagination?.cursor && !pagination?.limit) return query;

  const { cursor, limit, order } = pagination;
  if (cursor) {
    const operator = order === 'asc' ? '>' : '<';
    // Implements SQL query:
    // WHERE ( (id < 123 AND startsAt = (SELECT startsAt FROM event WHERE id = 123))
    // OR startsAt < (SELECT startsAt FROM event WHERE id = 123) )
    query = query.where(({ and, or, eb, selectFrom }) =>
      or([
        and([
          eb('id', operator, cursor),
          eb('startsAt', '=', selectFrom(tableName).select('startsAt').where('id', '=', cursor)),
        ]),
        eb('startsAt', operator, selectFrom(tableName).select('startsAt').where('id', '=', cursor)),
      ]),
    ) as QueryType;
  }

  if (limit) {
    query = query.limit(limit) as QueryType;
  }

  return query;
}

export async function create(eventDraft: EventDraft) {
  logger.debug(`${logName} Creating a new event`, { eventDraft });

  const id = ulid();

  try {
    const [event] = await SQL.DB.insertInto(tableName)
      .values({ ...eventDraft, id })
      .returningAll()
      .execute();

    loaders.events.prime(event.id, event);

    return event;
  } catch (err) {
    if (err instanceof Error) {
      if (err?.message?.includes('event_check')) {
        throw new VisibleError('Failed to create event: Only Team Events could be marked as individual events', {
          isExposable: true,
          cause: err,
          extraInput: { eventDraft },
        });
      }
      if (err?.message?.includes('event_teamId')) {
        throw new VisibleError('Failed to create event: Team event should have proper Team ID', {
          isExposable: true,
          cause: err,
          extraInput: { eventDraft },
        });
      }
      if (err?.message?.includes('event_startsAt_endsAt_date_check')) {
        throw new VisibleError(
          'Failed to create event: Event start date should be same or earlier than event end date',
          {
            isExposable: true,
            cause: err,
            extraInput: { eventDraft },
          },
        );
      }
    }
    throw new VisibleError('Failed to create event', { isExposable: true, cause: err, extraInput: { eventDraft } });
  }
}

export async function update(id: string, ownerId: string, args: EventUpdateArgs) {
  logger.debug(`${logName} Updating an event`, { id, ownerId, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update an event: Update arguments are not provided', {
      isExposable: true,
      extraInput: { id, args },
    });
  }

  try {
    const event = await SQL.DB.updateTable(tableName)
      .set({ ...args })
      .where('id', '=', id)
      .where('ownerId', '=', ownerId)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.events.clear(event.id).prime(event.id, event);

    return event;
  } catch (err) {
    if (err instanceof NoResultError) {
      throw new VisibleError('Failed to update an event: Event does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id, ownerId, args },
      });
    }
    if (err instanceof Error) {
      if (err?.message?.includes('event_check')) {
        throw new VisibleError('Failed to update event: Only Team Events could be marked as individual events', {
          isExposable: true,
          cause: err,
          extraInput: { id, ownerId, args },
        });
      }
      if (err?.message?.includes('event_teamId')) {
        throw new VisibleError('Failed to update event: Team event should have proper Team ID', {
          isExposable: true,
          cause: err,
          extraInput: { id, ownerId, args },
        });
      }
      if (err?.message?.includes('event_startsAt_endsAt_date_check')) {
        throw new VisibleError(
          'Failed to update event: Event start date should be same or earlier than event end date',
          {
            isExposable: true,
            cause: err,
            extraInput: { id, ownerId, args },
          },
        );
      }
    }

    throw new VisibleError('Failed to update event', {
      isExposable: true,
      cause: err,
      extraInput: { id, ownerId, args },
    });
  }
}

export async function updateAsAdminOrThrow(id: string, args: EventUpdateable) {
  logger.debug(`${logName} Updating an event as Admin`, { id, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update an event as Admin: Update arguments are not provided', {
      isExposable: true,
      extraInput: { id, args },
    });
  }

  try {
    const event = await SQL.DB.updateTable(tableName)
      .set({ ...args })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.events.clear(event.id).prime(event.id, event);

    return event;
  } catch (err) {
    if (err instanceof NoResultError) {
      throw new VisibleError('Failed to update an event as Admin: Event does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id, args },
      });
    }

    throw new VisibleError('Failed to update event as Admin', {
      isExposable: true,
      cause: err,
      extraInput: { id, args },
    });
  }
}

export async function findOneById(eventId: string) {
  logger.debug(`${logName} Selecting one event`, { id: eventId });
  return loaders.events.load(eventId);
}

export async function findOneByIdOrThrow(eventId: string) {
  const event = await findOneById(eventId);
  if (!event) {
    throw new VisibleError('Failed to find event: Event does not exist', {
      isExposable: true,
      extraInput: { eventId },
    });
  }

  return event;
}

export async function findAll(args: EventFindArgs, range?: EventFindRange): Promise<EventShape[]> {
  logger.debug(`${logName} Selecting multiple events`, { args, range });

  if (!Object.keys(args).length) return [];

  try {
    let query = SQL.DB.selectFrom(tableName).selectAll();
    query = SQL.addWhereArgs(query, args);
    if (range) {
      query = SQL.addWhereTimeRange(query, range);
      query = addPagination(query, range?.pagination);
    }

    const order = range?.pagination?.order || 'asc';
    const events = await query.orderBy('event.startsAt', order).orderBy('event.id', order).execute();

    events.forEach(event => loaders.events.prime(event.id, event));

    return events;
  } catch (err) {
    throw new VisibleError('Failed to find events', { isExposable: true, cause: err, extraInput: { args, range } });
  }
}

export async function findAllByMultipleTeamIds(
  teamIds: string[],
  args: EventFindArgs = {},
  range?: EventFindRange,
): Promise<EventShape[]> {
  logger.debug(`${logName} Selecting multiple events by multiple team IDs`, { teamIds, args, range });

  if (!teamIds.length) return [];

  try {
    let query = SQL.DB.selectFrom(tableName).selectAll();
    if (Object.keys(args).length) {
      query = SQL.addWhereArgs(query, args);
    }
    query = query.where('teamId', 'in', teamIds);
    if (range) {
      query = SQL.addWhereTimeRange(query, range);
      query = addPagination(query, range?.pagination);
    }

    const order = range?.pagination?.order || 'asc';
    const events = await query.orderBy('event.startsAt', order).orderBy('event.id', order).execute();

    events.forEach(event => loaders.events.prime(event.id, event));

    return events;
  } catch (err) {
    throw new VisibleError('Failed to find events', { isExposable: true, cause: err, extraInput: { args, range } });
  }
}

export async function getAll(range: EventFindRange): Promise<EventShape[]> {
  logger.debug(`${logName} Selecting all events`, { range });

  try {
    let query = SQL.DB.selectFrom(tableName).selectAll();
    query = SQL.addWhereTimeRange(query, range);
    query = addPagination(query, range?.pagination);

    const order = range?.pagination?.order || 'asc';
    const events = await query.orderBy('event.startsAt', order).orderBy('event.id', order).execute();

    events.forEach(event => loaders.events.prime(event.id, event));

    return events;
  } catch (err) {
    throw new VisibleError('Failed to find events', { isExposable: true, cause: err, extraInput: { range } });
  }
}

export async function findByInvitedUser(userId: string, invitationArgs?: EventInvitationArgs) {
  logger.debug(`${logName} Selecting events by invited by user`, { userId, inviteArgs: invitationArgs });

  try {
    let query = SQL.DB.selectFrom(tableName)
      .innerJoin(eventUserTableName, `${tableName}.id`, `${eventUserTableName}.eventId`)
      .selectAll(tableName)
      .where(`${eventUserTableName}.userId`, '=', userId)
      .where(`${tableName}.isCancelled`, 'is', false);

    if (invitationArgs) {
      query = SQL.addWhereTimeRange(query, invitationArgs.range);

      if (invitationArgs.isAttending !== undefined) {
        query = query.where(`${eventUserTableName}.isAttending`, 'is', invitationArgs.isAttending);
      }

      query = addPagination(query, invitationArgs.range?.pagination);
    }

    const order = invitationArgs?.range?.pagination?.order || 'asc';
    const events = await query.orderBy('event.startsAt', order).orderBy('event.id', order).execute();

    events.forEach(event => loaders.events.prime(event.id, event));

    return events;
  } catch (err) {
    throw new VisibleError('Failed to find invited users', {
      isExposable: true,
      cause: err,
      extraInput: { userId, invitationArgs },
    });
  }
}

export async function searchByTitle(teamIds: string[], searchString: string, pagination?: SQL.Pagination) {
  logger.debug(`${logName} Searching for events by title`, { searchString, teamIds });

  try {
    let query = SQL.DB.selectFrom(tableName)
      .selectAll()
      .where(({ and, or, eb }) => {
        const teamIdComparers = [eb(`teamId`, 'is', null)];
        if (teamIds.length) teamIdComparers.push(eb(`teamId`, 'in', teamIds));

        return and([
          eb('isCancelled', 'is', false),
          or(teamIdComparers),
          eb(sql`to_tsvector('english', title)`, '@@', sql`websearch_to_tsquery('english', ${searchString})`),
        ]);
      });

    if (pagination) {
      query = addPagination(query, pagination);
    }

    const order = pagination?.order || 'asc';
    const events = await query.orderBy('event.startsAt', order).orderBy('event.id', order).execute();

    events.forEach(event => loaders.events.prime(event.id, event));

    return events;
  } catch (err) {
    throw new VisibleError('Failed to perform Event search', {
      isExposable: true,
      cause: err,
      extraInput: { teamIds, searchString, pagination },
    });
  }
}

export async function findAllByStartsAt(fromStartsAt: Date, toStartsAt: Date, isCancelledExcluded = false) {
  logger.debug(`${logName} Selecting events by start time`, { fromStartsAt, toStartsAt });

  try {
    let query = SQL.DB.selectFrom(tableName)
      .selectAll()
      .where('startsAt', '>=', fromStartsAt)
      .where('startsAt', '<=', toStartsAt);

    if (isCancelledExcluded) {
      query = query.where('isCancelled', 'is', false);
    }

    const events = await query.orderBy('event.startsAt', 'asc').execute();

    events.forEach(event => loaders.events.prime(event.id, event));

    return events;
  } catch (err) {
    throw new VisibleError('Failed to get events by start date', {
      isExposable: true,
      cause: err,
      extraInput: { fromStartsAt, toStartsAt },
    });
  }
}

// This function should be used only by loader
export async function loaderFindAllEventsByIds(ids: readonly string[]) {
  logger.debug(`${logName} Selecting multiple events for loader by IDs`, { ids });

  if (!ids.length) return [];

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('id', 'in', ids).orderBy('event.id', 'asc').execute();
  } catch (err) {
    throw new VisibleError('Failed to find events by IDs', {
      isExposable: true,
      cause: err,
      extraInput: { ids },
    });
  }
}

export * as Event from './event.js';
