import { User, UserDevice, UserNotificationPref } from '@up-from/repository';
import { VisibleError, logger, ArrayUtil } from '@up-from/util';

import { Email, SMS } from '@up-from/services';
import { Firebase } from '#push/firebase';
import { NotificationMetadata } from '#push/notification-data';

export enum NotificationType {
  ChatNewMessage,
  EventNewInvitation,
  EventNewAllTeams,
  EventUpdatedDateTime,
  EventUpdatedLocation,
  EventAwaitingInvitation,
  EventCancelled,
  EventRemovedIndividual,
  TeamNewMember,
}

type NotificationPrefFields = Omit<
  UserNotificationPref.UserNotificationPrefShape,
  'userId' | 'createdAt' | 'updatedAt'
>;

type PreferenceMap = {
  push?: keyof NotificationPrefFields;
  email?: keyof NotificationPrefFields;
  sms?: keyof NotificationPrefFields;
};

type MakeBody = (...names: string[]) => string;

type NotificationConfig = {
  reason: string;
  preferenceMap: PreferenceMap;
  makeBody: MakeBody;
};

type MessageOptions = {
  config: NotificationConfig;
  messageBody: string;
  metadata: NotificationMetadata;
};

type NotificationOptions = {
  eventName?: string;
  metadata: NotificationMetadata;
};

const logName = 'Service Notification:';

const tagEventBody = (strings: TemplateStringsArray, eventName: string) => strings.join(eventName);

const configMap = new Map<NotificationType, NotificationConfig>([
  [
    NotificationType.TeamNewMember,
    {
      reason: 'New team member has registered',
      preferenceMap: {
        push: 'pushTeamNewMember',
      },
      makeBody: () => 'New team member has registered',
    },
  ],
  [
    NotificationType.ChatNewMessage,
    {
      reason: 'New message',
      preferenceMap: {
        push: 'pushChatNewMessage',
        email: 'emailChatNewMessage',
      },
      makeBody: () => 'You have received a new message on UpFrom.',
    },
  ],
  [
    NotificationType.EventNewInvitation,
    {
      reason: 'New invitation to the event',
      preferenceMap: {
        push: 'pushEventNewInvitation',
      },
      makeBody: (eventName: string) =>
        tagEventBody`You were just invited to a new event “${eventName}” on the UpFrom app.`,
    },
  ],
  [
    NotificationType.EventNewAllTeams,
    {
      reason: 'New All Team Event',
      preferenceMap: {
        push: 'pushEventNewAllTeam',
      },
      makeBody: (eventName: string) => tagEventBody`“${eventName}” All Teams event was created.`,
    },
  ],
  [
    NotificationType.EventUpdatedDateTime,
    {
      reason: 'Event date/time has changed',
      preferenceMap: {
        push: 'pushEventUpdatedDateTime',
      },
      makeBody: (eventName: string) => tagEventBody`“${eventName}” event has been rescheduled.`,
    },
  ],
  [
    NotificationType.EventAwaitingInvitation,
    {
      reason: 'You have one invitation waiting',
      preferenceMap: {
        email: 'emailEventPendingInvitation',
      },
      makeBody: (eventName: string) =>
        tagEventBody`You have an invitation to “${eventName}” event awaiting your response.`,
    },
  ],
  [
    NotificationType.EventUpdatedLocation,
    {
      reason: 'Event location changed',
      preferenceMap: {
        push: 'pushEventUpdatedLocation',
      },
      makeBody: (eventName: string) => tagEventBody`The location of “${eventName}” event has been changed.`,
    },
  ],
  [
    NotificationType.EventCancelled,
    {
      reason: 'Event has been cancelled',
      preferenceMap: {
        push: 'pushEventCancelled',
      },
      makeBody: (eventName: string) => tagEventBody`“${eventName}” event has been cancelled.`,
    },
  ],
  [
    NotificationType.EventRemovedIndividual,
    {
      reason: 'Individual has been removed from event',
      preferenceMap: {
        push: 'pushEventRemovedIndividual',
      },
      makeBody: (eventName: string) => tagEventBody`You have been removed from “${eventName}” event.`,
    },
  ],
]);

async function sendOne(user: User.UserShape, options: MessageOptions) {
  const { messageBody, config, metadata } = options;
  const { preferenceMap } = config;

  if (preferenceMap.email) {
    if (!user?.email) {
      throw new VisibleError('Failed to send notification: User email not found', {
        isExposable: true,
        extraInput: { user, options },
      });
    }

    await Email.sendNotificationEmail(user.email, messageBody);
  }

  if (preferenceMap.sms) {
    if (!user?.phone) {
      throw new VisibleError('Failed to send notification: User phone number not found', {
        isExposable: true,
        extraInput: { user, options },
      });
    }

    await SMS.send(user.phone, messageBody);
  }

  if (preferenceMap.push) {
    const devices = await UserDevice.findAllByUserId(user.id);
    if (devices?.length) {
      const deviceIds = devices.map(device => device.deviceId);
      await Firebase.sendBatch(messageBody, deviceIds, { userId: user.id, ...metadata });
    } else {
      logger.info(`${logName} No user devices found to send push notifications to`, { userId: user.id });
    }
  }
}

export async function notify(
  recipients: UserNotificationPref.NotificationRecipient[],
  notificationType: NotificationType,
  notificationOptions: NotificationOptions,
) {
  logger.debug(`${logName} Notifying`, {
    recipientUserIds: recipients.map(user => user.id),
    notificationType: NotificationType[notificationType],
    notificationOptions,
  });

  if (!recipients.length) {
    logger.info(`${logName} No recipients`, { recipients, notificationOptions });
    return;
  }

  const config = configMap.get(notificationType);
  if (!config) {
    throw new VisibleError('Failed to send notification: Cannot get notification configuration', {
      isExposable: true,
      serviceMessage: 'Could not find type configuration in configMap',
      extraInput: { notificationTypeName: NotificationType[notificationType], notificationOptions },
    });
  }

  // Exclude recipients that prefer to ignore this type of notification
  const expectedEnabledPreferences = Object.values(config.preferenceMap);
  const subscribedRecipients = recipients.filter(({ notificationPreferences }) => {
    if (!notificationPreferences) return false;

    return expectedEnabledPreferences.some(prefName => notificationPreferences[prefName]);
  });

  if (!subscribedRecipients.length) {
    logger.info(`${logName} No subscribed recipients found`, {
      recipientPreferences: recipients.map(recipient => recipient.notificationPreferences),
      expectedEnabledPreferences,
    });
    return;
  }

  const { eventName, metadata } = notificationOptions;
  const messageBody = eventName ? config.makeBody(eventName) : config.makeBody();

  // Send requests in batches.
  // e.g: job size = 10, run first 10 jobs simultaneously and wait for them to complete, then run next 10 jobs...
  // drawbacks: not as fast as possible
  // - whole batch will wait for the slowest job to complete
  // - one job relates on multiple services so the slowest service slows down the whole process
  // - does not affect rate limits (but might be improved to use the worst service limits for each job)
  const jobBatchSize = 10;
  const subscribedRecipientChunks = ArrayUtil.split(subscribedRecipients, jobBatchSize);

  // Process batches one by one
  for (const subscribedRecipientChunk of subscribedRecipientChunks) {
    const jobs = subscribedRecipientChunk.map(recipient => sendOne(recipient, { messageBody, config, metadata }));

    const results = await Promise.allSettled(jobs);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.warn('Failed to send notification!', {
          reason: result?.reason,
          job: { recipient: subscribedRecipientChunk[index], messageBody, config },
        });
      }
    });
  }
}

export * as Notification from './notification.js';
