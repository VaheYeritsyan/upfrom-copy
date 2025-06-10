import { Team, User, TeamUser } from '@up-from/repository';
import { VisibleError, logger } from '@up-from/util';
import { getValidUser } from '@up-from/core/user';

export { TeamShape } from '@up-from/repository/team';

const logName = 'Core Team:';

export async function findTeamsByUserId(userId: string) {
  logger.debug(`${logName} Getting a list of teams for a user`, { userId });

  try {
    const user = await User.findOneByIdOrThrow(userId);

    const teamIds = await TeamUser.findTeamIdsByUserId(user.id);

    return await Team.findAllByIds(teamIds);
  } catch (err) {
    throw new VisibleError('Failed to get a list of teams for a user', {
      isExposable: true,
      cause: err,
      extraInput: { userId },
    });
  }
}

// Find mutual teams for two users
export async function findMutualTeamsByUserId(lookupUserId: string, requesterUserId: string) {
  logger.debug(`${logName} Getting mutual teams for two users`, { lookupUserId, requesterUserId });

  try {
    const lookupUser = await User.findOneByIdOrThrow(lookupUserId);
    const requesterUser = await User.findOneByIdOrThrow(requesterUserId);

    const teamIds = await TeamUser.findMutualTeamIds(lookupUser.id, requesterUser.id);

    return await Team.findAllByIds(teamIds);
  } catch (err) {
    throw new VisibleError('Failed to get mutual teams for two users', {
      isExposable: true,
      cause: err,
      extraInput: { lookupUserId, requesterUserId },
    });
  }
}

export async function getValidTeam(teamId: string) {
  logger.debug(`${logName} Getting a valid team`, { teamId });

  const team = await Team.findOneByIdOrThrow(teamId);
  if (team.isDisabled) {
    throw new VisibleError('The team is disabled', {
      isExposable: true,
      extraInput: { teamId },
    });
  }

  return team;
}

export async function getValidTeamForUser(teamId: string, userId: string) {
  logger.debug(`${logName} Getting a valid team for a user`, { teamId, userId });

  const user = await getValidUser(userId);
  const teamUser = await TeamUser.findOne(teamId, user.id);
  if (!teamUser) {
    throw new VisibleError('User is not allowed to perform this action', {
      isExposable: true,
      serviceMessage: `User is not allowed to get team info. User is not a member of this team.`,
      extraInput: { userId, teamId },
    });
  }

  return await getValidTeam(teamId);
}

export async function findUserTeamsByOrgId(userId: string, orgId: string) {
  logger.debug(`${logName} Getting teams for a user by organization ID`, { orgId, userId });

  try {
    const user = await getValidUser(userId);
    const userTeamIds = await TeamUser.findTeamIdsByUserId(user.id);
    const orgTeams = await Team.findAllByOrganizationId(orgId);

    return orgTeams.filter(team => userTeamIds.includes(team.id) && !team.isDisabled);
  } catch (err) {
    throw new VisibleError('Failed to get teams for a user by organization ID', {
      isExposable: true,
      cause: err,
      extraInput: { orgId, userId },
    });
  }
}

export async function getTotalAmount() {
  logger.debug(`${logName} Getting total amount`);
  return await Team.getTotalAmount();
}

export * as Team from './team.js';
