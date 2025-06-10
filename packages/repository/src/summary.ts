import { SQL } from '#sql';
import { logger, VisibleError } from '@up-from/util';

import { tableName as userTableName } from './user.js';
import { tableName as adminTableName } from './admin.js';
import { tableName as organizationTableName } from './organization.js';
import { tableName as teamTableName } from './team.js';
import { tableName as eventTableName } from './event.js';
import { tableName as teamUserTableName } from './team-user.js';

const logName = 'Repository Summary:';

export type SummaryCountersShape = {
  admins: number;
  events: number;
  invitedUsers: number;
  ongoingEvents: number;
  organizations: number;
  pastEvents: number;
  signupCompletedUsers: number;
  teams: number;
  upcomingEvents: number;
  users: number;
};

export async function getAllCounters(): Promise<SummaryCountersShape> {
  logger.debug(`${logName} Selecting all counters`);

  const now = new Date();
  try {
    // Since 0.26.2 Kysely supports selectNoFrom() method to select without from clause which is more suitable here in contrast to transaction.
    // Update this code once SST updates Kysely to 0.26.2 or higher
    // https://kysely-org.github.io/kysely-apidoc/classes/Kysely.html#selectNoFrom
    return await SQL.DB.transaction().execute(async dbTransaction => {
      const { countAll } = dbTransaction.fn;

      const { invitedUsers } = await dbTransaction
        .selectFrom(userTableName)
        .select(countAll<number>().as('invitedUsers'))
        .where('isSignupCompleted', '=', false)
        .executeTakeFirstOrThrow();

      const { signupCompletedUsers } = await dbTransaction
        .selectFrom(userTableName)
        .select(countAll<number>().as('signupCompletedUsers'))
        .where('isSignupCompleted', '=', true)
        .executeTakeFirstOrThrow();

      const { admins } = await dbTransaction
        .selectFrom(adminTableName)
        .select(countAll<number>().as('admins'))
        .executeTakeFirstOrThrow();

      const { organizations } = await dbTransaction
        .selectFrom(organizationTableName)
        .select(countAll<number>().as('organizations'))
        .executeTakeFirstOrThrow();

      const { teams } = await dbTransaction
        .selectFrom(teamTableName)
        .select(countAll<number>().as('teams'))
        .executeTakeFirstOrThrow();

      const { pastEvents } = await dbTransaction
        .selectFrom(eventTableName)
        .select(countAll<number>().as('pastEvents'))
        .where('endsAt', '<=', now)
        .executeTakeFirstOrThrow();

      const { upcomingEvents } = await dbTransaction
        .selectFrom(eventTableName)
        .select(countAll<number>().as('upcomingEvents'))
        .where('startsAt', '>', now)
        .executeTakeFirstOrThrow();

      const { ongoingEvents } = await dbTransaction
        .selectFrom(eventTableName)
        .select(countAll<number>().as('ongoingEvents'))
        .where('startsAt', '<=', now)
        .where('endsAt', '>', now)
        .executeTakeFirstOrThrow();

      return {
        users: invitedUsers + signupCompletedUsers,
        invitedUsers,
        signupCompletedUsers,
        admins,
        organizations,
        teams,
        events: pastEvents + upcomingEvents + ongoingEvents,
        pastEvents,
        upcomingEvents,
        ongoingEvents,
      };
    });
  } catch (err) {
    throw new VisibleError('Failed to select all counters', {
      cause: err,
      isExposable: true,
    });
  }
}

export async function getAllOrganizationCounters(organizationId: string): Promise<SummaryCountersShape> {
  logger.debug(`${logName} Selecting all organization counters`, { organizationId });

  const now = new Date();
  try {
    // Since 0.26.2 Kysely supports selectNoFrom() method to select without from clause which is more suitable here in contrast to transaction.
    // Update this code once SST updates Kysely to 0.26.2 or higher
    // https://kysely-org.github.io/kysely-apidoc/classes/Kysely.html#selectNoFrom
    return await SQL.DB.transaction().execute(async dbTransaction => {
      const { countAll } = dbTransaction.fn;

      const teams = await dbTransaction
        .selectFrom(teamTableName)
        .select('id')
        .where('organizationId', '=', organizationId)
        .execute();

      const teamIds = teams.map(({ id }) => id);
      const users = await dbTransaction
        .selectFrom(teamUserTableName)
        .select('userId')
        .distinct()
        .where('teamId', 'in', teamIds)
        .execute();

      const userIds = users.map(({ userId }) => userId);
      const { invitedUsers } = await dbTransaction
        .selectFrom(userTableName)
        .select(countAll<number>().as('invitedUsers'))
        .where('id', 'in', userIds)
        .where('isSignupCompleted', '=', false)
        .executeTakeFirstOrThrow();

      const { signupCompletedUsers } = await dbTransaction
        .selectFrom(userTableName)
        .select(countAll<number>().as('signupCompletedUsers'))
        .where('id', 'in', userIds)
        .where('isSignupCompleted', '=', true)
        .executeTakeFirstOrThrow();

      const { pastEvents } = await dbTransaction
        .selectFrom(eventTableName)
        .select(countAll<number>().as('pastEvents'))
        .where('teamId', 'in', teamIds)
        .where('endsAt', '<=', now)
        .executeTakeFirstOrThrow();

      const { upcomingEvents } = await dbTransaction
        .selectFrom(eventTableName)
        .select(countAll<number>().as('upcomingEvents'))
        .where('teamId', 'in', teamIds)
        .where('startsAt', '>', now)
        .executeTakeFirstOrThrow();

      const { ongoingEvents } = await dbTransaction
        .selectFrom(eventTableName)
        .select(countAll<number>().as('ongoingEvents'))
        .where('teamId', 'in', teamIds)
        .where('startsAt', '<=', now)
        .where('endsAt', '>', now)
        .executeTakeFirstOrThrow();

      return {
        users: invitedUsers + signupCompletedUsers,
        invitedUsers,
        signupCompletedUsers,
        admins: 0,
        organizations: 1,
        teams: teams.length,
        events: pastEvents + upcomingEvents + ongoingEvents,
        pastEvents,
        upcomingEvents,
        ongoingEvents,
      };
    });
  } catch (err) {
    throw new VisibleError('Failed to select all counters', {
      cause: err,
      isExposable: true,
    });
  }
}

export * as Summary from './summary.js';
