import { Config, StackContext } from 'sst/constructs';

export function SecretsStack({ stack }: StackContext) {
  const TWILIO_ACCOUNT_SID = new Config.Secret(stack, 'TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = new Config.Secret(stack, 'TWILIO_AUTH_TOKEN');
  const TWILIO_PHONE_NUMBER = new Config.Secret(stack, 'TWILIO_PHONE_NUMBER');
  const SENDGRID_API_KEY = new Config.Secret(stack, 'SENDGRID_API_KEY');
  const SENDGRID_EMAIL = new Config.Secret(stack, 'SENDGRID_EMAIL');
  const STREAM_APP_ID = new Config.Secret(stack, 'STREAM_APP_ID');
  const STREAM_APP_KEY = new Config.Secret(stack, 'STREAM_APP_KEY');
  const STREAM_APP_SECRET = new Config.Secret(stack, 'STREAM_APP_SECRET');
  // Expected Firebase credentials format (stringified JSON):
  // {"project_id":"upfrom-xxxxx","private_key":"-----BEGIN PRIVATE KEY-----\\nAB...CD==\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxx.iam.gserviceaccount.com"}
  const FIREBASE_ACCOUNT_CREDENTIALS = new Config.Secret(stack, 'FIREBASE_ACCOUNT_CREDENTIALS');
  const GOOGLE_CLIENT_ID = new Config.Secret(stack, 'GOOGLE_CLIENT_ID');
  const GOOGLE_MAPS_API_KEY = new Config.Secret(stack, 'GOOGLE_MAPS_API_KEY');
  const LOG_LEVEL = new Config.Secret(stack, 'LOG_LEVEL');
  const APP_ANDROID_MIN_VERSION = new Config.Secret(stack, 'APP_ANDROID_MIN_VERSION');
  const APP_IOS_MIN_VERSION = new Config.Secret(stack, 'APP_IOS_MIN_VERSION');

  return {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    SENDGRID_API_KEY,
    SENDGRID_EMAIL,
    STREAM_APP_ID,
    STREAM_APP_KEY,
    STREAM_APP_SECRET,
    FIREBASE_ACCOUNT_CREDENTIALS,
    GOOGLE_CLIENT_ID,
    GOOGLE_MAPS_API_KEY,
    LOG_LEVEL,
    APP_ANDROID_MIN_VERSION,
    APP_IOS_MIN_VERSION,
  };
}
