import admin from 'firebase-admin';
import { Config } from 'sst/node/config';

import { VisibleError, logger } from '@up-from/util';

import { EventBus } from '@up-from/services/event-bus';
import { NotificationMetadata } from './notification-data.js';

const logName = 'Service Firebase:';

try {
  const accountCredentials = JSON.parse(Config.FIREBASE_ACCOUNT_CREDENTIALS);
  const credential = admin.credential.cert({
    projectId: accountCredentials.project_id,
    clientEmail: accountCredentials.client_email,
    privateKey: accountCredentials.private_key,
  });
  admin.initializeApp({ credential });
} catch (err) {
  throw new VisibleError(
    `${logName} Failed to initialize Firebase admin: Failed to parse/initialize account credentials secret!`,
    {
      isExposable: false,
      cause: err,
    },
  );
}

const title = 'UpFrom';

function makeMessage(body: string, tokens: string[], data: NotificationMetadata) {
  return {
    notification: {
      title,
      body,
    },
    data,
    tokens,
    condition: '',
  };
}

export async function sendBatch(messageBody: string, deviceIds: string[], metadata: NotificationMetadata) {
  logger.debug(`${logName} Sending batch of push notifications`, { messageBody, deviceIds, metadata });

  const message = makeMessage(messageBody, deviceIds, metadata);
  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    if (response?.failureCount) {
      const failedDeviceIds: string[] = [];
      const deviceIdsToRemove: string[] = [];

      const errors: object[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedDeviceIds.push(message.tokens[idx]);
          errors.push({ response: resp });

          if (resp.error?.code === 'messaging/registration-token-not-registered') {
            deviceIdsToRemove.push(message.tokens[idx]);
          }
        }
      });

      logger.error(`${logName} Failed to send some push notifications in the batch`, {
        metadata,
        deviceIdsCount: deviceIds.length,
        failedDeviceIdsCount: response.failureCount,
        deviceIds,
        failedDeviceIds,
        messageBody,
        errors,
      });

      if (deviceIdsToRemove.length) {
        await EventBus.publishOnUserDeviceTokensInvalidated(failedDeviceIds);
      }
    }
  } catch (err) {
    throw new VisibleError(`${logName} Failed to send batch of push notifications`, {
      cause: err,
      isExposable: false,
      extraInput: { message, messageBody, deviceIds, metadata },
    });
  }
}

export * as Firebase from './firebase.js';
