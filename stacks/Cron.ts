import { Cron, StackContext, use } from 'sst/constructs';

import { Database } from './Database.js';
import { SecretsStack } from './SecretsStack.js';

export function CronStack({ stack, app }: StackContext) {
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

  const { rdsInstance } = use(Database);

  const scheduledNotifications = new Cron(stack, 'Cron15minScheduledNotifications', {
    schedule: 'cron(0/15 * ? * * *)',
    job: {
      function: {
        handler: 'packages/functions/src/send-scheduled-notifications.main',
        timeout: 60,
        memorySize: 512,
      },
    },
    enabled: !app.local,
  });

  scheduledNotifications.bind([
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    STREAM_APP_KEY,
    STREAM_APP_SECRET,
    SENDGRID_API_KEY,
    SENDGRID_EMAIL,
    FIREBASE_ACCOUNT_CREDENTIALS,
    LOG_LEVEL,
    rdsInstance,
  ]);
}
