import { User, UserNotificationPref, FileStorage, TeamUser } from '@up-from/repository';
import { Email, SMS, EventBus } from '@up-from/services';
import { VisibleError, logger } from '@up-from/util';

import { Chat } from '@up-from/core';

export { UserShape } from '@up-from/repository/user';
export { UserNotificationPrefShape } from '@up-from/repository/user-notification-preferences';

const logName = 'Core User:';

// Validate user's ability to perform any actions
export function validateUser(user: User.UserShape, isIncompleteSignupAllowed = false) {
  if (!user.isDisabled && user.isSignupCompleted) return user;

  if (!user.isDisabled && isIncompleteSignupAllowed) return user;

  throw new VisibleError('User is not allowed to perform this action', {
    isExposable: true,
    serviceMessage: `User is disabled or hasn't completed signup process`,
    extraInput: { user },
  });
}

export async function getValidUser(userId: string, isIncompleteSignupAllowed = false) {
  const user = await User.findOneByIdOrThrow(userId);
  return validateUser(user, isIncompleteSignupAllowed);
}

export async function create(userDraft: User.UserDraft) {
  logger.debug(`${logName} Creating a new user account`, { userDraft });

  const user = await User.createWithAccount(userDraft);
  await UserNotificationPref.create(user.id, UserNotificationPref.disabledPreferences);
  return user;
}

export async function findOne(args: User.UserUniqueFindArgs) {
  return await User.findOne(args);
}

export async function findOneById(userId: string) {
  return await User.findOneById(userId);
}

export async function update(userId: string, args: User.UserUpdateArgs) {
  logger.debug(`${logName} Updating a user account`, { userId, args });

  const user = await User.findOneByIdOrThrow(userId);
  if (
    user.isSignupCompleted &&
    ((args.firstName !== undefined && args.firstName !== user.firstName) ||
      (args.lastName !== undefined && args.lastName !== user.lastName))
  ) {
    await Chat.updateUser({ ...user, ...args });
  }

  return await User.update(user.id, args);
}

export async function completeSignUp(userId: string, args: User.UserUpdateArgs) {
  logger.debug(`${logName} Completing signup`, { userId, args });

  const user = await User.update(userId, { ...args, isSignupCompleted: true });

  await updateUserNotificationPreferences(userId, UserNotificationPref.defaultPreferences);

  const teams = await TeamUser.findTeamIdsByUserId(user.id);

  try {
    await Chat.createNewUser(user);
    await Chat.addUserToTeamChannel(user, teams);
  } catch (err) {
    new VisibleError('Failed to complete chat registration!', {
      cause: err,
      extraInput: { user, teams },
    });
  }

  if (teams.length) {
    try {
      await EventBus.publishOnTeamNewMemberAdded(user.id, teams);
    } catch (err) {
      // No rethrowing (just log the error)
      new VisibleError('Failed to publish bus event on new team member!', {
        cause: err,
        extraInput: { userId, teams },
      });
    }
  }

  return user;
}

export async function generateAvatarUploadUrl(userId: string) {
  logger.debug(`${logName} Generating avatar image upload url`, { userId });

  const user = await getValidUser(userId, true);

  return FileStorage.generateAvatarUploadUrl(user.id);
}

export async function removeAvatar(userId: string) {
  logger.debug(`${logName} Removing avatar`, { id: userId });

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

export async function completeAvatarUpload(userId: string) {
  logger.debug(`${logName} Completing avatar upload`, { userId });

  const user = await getValidUser(userId, true);

  const avatarUrl = await FileStorage.completeAvatarUpload(user.id);
  if (user.isSignupCompleted) await Chat.updateUser({ ...user, avatarUrl });
  return User.update(user.id, { avatarUrl });
}

export async function sendVerificationLinkEmail(recipient: string, link: string) {
  return Email.sendVerificationLinkEmail(recipient, link);
}

export async function sendVerificationCodeEmail(recipient: string, link: string) {
  return Email.sendVerificationCodeEmail(recipient, link);
}

export async function sendVerificationSms(phone: string, message: string) {
  return SMS.send(phone, message);
}

// User notification preferences
export async function findUserNotificationPreferences(userId: string) {
  logger.debug(`${logName} Getting user notification preferences`, { userId });
  return await UserNotificationPref.findOneByUserIdOrThrow(userId);
}

export async function updateUserNotificationPreferences(
  userId: string,
  newPrefs: UserNotificationPref.UserNotificationPrefUpdateArgs,
) {
  logger.debug(`${logName} Updating user notification preferences`, { userId, pref: newPrefs });

  const user = await getValidUser(userId, true);

  // Enable/disable chat push notifications when pushChatNewMessage preference has changed
  const currentPrefs = await UserNotificationPref.findOneByUserId(user.id);
  if (
    currentPrefs &&
    newPrefs.pushChatNewMessage != null &&
    currentPrefs.pushChatNewMessage != newPrefs.pushChatNewMessage
  ) {
    if (newPrefs.pushChatNewMessage) {
      await Chat.enablePushNotifications(userId);
    } else {
      await Chat.disablePushNotifications(userId);
    }
  }

  await UserNotificationPref.update(user.id, newPrefs);

  return user;
}

export * as User from './user.js';
