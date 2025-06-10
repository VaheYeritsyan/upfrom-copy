import { Chat } from '@up-from/core/chat';
import { TeamUser, User } from '@up-from/repository';
import { EventBus } from '@up-from/services';
import { VisibleError, logger } from '@up-from/util';

export { TeamUserRole, TeamUserShape } from '@up-from/repository/team-user';

const logName = 'Core Admin: Team User:';

export async function add(teamId: string, userId: string, role: TeamUser.TeamUserRole) {
  logger.debug(`${logName} Adding a new team member`, { teamId, userId, role });

  let teamUser;
  try {
    const teamUserDraft = { userId, teamId, role };
    teamUser = await TeamUser.create(teamUserDraft);
  } catch (err) {
    throw new VisibleError('Failed to add a team member', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, userId, role },
    });
  }

  const user = await User.findOneByIdOrThrow(userId);

  if (user?.isSignupCompleted) {
    try {
      await Chat.addUserToTeamChannel(user, [teamId]);
    } catch (err) {
      new VisibleError('Failed to add team member to team chat channel!', {
        cause: err,
        extraInput: { user, teamId },
      });
    }

    try {
      await EventBus.publishOnTeamNewMemberAdded(user.id, [teamId]);
    } catch (err) {
      // No rethrowing (just log the error)
      new VisibleError('Failed to publish bus event on new team member!', {
        cause: err,
        extraInput: { userId, teamId },
      });
    }
  }

  return teamUser;
}

export async function updateRole(teamId: string, userId: string, role: TeamUser.TeamUserRole) {
  logger.debug(`${logName} Updating team member role`, { teamId, userId, role });

  try {
    return await TeamUser.updateOne(teamId, userId, role);
  } catch (err) {
    throw new VisibleError('Failed to update team member role', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, userId, role },
    });
  }
}

export async function remove(teamId: string, userId: string) {
  logger.debug(`${logName} Removing a team member`, { teamId, userId });

  let teamUser;
  try {
    teamUser = await TeamUser.removeOne(teamId, userId);
  } catch (err) {
    throw new VisibleError('Failed to remove a team member', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, userId },
    });
  }

  const user = await User.findOneByIdOrThrow(userId);

  if (user?.isSignupCompleted) {
    try {
      await Chat.removeUserFromTeamChannel(user, teamId);
    } catch (err) {
      new VisibleError('Failed to remove a team member from a team chat channel!', {
        cause: err,
        extraInput: { user, teamId },
      });
    }
  }

  return teamUser;
}

export async function findMembers(teamIds: string[]) {
  logger.debug(`${logName} Getting team members by team IDs`, { teamIds });

  if (!teamIds.length) return [];

  try {
    return await TeamUser.findAllByTeamIds(teamIds);
  } catch (err) {
    throw new VisibleError('Failed to get team members', {
      isExposable: true,
      cause: err,
      extraInput: { teamIds },
    });
  }
}

export * as TeamUser from './team-user.js';
