import { Config } from 'sst/node/config';
import { StreamChat } from 'stream-chat';

import { VisibleError, logger } from '@up-from/util';

export type ChatUserDraft = {
  id: string;
  name: string;
  image?: string;
};

export type UserUpdateParams = {
  name?: string;
  image?: string;
};

export type ChannelUpdateParams = {
  name?: string;
  image?: string;
};

const logName = 'Service Chat:';
const defaultPushProvider = 'firebase';
const defaultPushProviderName = 'upFromDevPush';

function getInstance() {
  const { STREAM_APP_KEY: appKey, STREAM_APP_SECRET: appSecret } = Config;
  return StreamChat.getInstance(appKey, appSecret);
}

export function createUserToken(userId: string) {
  return getInstance().createToken(userId);
}

export async function createUser(userDraft: ChatUserDraft) {
  logger.debug(`${logName} Creating a user`, { userDraft });

  const client = getInstance();
  try {
    return await client.upsertUser({ ...userDraft, role: 'user' });
  } catch (err) {
    throw new VisibleError('Failed to create a chat user!', {
      isExposable: true,
      cause: err,
      extraInput: { userDraft },
    });
  }
}

export async function updateUser(userId: string, updateParams: UserUpdateParams) {
  logger.debug(`${logName} Updating a chat user`, { userId, updateParams });

  const client = getInstance();
  try {
    await client.partialUpdateUser({
      id: userId,
      set: updateParams,
    });
  } catch (err) {
    throw new VisibleError('Failed to update chat user!', {
      isExposable: true,
      cause: err,
      extraInput: { userId, updateParams },
    });
  }
}

export async function createTeamChannel(teamId: string, teamName: string, imageUrl?: string | null) {
  logger.debug(`${logName} Creating a team channel`, { teamId, teamName, imageUrl });

  const client = getInstance();
  const channel = client.channel('team', teamId, { name: teamName, image: imageUrl, created_by_id: 'admin' });
  try {
    await channel.create();
  } catch (err) {
    throw new VisibleError('Failed to create team chat channel!', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, teamName, imageUrl },
    });
  }
}

export async function updateTeamChannel(teamId: string, updateParams: ChannelUpdateParams) {
  logger.debug(`${logName} Updating a team channel`, { teamId, updateParams });

  const client = getInstance();
  const channel = client.channel('team', teamId);
  try {
    await channel.updatePartial({ set: updateParams });
  } catch (err) {
    throw new VisibleError('Failed to update team chat channel!', {
      isExposable: true,
      cause: err,
      extraInput: { teamId, updateParams },
    });
  }
}

export async function addTeamChannelMember(userId: string, channelId: string) {
  logger.debug(`${logName} Adding a channel member`, { userId, channelId });

  const client = getInstance();
  const channel = client.channel('team', channelId);

  try {
    await channel.addMembers([userId]);
  } catch (err) {
    throw new VisibleError('Failed to add a user to channel!', {
      isExposable: true,
      cause: err,
      extraInput: { userId, channelId },
    });
  }
}

export async function removeMemberFromTeamChannel(userId: string, channelId: string) {
  logger.debug(`${logName} Removing a channel member`, { userId, channelId });

  const client = getInstance();
  const channel = client.channel('team', channelId);

  try {
    await channel.removeMembers([userId]);
  } catch (err) {
    throw new VisibleError('Failed to remove a user to channel!', {
      isExposable: true,
      cause: err,
      extraInput: { userId, channelId },
    });
  }
}

export async function deactivateUser(userId: string) {
  logger.debug(`${logName} Deactivating a user`, { userId });

  try {
    await getInstance().deactivateUser(userId, { mark_messages_deleted: false });
  } catch (err) {
    new VisibleError('Failed to deactivate a chat user!', {
      cause: err,
      extraInput: { userId },
    });
  }
}

export async function reactivateUser(userId: string) {
  logger.debug(`${logName} Reactivating a user`, { userId });

  try {
    await getInstance().reactivateUser(userId, { restore_messages: true });
  } catch (err) {
    throw new VisibleError('Failed to reactivate a chat user!', {
      cause: err,
      extraInput: { userId },
    });
  }
}

export async function addPushDeviceId(userId: string, deviceId: string) {
  logger.debug(`${logName} Adding a user device ID to Stream Chat notification list`, { userId, deviceId });

  const client = getInstance();
  try {
    return await client.addDevice(deviceId, defaultPushProvider, userId, defaultPushProviderName);
  } catch (err) {
    throw new VisibleError('Failed to add user device ID to notification list', {
      isExposable: true,
      cause: err,
      serviceMessage: 'Failed to add user device ID to Stream Chat notification list: External service error',
      extraInput: { userId, deviceId },
    });
  }
}

export async function removePushDeviceId(userId: string, deviceId: string) {
  logger.debug(`${logName} Removing a user device ID from Stream Chat notification list`, { userId, deviceId });

  const client = getInstance();
  try {
    return await client.removeDevice(deviceId, userId);
  } catch (err) {
    throw new VisibleError('Failed to remove user device ID from notification list', {
      isExposable: true,
      cause: err,
      serviceMessage: 'Failed to remove user device ID from Stream Chat notification list: External service error',
      extraInput: { userId, deviceId },
    });
  }
}

export async function getPushDeviceIds(userId: string) {
  logger.debug(`${logName} Getting a list of user device IDs from Stream Chat`, { userId });

  const client = getInstance();
  try {
    const response = await client.getDevices(userId);

    if (!response.devices) return [];

    return response.devices.map(device => device.id);
  } catch (err) {
    throw new VisibleError('Failed to get list of user device IDs', {
      isExposable: true,
      cause: err,
      serviceMessage: 'Failed to get list of user device IDs from Stream Chat: External service error',
      extraInput: { userId },
    });
  }
}

export * as Chat from './chat.js';
