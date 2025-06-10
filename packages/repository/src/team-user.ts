import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType, UpdateableType } from '#sql';
import { loaders } from '#dataloader';

export type TeamUserShape = SelectableType['team_user'];

type TeamUserInsertable = InsertableType['team_user'];
export type TeamUserRole = 'mentor' | 'member';
export type TeamUserDraft = Pick<TeamUserInsertable, 'teamId' | 'userId'> & { role: TeamUserRole };

export type TeamUserUpdateable = UpdateableType['team_user'];

export const tableName = 'team_user';

const logName = 'Repository Team User:';

export async function create(teamUserDraft: TeamUserDraft) {
  logger.debug(`${logName} Creating a team user entry`, { teamUserDraft });

  try {
    const [team] = await SQL.DB.insertInto(tableName).values(teamUserDraft).returningAll().execute();

    loaders.eventUsersByEventId.clear(teamUserDraft.teamId);

    return team;
  } catch (err) {
    throw new VisibleError('Failed to create a new team user entry', {
      isExposable: true,
      cause: err,
      extraInput: { teamUserDraft },
    });
  }
}

export async function updateOne(teamId: string, userId: string, role: TeamUserRole) {
  logger.debug(`${logName} Updating a team member`, { teamId, userId, role });

  try {
    const updatedTeamMember = await SQL.DB.updateTable(tableName)
      .set({ role })
      .where('userId', '=', userId)
      .where('teamId', '=', teamId)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.eventUsersByEventId.clear(teamId);

    return updatedTeamMember;
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update a team member: Member does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { userId, teamId, role },
      });
    }

    throw new VisibleError('Failed to update a team member', {
      isExposable: true,
      cause: err,
      extraInput: { userId, teamId, role },
    });
  }
}
export async function findOne(teamId: string, userId: string) {
  logger.debug(`${logName} Selecting a team user relation`, { teamId, userId });

  try {
    return await SQL.DB.selectFrom(tableName)
      .selectAll()
      .where('teamId', '=', teamId)
      .where('userId', '=', userId)
      .executeTakeFirst();
  } catch (err) {
    throw new VisibleError('Failed to select team IDs for a user by user`s ID', {
      cause: err,
      isExposable: true,
      extraInput: { userId },
    });
  }
}

export async function findAllByTeamIds(teamIds: string[]) {
  logger.debug(`${logName} Selecting team users by team IDs`, { teamIds });

  const teamsMembers = await loaders.teamUsersByTeamId.loadMany(teamIds);
  // Throw on Errors
  if (teamsMembers.some(teamMembers => teamMembers instanceof Error)) {
    throw new VisibleError('Failed to select multiple members', {
      isExposable: true,
      serviceMessage: 'One or more list of team members are instances of Error',
      extraInput: { teamIds, failedMembers: teamsMembers.filter(teamMembers => teamMembers instanceof Error) },
    });
  }

  return teamsMembers.flat() as TeamUserShape[];
}

export async function findTeamIdsByUserId(userId: string) {
  logger.debug(`${logName} Selecting team IDs for a user by user's ID`, { userId });

  try {
    const result = await SQL.DB.selectFrom(tableName)
      .select('teamId')
      .where('userId', '=', userId)
      .distinct()
      .orderBy('teamId', 'asc')
      .execute();

    return result.map(entry => entry.teamId);
  } catch (err) {
    throw new VisibleError('Failed to select team IDs for a user by user`s ID', {
      cause: err,
      isExposable: true,
      extraInput: { userId },
    });
  }
}

// Find mutual teams (team IDs) for two users (user IDs)
export async function findMutualTeamIds(firstUserId: string, secondUserId: string) {
  logger.debug(`${logName} Selecting mutual team IDs for two user IDs`, { firstUserId, secondUserId });

  try {
    const result = await SQL.DB.selectFrom(tableName)
      .select('teamId')
      .where('userId', '=', firstUserId)
      .intersect(SQL.DB.selectFrom(tableName).select('teamId').where('userId', '=', secondUserId))
      .execute();

    return result.map(entry => entry.teamId);
  } catch (err) {
    throw new VisibleError('Failed to select mutual teams for users', {
      cause: err,
      isExposable: true,
      extraInput: { firstUserId, secondUserId },
    });
  }
}

export async function removeOne(teamId: string, userId: string) {
  logger.debug(`${logName} Removing a team_user relation`, { userId, teamId });

  try {
    const removedTeamUsers = await SQL.DB.deleteFrom(tableName)
      .where('userId', '=', userId)
      .where('teamId', '=', teamId)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.teamUsersByTeamId.clear(teamId);

    return removedTeamUsers;
  } catch (err) {
    throw new VisibleError('Failed to remove team_user relation', {
      isExposable: true,
      cause: err,
      extraInput: { userId, teamId },
    });
  }
}

// This function should be used only by loader
export async function loaderFindAllByTeamIds(ids: readonly string[]) {
  logger.debug(`${logName} Selecting multiple team users for loader by team IDs`, { ids });

  if (!ids.length) return [];

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('teamId', 'in', ids).orderBy('teamId', 'asc').execute();
  } catch (err) {
    throw new VisibleError('Failed to find team users by team ID', {
      cause: err,
      isExposable: true,
      extraInput: { ids },
    });
  }
}

export * as TeamUser from './team-user.js';
