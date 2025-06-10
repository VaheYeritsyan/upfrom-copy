import { EventBus, StackContext, use } from 'sst/constructs';

import { Database } from './Database.js';
import { SecretsStack } from './SecretsStack.js';

const defaultTimeout = 60; // seconds
const defaultMemorySize = 512; // Mb

export function EventBusStack({ stack }: StackContext) {
  const { rdsInstance } = use(Database);
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    SENDGRID_API_KEY,
    SENDGRID_EMAIL,
    STREAM_APP_KEY,
    STREAM_APP_SECRET,
    FIREBASE_ACCOUNT_CREDENTIALS,
    LOG_LEVEL,
  } = use(SecretsStack);

  stack.setDefaultFunctionProps({
    timeout: defaultTimeout,
    memorySize: defaultMemorySize,
  });

  // User
  const userEventBus = new EventBus(stack, 'User', {
    defaults: {
      retries: 10,
    },
  });

  userEventBus.subscribe('user.deviceTokensInvalidated', {
    handler: 'packages/functions/src/event-bus/user-device-token.userDeviceTokensInvalidatedHandler',
    bind: [STREAM_APP_KEY, STREAM_APP_SECRET, LOG_LEVEL, rdsInstance],
  });

  // Notifications
  const notificationEventBus = new EventBus(stack, 'Notification', {
    defaults: {
      retries: 3,
    },
  });

  notificationEventBus.bind([
    FIREBASE_ACCOUNT_CREDENTIALS,
    SENDGRID_API_KEY,
    SENDGRID_EMAIL,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    LOG_LEVEL,
    userEventBus, // Device tokens might become invalid during sending process of push notifications. Such tokens should be removed by sending a specific "User" Event Bus event
    rdsInstance,
  ]);

  notificationEventBus.subscribe('event.allTeamsCreated', {
    handler: 'packages/functions/src/event-bus/notification.eventAllTeamsCreatedHandler',
    memorySize: defaultMemorySize * 2, // May use more memory as this lambda sends notifications to almost all users in the app
  });

  notificationEventBus.subscribe('event.cancelled', {
    handler: 'packages/functions/src/event-bus/notification.eventCancelledHandler',
  });

  notificationEventBus.subscribe('event.dateTimeUpdated', {
    handler: 'packages/functions/src/event-bus/notification.eventDateTimeUpdatedHandler',
  });

  notificationEventBus.subscribe('event.locationUpdated', {
    handler: 'packages/functions/src/event-bus/notification.eventLocationUpdatedHandler',
  });

  notificationEventBus.subscribe('event.guestListUpdated', {
    handler: 'packages/functions/src/event-bus/notification.eventGuestListUpdatedHandler',
  });

  notificationEventBus.subscribe('team.newMemberAdded', {
    handler: 'packages/functions/src/event-bus/notification.teamNewMemberAddedHandler',
  });

  // Stack outputs
  stack.addOutputs({
    NotificationEventBus: notificationEventBus.eventBusName,
    UserEventBus: userEventBus.eventBusName,
  });

  return { userEventBus, notificationEventBus };
}
