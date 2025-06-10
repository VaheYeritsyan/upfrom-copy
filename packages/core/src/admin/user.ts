import { User, Team, TeamUser, FileStorage, UserNotificationPref } from '@up-from/repository';
import { sendNotificationEmail } from '@up-from/services/email';
import { VisibleError, logger } from '@up-from/util';

import { Chat } from '@up-from/core/chat';

export { UserShape } from '@up-from/repository/user';

const logName = 'Core Admin: User:';

export async function findOneById(userId: string) {
  logger.debug(`${logName} Getting a user`, { userId });
  return User.findOneById(userId);
}

export async function findOneByIdOrThrow(userId: string) {
  logger.debug(`${logName} Getting a user`, { userId });
  return User.findOneByIdOrThrow(userId);
}

export async function getAll() {
  logger.debug(`${logName} Getting all users`);
  return User.getAll();
}

export async function findAllById(userIds: string[]) {
  logger.debug(`${logName} Getting multiple users`, { userIds });
  if (!userIds.length) return [];

  return User.findAllByIdOrThrow(userIds);
}

export async function findAllByOrganizationId(organizationId: string) {
  logger.debug(`${logName} Getting all users in organization`, { organizationId });

  const teams = await Team.findAllByOrganizationId(organizationId);
  const teamIds = teams.map(({ id }) => id);
  const teamUsers = await TeamUser.findAllByTeamIds(teamIds);
  const userIds = teamUsers.map(({ userId }) => userId);
  return User.findAllByIdOrThrow(userIds);
}

export async function disable(userId: string) {
  logger.debug(`${logName} Disabling a user account`, { userId });

  const user = await User.findOneByIdOrThrow(userId);
  if (user.isDisabled) {
    throw new VisibleError('Failed to disable a user: User is already disabled', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  await Chat.deactivateUser(user.id);

  return await User.updateAsAdminOrThrow(user.id, { isDisabled: true });
}

export async function enable(userId: string) {
  logger.debug(`${logName} Enabling user account`, { userId });

  const user = await User.findOneByIdOrThrow(userId);
  if (!user.isDisabled) {
    throw new VisibleError('Failed to enable a user: User is already enabled', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  await Chat.reactivateUser(user.id);

  return await User.updateAsAdminOrThrow(user.id, { isDisabled: false });
}

export async function create(userDraft: User.UserDraft) {
  logger.debug(`${logName} Creating a new user account`, { userDraft });

  const user = await User.createWithAccount(userDraft);
  await UserNotificationPref.create(user.id, UserNotificationPref.disabledPreferences);
  return user;
}

export async function update(userId: string, args: User.UserUpdateable) {
  logger.debug(`${logName} Updating a user account`, { userId, args });

  const user = await User.findOneByIdOrThrow(userId);
  if (
    user.isSignupCompleted &&
    ((args.firstName !== undefined && args.firstName !== user.firstName) ||
      (args.lastName !== undefined && args.lastName !== user.lastName))
  ) {
    await Chat.updateUser({ ...user, ...args });
  }
  return User.updateAsAdminOrThrow(user.id, args);
}

export async function generateAvatarUploadUrl(userId: string) {
  logger.debug(`${logName} Generating avatar image upload url`, { userId });

  const user = await User.findOneByIdOrThrow(userId);

  return FileStorage.generateAvatarUploadUrl(user.id);
}

export async function completeAvatarUpload(userId: string) {
  logger.debug(`${logName} Completing avatar upload`, { userId });

  const user = await User.findOneByIdOrThrow(userId);

  const avatarUrl = await FileStorage.completeAvatarUpload(user.id);
  if (user.isSignupCompleted) {
    await Chat.updateUser({ ...user, avatarUrl });
  }

  return User.update(user.id, { avatarUrl });
}

export async function removeAvatar(userId: string) {
  logger.debug(`${logName} Removing avatar`, { userId });

  const user = await User.findOneByIdOrThrow(userId);
  if (!user.avatarUrl) {
    throw new VisibleError('Failed to remove avatar: Avatar does not exist', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  try {
    await FileStorage.removeAvatar(user.avatarUrl, userId);
  } catch (err) {
    logger.warn(`${logName} Removing avatar: Failed to remove avatar image from S3 bucket.`, {
      userId,
      url: user.avatarUrl,
      cause: err,
    });
  }

  return await User.update(userId, { avatarUrl: null });
}

export async function sendInvitationEmail(userId: string) {
  logger.debug(`${logName} Sending an invitation email to a user`, { userId });

  const user = await User.findOneByIdOrThrow(userId);

  if (user.isSignupCompleted) {
    throw new VisibleError('Failed to send an invitations email: User has already completed signup process', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  const message =
    "You've been invited to the UpFrom! Please install the application and log in to complete your registration.";
  try {
    await sendNotificationEmail(user.email, message);
  } catch (err) {
    throw new VisibleError('Failed to send an invitations email', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  return user;
}

export * as User from './user.js';
