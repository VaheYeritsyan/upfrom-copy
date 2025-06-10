import { User, UserDevice, UserNotificationPref } from '@up-from/repository';
import { VisibleError, logger } from '@up-from/util';

import { Chat } from '@up-from/core/chat';

export { UserDeviceShape } from '@up-from/repository/user-device';

const logName = 'Core User Device:';

export async function create(userDevice: UserDevice.UserDeviceDraft) {
  logger.debug(`${logName} Adding user device ID`, { userDevice });

  const user = await User.findOneByIdOrThrow(userDevice.userId);
  if (user.isDisabled) {
    throw new VisibleError('User is not allowed to perform this action', {
      isExposable: true,
      serviceMessage: `User account is disabled`,
      extraInput: { user },
    });
  }

  const { pushChatNewMessage } = await UserNotificationPref.findOneByUserIdOrThrow(user.id);
  if (pushChatNewMessage) {
    await Chat.enablePushNotificationsForDevice(userDevice.userId, userDevice.deviceId);
  }

  return await UserDevice.createOne(userDevice);
}

export async function removeOne(userId: string, deviceId: string) {
  logger.debug(`${logName} Removing user device ID`, { userId, deviceId });

  await User.findOneByIdOrThrow(userId);

  await Chat.disablePushNotificationsForDevice(userId, deviceId);

  return await UserDevice.deleteOneIfExist(userId, deviceId);
}

export async function removeMany(deviceIds: string[]) {
  logger.debug(`${logName} Removing multiple user device IDs`, { deviceIds });

  const userDevices = await UserDevice.deleteAllByDeviceIds(deviceIds);
  if (!userDevices?.length) {
    console.warn(`${logName} User device(s) not found`, { deviceIds });
    return userDevices;
  }

  for (const userDevice of userDevices) {
    const { userId, deviceId } = userDevice;
    await Chat.disablePushNotificationsForDevice(userId, deviceId);
  }

  return userDevices;
}

export * as UserDevice from './user-device.js';
