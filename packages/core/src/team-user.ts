import { TeamUser, User } from '@up-from/repository';
import { VisibleError, logger } from '@up-from/util';

export { TeamUserRole, TeamUserShape } from '@up-from/repository/team-user';

const logName = 'Core Team User:';

export async function add(teamId: string, userId: string, role: TeamUser.TeamUserRole) {
  logger.debug(`${logName} Adding a new team member`, { teamId, userId, role });

  try {
    const teamUserDraft = { userId, teamId, role };
    return await TeamUser.create(teamUserDraft);
  } catch (err) {
    throw new VisibleError('Failed to add a team member', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, userId, role },
    });
  }
}

export async function findValidMembers(teamIds: string[]) {
  logger.debug(`${logName} Getting valid team members by team IDs`, { teamIds });

  if (!teamIds.length) return [];

  let teamUsers;
  try {
    teamUsers = await TeamUser.findAllByTeamIds(teamIds);
  } catch (err) {
    throw new VisibleError('Failed to get team members', {
      isExposable: true,
      cause: err,
      extraInput: { teamIds },
    });
  }

  // Exclude disabled users and those who hasn't completed signing up process yet
  const teamUserIds = teamUsers.map(teamUser => teamUser.userId);
  let users;
  try {
    users = await User.findAllByIdOrThrow(teamUserIds);
  } catch (err) {
    throw new VisibleError('Failed to get team members', {
      isExposable: true,
      cause: err,
      extraInput: { teamIds, teamUserIds },
    });
  }

  const invalidUsers = users.filter(user => user.isDisabled || !user.isSignupCompleted);
  if (!invalidUsers.length) return teamUsers;

  const invalidUserIds = invalidUsers.map(user => user.id);
  return teamUsers.filter(teamUser => !invalidUserIds.includes(teamUser.userId));
}

export async function findOne(teamId: string, userId: string) {
  logger.debug(`${logName} Getting one team member`, { teamId, userId });

  try {
    return await TeamUser.findOne(teamId, userId);
  } catch (err) {
    throw new VisibleError('Failed to get a team member', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, userId },
    });
  }
}

export * as TeamUser from './team-user.js';
