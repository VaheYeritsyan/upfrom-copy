import { Chat } from '@up-from/services/chat';
import { User } from '@up-from/repository/user';
import { UserDevice } from '@up-from/repository/user-device';
import { logger, VisibleError } from '@up-from/util';

const logName = 'Core Chat:';

export type ChatUserProfile = {
  id: string;
  name: string;
  image?: string;
};

export function createUserToken(userId: string) {
  return Chat.createUserToken(userId);
}

export async function createTeamChannel(teamId: string, teamName: string, imageUrl?: string | null) {
  logger.debug(`${logName} Creating a team channel`, { teamId, teamName, imageUrl });
  return Chat.createTeamChannel(teamId, teamName, imageUrl);
}

export function updateTeamChannel(teamId: string, params: Chat.UserUpdateParams) {
  logger.debug(`${logName} Creating a team channel`, { teamId, params });
  return Chat.updateTeamChannel(teamId, params);
}

export async function createNewUser(user: User.UserShape) {
  logger.debug(`${logName} Creating a new chat user`, { user });

  const chatUserProfile = getChatUserProfile(user);
  await Chat.createUser(chatUserProfile);
  return chatUserProfile;
}

export async function addUserToTeamChannel(user: User.UserShape, teamIds: string[]) {
  logger.debug(`${logName} Add chat user to multiple team channels`, { user, teamIds });

  const jobs = teamIds.map(teamId => Chat.addTeamChannelMember(user.id, teamId));
  const jobResults = await Promise.allSettled(jobs);
  jobResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.warn(`${logName} Failed to add a chat user to a team channel!`, {
        userId: user.id,
        teamId: teamIds[index],
        result,
      });
    }
  });

  return getChatUserProfile(user);
}

export async function removeUserFromTeamChannel(user: User.UserShape, teamId: string) {
  logger.debug(`${logName} Remove a chat user from a team channel`, { user, teamId });

  try {
    await Chat.removeMemberFromTeamChannel(user.id, teamId);
  } catch (err) {
    logger.warn(`${logName} Failed to remove a chat user from a team channel!`, {
      userId: user.id,
      teamId,
    });
  }

  return getChatUserProfile(user);
}

export function getChatUserProfile(
  user: Pick<User.UserShape, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>,
): ChatUserProfile {
  logger.debug(`${logName} Getting chat user profile`, { user });

  const { id, firstName, lastName, avatarUrl } = user;
  return {
    id,
    name: `${firstName || ''} ${lastName || ''}`.trim(),
    image: avatarUrl || undefined,
  };
}

export function updateUser(user: Pick<User.UserShape, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>) {
  logger.debug(`${logName} Updating chat user profile`, { user });

  const { name, image } = getChatUserProfile(user);
  return Chat.updateUser(user.id, { name, image });
}

export async function deactivateUser(userId: string) {
  logger.debug(`${logName} Deactivating a Stream Chat user`, { userId });

  const user = await User.findOneByIdOrThrow(userId);
  if (!user.isSignupCompleted) {
    throw new VisibleError('Failed to deactivate a chat user: User has not completed signup process', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  try {
    await disablePushNotifications(userId);
  } catch (err) {
    throw new VisibleError('Failed to deactivate a chat user: Failed to disable chat push notifications', {
      isExposable: true,
      cause: err,
      extraInput: { userId },
    });
  }

  return Chat.deactivateUser(user.id);
}

export async function reactivateUser(userId: string) {
  logger.debug(`${logName} Reactivating a Stream Chat user`, { userId });

  const user = await User.findOneByIdOrThrow(userId);
  if (!user.isSignupCompleted) {
    throw new VisibleError('Failed to reactivate a chat user: User has not completed signup process', {
      isExposable: true,
      extraInput: { userId },
    });
  }

  const reactivateResponse = await Chat.reactivateUser(user.id);

  try {
    await enablePushNotifications(userId);
  } catch (err) {
    throw new VisibleError('Failed to reactivate a chat user: Failed to enable chat push notifications', {
      isExposable: true,
      cause: err,
      extraInput: { userId },
    });
  }

  return reactivateResponse;
}

export async function enablePushNotifications(userId: string) {
  logger.debug(`${logName} Enabling Chat push notifications for a Stream Chat user`, { userId });

  const userDevices = await UserDevice.findAllByUserId(userId);
  const deviceIds = userDevices.map(device => device.deviceId);
  if (!deviceIds.length) {
    logger.info(`${logName} User has no registered devices in DB`);
    return;
  }

  const jobs = deviceIds.map(deviceId => {
    return Chat.addPushDeviceId(userId, deviceId);
  });

  const results = await Promise.allSettled(jobs);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.warn(`${logName} Failed to add a device ID for push notification in Stream Chat!`, {
        userId,
        deviceId: deviceIds[index],
        result,
      });
    }
  });
}

export async function disablePushNotifications(userId: string) {
  logger.debug(`${logName} Disabling Chat push notifications for a Stream Chat user`, { userId });

  const deviceIds = await Chat.getPushDeviceIds(userId);
  if (!deviceIds.length) {
    logger.info(`${logName} User has no registered devices in Stream Chat`);
    return;
  }

  const jobs = deviceIds.map(deviceId => {
    return Chat.removePushDeviceId(userId, deviceId);
  });

  const results = await Promise.allSettled(jobs);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.warn(`${logName} Failed to remove a device ID for push notification in Stream Chat!`, {
        userId,
        deviceId: deviceIds[index],
        result,
      });
    }
  });
}

export async function disablePushNotificationsForDevice(userId: string, deviceId: string) {
  logger.debug(`${logName} Disabling Chat push notifications for a single device`, { userId, deviceId });

  const deviceIds = await Chat.getPushDeviceIds(userId);
  if (!deviceIds.length) {
    logger.info(`${logName} User has no registered devices in Stream Chat`);
    return;
  }

  if (!deviceIds.includes(deviceId)) {
    logger.info(`${logName} Current device ID is not registered in Stream Chat`);
    return;
  }

  try {
    await Chat.removePushDeviceId(userId, deviceId);
  } catch (err) {
    logger.warn(`${logName} Failed to remove a device ID for push notification in Stream Chat!`, {
      cause: err,
      userId,
      deviceId,
    });
  }
}

export async function enablePushNotificationsForDevice(userId: string, deviceId: string) {
  logger.debug(`${logName} Enabling Chat push notifications for a single device`, { userId, deviceId });

  const deviceIds = await Chat.getPushDeviceIds(userId);
  if (deviceIds.includes(deviceId)) {
    logger.info(`${logName} Current device ID is already registered in Stream Chat`);
    return;
  }

  try {
    await Chat.addPushDeviceId(userId, deviceId);
  } catch (err) {
    logger.warn(`${logName} Failed to remove a device ID for push notification in Stream Chat!`, {
      cause: err,
      userId,
      deviceId,
    });
  }
}

export * as Chat from './chat.js';
