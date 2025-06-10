import { ulid } from 'ulid';

import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType, UpdateableType } from '#sql';
import { loaders } from '#dataloader';

export type TeamShape = SelectableType['team'];

type TeamInsertable = InsertableType['team'];
export type TeamDraft = Omit<TeamInsertable, 'createdAt' | 'updatedAt' | 'id'>;

export type TeamUpdateable = UpdateableType['team'];

export const tableName = 'team';

const logName = 'Repository Team:';

export async function create(teamDraft: TeamDraft) {
  logger.debug(`${logName} Creating a team`, { teamDraft });

  const id = ulid();

  try {
    const [team] = await SQL.DB.insertInto(tableName)
      .values({ ...teamDraft, id })
      .returningAll()
      .execute();

    loaders.teams.prime(team.id, team);

    return team;
  } catch (err) {
    throw new VisibleError('Failed to create a new team', { isExposable: true, cause: err, extraInput: { teamDraft } });
  }
}

export async function updateAsAdmin(id: string, args: TeamUpdateable) {
  logger.debug(`${logName} Updating a team as Admin`, { id, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update a team as Admin: Update arguments are not provided', {
      isExposable: true,
      extraInput: { id, args },
    });
  }

  try {
    const event = await SQL.DB.updateTable(tableName)
      .set(args)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.teams.clear(event.id).prime(event.id, event);

    return event;
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update a team as Admin: Team does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id, args },
      });
    }

    throw new VisibleError('Failed to update a team as Admin', {
      isExposable: true,
      cause: err,
      extraInput: { id, args },
    });
  }
}

export async function findOneById(teamId: string) {
  logger.debug(`${logName} Selecting a team`, { teamId });
  return loaders.teams.load(teamId);
}

export async function findOneByIdOrThrow(teamId: string) {
  const team = await findOneById(teamId);

  if (!team) {
    throw new VisibleError('Failed to find team: Team does not exist', {
      isExposable: true,
      extraInput: { teamId },
    });
  }

  return team;
}

export async function findAllByIds(teamIds: string[]) {
  logger.debug(`${logName} Selecting multiple teams`, { teamIds });

  if (!teamIds?.length) return [];

  const teams = await loaders.teams.loadMany(teamIds);
  // Throw nulls and Errors
  if (teams.some(team => team == null || team instanceof Error)) {
    throw new VisibleError('Failed to select multiple teams', {
      isExposable: true,
      serviceMessage: 'One or more teams are missing or are instances of Error',
      extraInput: { teamIds, failedTeams: teams.filter(team => team == null || team instanceof Error) },
    });
  }

  return teams as TeamShape[];
}

export async function findAllByOrganizationId(orgId: string) {
  logger.debug(`${logName} Selecting multiple teams by organization ID`, { orgId });

  try {
    const teams = await SQL.DB.selectFrom(tableName).selectAll().where('organizationId', '=', orgId).execute();

    teams.forEach(team => loaders.teams.prime(team.id, team));

    return teams;
  } catch (err) {
    throw new VisibleError('Failed to select multiple teams by organization ID', {
      isExposable: false,
      cause: err,
      extraInput: { orgId },
    });
  }
}

export async function getAll() {
  logger.debug(`${logName} Selecting all teams`);

  try {
    const teams = await SQL.DB.selectFrom(tableName).selectAll().execute();

    teams.forEach(team => loaders.teams.prime(team.id, team));

    return teams;
  } catch (err) {
    throw new VisibleError('Failed to select all teams', { isExposable: true, cause: err });
  }
}

export async function getTotalAmount() {
  logger.debug(`${logName} Selecting total amount of teams`);

  const { countAll } = SQL.DB.fn;
  try {
    const result = await SQL.DB.selectFrom(tableName).select(countAll().as('total')).executeTakeFirstOrThrow();
    if (typeof result.total === 'number') return result.total;

    throw new VisibleError(`Failed to get number from result.total! Its type "${typeof result.total}"!`, {
      isExposable: false,
      extraInput: { result, totalType: typeof result.total },
    });
  } catch (err) {
    throw new VisibleError('Failed to count total amount of teams', { isExposable: true, cause: err });
  }
}

// This function should be used only by loader
export async function loaderFindAllByIds(ids: readonly string[]) {
  logger.debug(`${logName} Selecting multiple teams for loader by IDs`, { ids });

  if (!ids.length) return [];

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('id', 'in', ids).orderBy('team.id', 'asc').execute();
  } catch (err) {
    throw new VisibleError('Failed to find teams by ID', { cause: err, isExposable: true, extraInput: { ids } });
  }
}

export * as Team from './team.js';
