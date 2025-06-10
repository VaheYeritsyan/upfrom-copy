import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType } from '#sql';

export type UserDeviceShape = SelectableType['user_device'];

type UserDeviceInsertable = InsertableType['user_device'];
export type UserDeviceDraft = Omit<UserDeviceInsertable, 'createdAt' | 'updatedAt'>;

export const tableName = 'user_device';

const logName = 'Repository User Device:';

export async function createOne(userDeviceDraft: UserDeviceDraft) {
  logger.debug(`${logName} Creating a new user device record`, { userDeviceDraft });

  try {
    const [userDevice] = await SQL.DB.insertInto(tableName).values(userDeviceDraft).returningAll().execute();
    return userDevice;
  } catch (err) {
    if (err instanceof Error) {
      if (err?.message?.includes('duplicate key value violates unique constraint')) {
        throw new VisibleError('Cannot create a user device record: The device ID is already added!', {
          cause: err,
          isExposable: false,
          extraInput: { userDeviceDraft },
        });
      }
    }
    throw new VisibleError('Failed to add a user device record!', {
      cause: err,
      isExposable: true,
      extraInput: { userDeviceDraft },
    });
  }
}

export async function findAllByUserId(userId: string) {
  logger.debug(`${logName} Selecting user device records`, { userId });

  try {
    return await SQL.DB.selectFrom(tableName).selectAll().where('userId', '=', userId).execute();
  } catch (err) {
    throw new VisibleError('Failed to find user device records', {
      cause: err,
      isExposable: true,
      extraInput: { userId },
    });
  }
}

export async function deleteOneIfExist(userId: string, deviceId: string) {
  logger.debug(`${logName} Deleting a user device record`, { deviceId, userId });

  try {
    return await SQL.DB.deleteFrom(tableName)
      .where('userId', '=', userId)
      .where('deviceId', '=', deviceId)
      .returningAll()
      .executeTakeFirst();
  } catch (err) {
    throw new VisibleError('Failed to delete a user device record!', {
      cause: err,
      isExposable: true,
      extraInput: { deviceId, userId },
    });
  }
}

export async function deleteAllByDeviceIds(deviceIds: string[]) {
  logger.debug(`${logName} Deleting multiple user device records`, { deviceIds });

  if (!deviceIds.length) return;

  try {
    return await SQL.DB.deleteFrom(tableName).where('deviceId', 'in', deviceIds).returningAll().execute();
  } catch (err) {
    throw new VisibleError('Failed to delete a user device record!', {
      cause: err,
      isExposable: true,
      extraInput: { deviceIds },
    });
  }
}

export * as UserDevice from './user-device.js';
