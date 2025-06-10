import { User, Team, TeamUser, FileStorage } from '@up-from/repository';
import { VisibleError, logger } from '@up-from/util';

import { Chat } from '@up-from/core/chat';

export { TeamShape } from '@up-from/repository/team';

const logName = 'Core Admin: Team:';

const defaultImageUrl =
  'https://prod-up-from-storage-avatarimagesbucket10310826-13i9gxe5pny5v.s3.amazonaws.com/default_image.png';

export async function findOneById(teamId: string) {
  logger.debug(`${logName} Getting a team`, { teamId });
  return Team.findOneById(teamId);
}

export async function getAll() {
  logger.debug(`${logName} Getting all teams`);
  return Team.getAll();
}

export async function findUserTeams(userId: string) {
  logger.debug(`${logName} Find user teams`, { userId });

  const user = await User.findOneByIdOrThrow(userId);
  const teamIds = await TeamUser.findTeamIdsByUserId(user.id);

  return await Team.findAllByIds(teamIds);
}

export async function findOrganizationTeams(orgId: string) {
  logger.debug(`${logName} Find organization teams`, { orgId });

  const teams = await Team.findAllByOrganizationId(orgId);
  const teamIds = teams.map(team => team.id);

  return await Team.findAllByIds(teamIds);
}

export async function create(teamDraft: Team.TeamDraft) {
  logger.debug(`${logName} Creating a new team`, { teamDraft });

  try {
    const team = await Team.create(teamDraft);
    await Chat.createTeamChannel(team.id, team.name, team?.imageUrl);
    return team;
  } catch (err) {
    throw new VisibleError('Failed to create a new team', { isExposable: true, cause: err, extraInput: { teamDraft } });
  }
}

export async function update(teamId: string, args: Team.TeamUpdateable) {
  logger.debug(`${logName} Updating a team`, { teamId, args });

  if (args.name || args.imageUrl) {
    await Chat.updateTeamChannel(teamId, { name: args.name, image: args.imageUrl });
  }

  return Team.updateAsAdmin(teamId, args);
}

export async function disable(teamId: string) {
  logger.debug(`${logName} Disabling a team`, { teamId });

  const team = await Team.findOneByIdOrThrow(teamId);
  if (team.isDisabled) {
    throw new VisibleError('Failed to disable a team: The team is already disabled', {
      isExposable: true,
      extraInput: { teamId },
    });
  }

  return await Team.updateAsAdmin(teamId, { isDisabled: true });
}

export async function enable(teamId: string) {
  logger.debug(`${logName} Enabling a team`, { teamId });

  const team = await Team.findOneByIdOrThrow(teamId);
  if (!team.isDisabled) {
    throw new VisibleError('Failed to enable a team: Team is already enabled', {
      isExposable: true,
      extraInput: { teamId },
    });
  }

  return await Team.updateAsAdmin(teamId, { isDisabled: false });
}

export async function generateImageUploadUrl(teamId: string) {
  logger.debug(`${logName} Generating team image upload url`, { teamId });

  const team = await Team.findOneByIdOrThrow(teamId);

  return FileStorage.generateImageUploadUrl(team.id, 'team');
}

export async function completeImageUpload(teamId: string) {
  logger.debug(`${logName} Completing team image upload`, { teamId });

  const team = await Team.findOneByIdOrThrow(teamId);
  const imageUrl = await FileStorage.completeImageUpload(team.id, 'team');
  await Chat.updateTeamChannel(team.id, { image: imageUrl });
  return Team.updateAsAdmin(team.id, { imageUrl });
}

export async function removeImage(teamId: string) {
  logger.debug(`${logName} Removing team image`, { teamId });

  const team = await Team.findOneByIdOrThrow(teamId);
  if (!team.imageUrl) {
    throw new VisibleError('Failed to remove team image: Image does not exist', {
      isExposable: true,
      extraInput: { teamId },
    });
  }

  if (team.imageUrl === defaultImageUrl) {
    throw new VisibleError('Failed to remove team image: Cannot remove default image', {
      isExposable: true,
      extraInput: { teamId, imageUrl: team.imageUrl },
    });
  }

  try {
    await FileStorage.removeImage(team.imageUrl, teamId, 'team');
  } catch (err) {
    logger.warn(`${logName} Removing team image: Failed to remove team image from S3 bucket.`, {
      teamId,
      url: team.imageUrl,
      cause: err,
    });
  }

  return await Team.updateAsAdmin(teamId, { imageUrl: defaultImageUrl });
}

export * as Team from './team.js';
