import { StackContext, use, Api as ApiGateway, Auth, Config } from 'sst/constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Database } from './Database.js';
import { SecretsStack } from './SecretsStack.js';
import { Storage } from './Storage.js';
import { EventBusStack } from './EventBus.js';
import { getCustomDomainSettings, getCustomThrottlingSettings } from './config.js';

export function Api({ stack, app }: StackContext) {
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
    APP_ANDROID_MIN_VERSION,
    APP_IOS_MIN_VERSION,
  } = use(SecretsStack);

  const { rdsInstance } = use(Database);
  const { uploadImages, avatarImages, organizationImages, teamImages, eventImages } = use(Storage);
  const { notificationEventBus } = use(EventBusStack);

  stack.setDefaultFunctionProps({ memorySize: 512 });

  const api = new ApiGateway(stack, 'api', {
    defaults: {
      throttle: getCustomThrottlingSettings(app, 'appApi'),
      function: {
        bind: [
          LOG_LEVEL,
          TWILIO_ACCOUNT_SID,
          TWILIO_AUTH_TOKEN,
          TWILIO_PHONE_NUMBER,
          STREAM_APP_KEY,
          STREAM_APP_SECRET,
          SENDGRID_API_KEY,
          SENDGRID_EMAIL,
          FIREBASE_ACCOUNT_CREDENTIALS,
          rdsInstance,
          APP_ANDROID_MIN_VERSION,
          APP_IOS_MIN_VERSION,
        ],
      },
    },
    customDomain: getCustomDomainSettings(app, 'appApi'),
    routes: {
      'POST /graphql': {
        type: 'graphql',
        function: {
          handler: 'packages/functions/src/graphql/graphql.handler',
          bind: [uploadImages, avatarImages, eventImages, organizationImages, teamImages, notificationEventBus],
          nodejs: {
            esbuild: {
              external: ['sharp'],
            },
          },
          layers: [
            new lambda.LayerVersion(stack, 'SharpLayer', {
              code: lambda.Code.fromAsset('packages/functions/layers/sharp'),
            }),
          ],
        },
        pothos: {
          schema: 'packages/functions/src/graphql/schema.ts',
          output: 'packages/graphql/schema.graphql',
          commands: ['cd packages/graphql && npx @genql/cli --output ./genql --schema ./schema.graphql --esm'],
        },
      },
      // Public route
      'GET /invite/{teamId}': {
        function: {
          handler: 'packages/functions/src/redirect-invitation-link.handler',
          memorySize: 128,
        },
      },
    },
  });

  const apiUrl = api.customDomainUrl || api.url;
  const apiUrlParameter = new Config.Parameter(stack, 'API_URL', { value: apiUrl });
  api.bind([apiUrlParameter]);

  const auth = new Auth(stack, 'auth', {
    authenticator: {
      handler: 'packages/functions/src/auth.handler',
      bind: [],
    },
  });
  auth.attach(stack, { api });

  stack.addOutputs({
    DomainName: String(getCustomDomainSettings(app, 'appApi')?.domainName),
    DomainHostedZone: String(getCustomDomainSettings(app, 'appApi')?.hostedZone),
    ApiCustomDomainUrl: String(api.customDomainUrl),
    ApiUrl: String(api.url),
    Root: apiUrl,
    Invite: apiUrl + '/invite/{teamId}',
    Authorize: apiUrl + '/auth/link/authorize',
    AuthCallback: apiUrl + '/auth/link/callback',
    GraphQL: apiUrl + '/graphql',
  });

  return api;
}
