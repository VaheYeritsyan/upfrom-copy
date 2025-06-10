import { Team, Organization, User, TeamUser } from '@up-from/repository';
import { VisibleError, logger } from '@up-from/util';
import { getValidUser } from '@up-from/core/user';

export { OrganizationShape } from '@up-from/repository/organization';

const logName = 'Core Organization:';

export async function findAllUserOrganizations(userId: string) {
  logger.debug(`${logName} Getting a list of organizations for a user`, { userId });

  try {
    const user = await User.findOneByIdOrThrow(userId);

    const teamIds = await TeamUser.findTeamIdsByUserId(user.id);
    const teams = await Team.findAllByIds(teamIds);

    const uniqueOrgIds = [...new Set(teams.map(team => team.organizationId))];
    return await Organization.findAllByIds(uniqueOrgIds);
  } catch (err) {
    throw new VisibleError('Failed to get a list of organizations for a user', {
      isExposable: true,
      cause: err,
      extraInput: { userId },
    });
  }
}

export async function getOneOrganizationForUser(organizationId: string, userId: string) {
  logger.debug(`${logName} Getting a single organization for a user`, { organizationId, userId });

  const user = await getValidUser(userId, true);
  const teamIds = await TeamUser.findTeamIdsByUserId(user.id);
  const teams = await Team.findAllByIds(teamIds);

  if (!teams.some(team => team.organizationId === organizationId)) {
    throw new VisibleError('User is not allowed to perform this action', {
      isExposable: true,
      serviceMessage: `User is not allowed to get organization info. User is not a member of any team of this organization.`,
      extraInput: { userId, organizationId },
    });
  }

  return await Organization.findOneByIdOrThrow(organizationId);
}

export * as Organization from './organization.js';
