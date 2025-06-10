import { StackContext, use, Api, Auth, Config, NextjsSite } from 'sst/constructs';
import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Database } from './Database.js';
import { SecretsStack } from './SecretsStack.js';
import { Api as ApiStack } from './Api.js';
import { Storage } from './Storage.js';
import { EventBusStack } from './EventBus.js';
import {
  getAdminSitePublicEnvs,
  getApiCorsAllowedOrigins,
  getCustomDomainSettings,
  getCustomThrottlingSettings,
  localAdminSiteUrl,
} from './config.js';

export function AdminStack({ stack, app }: StackContext) {
  const {
    FIREBASE_ACCOUNT_CREDENTIALS,
    GOOGLE_CLIENT_ID,
    GOOGLE_MAPS_API_KEY,
    LOG_LEVEL,
    SENDGRID_API_KEY,
    SENDGRID_EMAIL,
    STREAM_APP_KEY,
    STREAM_APP_SECRET,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
  } = use(SecretsStack);
  const { rdsInstance } = use(Database);
  const appApi = use(ApiStack);
  const { avatarImages, eventImages, organizationImages, teamImages, uploadImages } = use(Storage);
  const { userEventBus, notificationEventBus } = use(EventBusStack);

  stack.setDefaultFunctionProps({ memorySize: 512 });

  const adminApi = new Api(stack, 'adminApi', {
    defaults: {
      throttle: getCustomThrottlingSettings(app, 'adminApi'),
      function: {
        bind: [LOG_LEVEL, rdsInstance],
        timeout: 30,
      },
    },
    customDomain: getCustomDomainSettings(app, 'adminApi'),
    cors: {
      allowCredentials: false,
      allowMethods: ['POST', 'OPTIONS', 'GET'],
      allowOrigins: getApiCorsAllowedOrigins(app, 'adminSite'),
      allowHeaders: [
        'Accept',
        'Accept-Encoding',
        'Accept-Language',
        'Content-Type',
        'Content-Length',
        'Content-Language',
        'Authorization',
        'X-Api-Key',
      ],
      exposeHeaders: ['Content-Type', 'Content-Length', 'Date'],
      maxAge: '1 day',
    },
    routes: {
      'POST /graphql': {
        type: 'graphql',
        function: {
          handler: 'packages/functions/src/graphql-ap/graphql.handler',
          permissions: [
            new iam.PolicyStatement({
              actions: ['secretsmanager:GetSecretValue'],
              resources: ['arn:aws:secretsmanager:us-east-1:083084509884:secret:dev-upfrom-db-credentials-7TfPsV'],
            }),
          ],
          bind: [
            FIREBASE_ACCOUNT_CREDENTIALS,
            SENDGRID_API_KEY,
            SENDGRID_EMAIL,
            STREAM_APP_KEY,
            STREAM_APP_SECRET,
            TWILIO_ACCOUNT_SID,
            TWILIO_AUTH_TOKEN,
            TWILIO_PHONE_NUMBER,
            avatarImages,
            eventImages,
            organizationImages,
            teamImages,
            uploadImages,
            userEventBus,
            notificationEventBus,
          ],
        },
        pothos: {
          schema: 'packages/functions/src/graphql-ap/schema.ts',
          output: 'packages/graphql-ap/schema.graphql',
          commands: ['cd packages/graphql-ap && npx @genql/cli --output ./genql --schema ./schema.graphql --esm'],
        },
      },
      'GET /location/autocomplete': {
        function: {
          handler: 'packages/functions/src/location.autocompleteHandler',
          timeout: 10,
          memorySize: 128,
          bind: [GOOGLE_MAPS_API_KEY],
        },
      },
      'GET /location/geocode': {
        function: {
          handler: 'packages/functions/src/location.geocodeHandler',
          timeout: 10,
          memorySize: 128,
          bind: [GOOGLE_MAPS_API_KEY],
        },
      },
    },
  });

  const adminAuth = new Auth(stack, 'adminAuth', {
    authenticator: {
      handler: 'packages/functions/src/admin-auth.handler',
      bind: [GOOGLE_CLIENT_ID, SENDGRID_API_KEY, SENDGRID_EMAIL],
    },
  });
  adminAuth.attach(stack, { api: adminApi });

  const adminApiUrl = adminApi.customDomainUrl || adminApi.url;
  const adminSite = new NextjsSite(stack, 'AdminNextSite', {
    path: 'admin_portal',
    dev: {
      url: localAdminSiteUrl,
    },
    environment: {
      ...getAdminSitePublicEnvs(app),
      NEXT_PUBLIC_API_URL: adminApiUrl,
      NEXT_PUBLIC_AUTHORIZE_URL: adminApiUrl + '/auth/google/authorize',
      NEXT_PUBLIC_APP_API_URL: appApi.customDomainUrl || appApi.url,
      NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: 'AIzaSyAGNpxHPm7jKsR4frMYfKFi40msnWpK_5U',
    },
    cdk: {
      responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
    },
    customDomain: getCustomDomainSettings(app, 'adminSite'),
  });

  const adminSiteUrl = adminSite.customDomainUrl || adminSite.url || localAdminSiteUrl;
  const ADMIN_SITE_URL = new Config.Parameter(stack, 'ADMIN_SITE_URL', { value: adminSiteUrl });
  adminApi.bind([ADMIN_SITE_URL]);

  stack.addOutputs({
    SiteDomainName: String(getCustomDomainSettings(app, 'adminSite')?.domainName),
    SiteDomainHostedZone: String(getCustomDomainSettings(app, 'adminSite')?.hostedZone),
    SiteUrlCustomDomain: String(adminSite.customDomainUrl),
    SiteUrl: String(adminSite.url),
    ApiDomainName: String(getCustomDomainSettings(app, 'adminApi')?.domainName),
    ApiDomainHostedZone: String(getCustomDomainSettings(app, 'adminApi')?.hostedZone),
    ApiUrlCustomDomain: String(adminApi.customDomainUrl),
    ApiUrl: String(adminApi.url),
    ApiRoot: adminApiUrl,
    ApiGraphQL: adminApiUrl + '/graphql',
    ApiAdminAuthorize: adminApiUrl + '/auth/google/authorize',
    ApiAdminAuthCallback: adminApiUrl + '/auth/google/callback',
    ApiManagerAuthorize: adminApiUrl + '/auth/code/authorize',
    ApiManagerAuthCallback: adminApiUrl + '/auth/code/callback',
    ParameterAdminSiteUrl: ADMIN_SITE_URL.value,
  });

  return { adminApi, adminSite };
}
