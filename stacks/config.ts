import { App } from 'sst/constructs';

type CustomDomainSetting = {
  domainName: string;
  hostedZone: string;
  domainAlias?: string;
};
type CustomDomainStageSettings = {
  staging: CustomDomainSetting;
  production: CustomDomainSetting;
};
type CustomDomainStackSettings = {
  appApi: CustomDomainStageSettings;
  adminApi: CustomDomainStageSettings;
  adminSite: CustomDomainStageSettings;
};

type CustomDomainStack = keyof CustomDomainStackSettings;

const customDomainSettings: CustomDomainStackSettings = {
  appApi: {
    staging: {
      domainName: 'api.app.staging.upfrom.com',
      hostedZone: 'staging.upfrom.com',
    },
    production: {
      domainName: 'api.app.upfrom.com',
      hostedZone: 'upfrom.com',
    },
  },
  adminApi: {
    staging: {
      domainName: 'api.admin.staging.upfrom.com',
      hostedZone: 'staging.upfrom.com',
    },
    production: {
      domainName: 'api.admin.upfrom.com',
      hostedZone: 'upfrom.com',
    },
  },
  adminSite: {
    staging: {
      domainName: 'admin.staging.upfrom.com',
      hostedZone: 'staging.upfrom.com',
    },
    production: {
      domainName: 'admin.upfrom.com',
      hostedZone: 'upfrom.com',
      domainAlias: 'www.admin.upfrom.com',
    },
  },
};

const sstConsoleUrl = 'https://console.sst.dev';
const oldSstConsoleUrl = 'https://old.console.sst.dev';
export const localAdminSiteUrl = 'http://localhost:3000';
export const localMarketplaceSiteUrl = 'http://localhost:3001';
const defaultImage =
  'https://prod-up-from-storage-avatarimagesbucket10310826-13i9gxe5pny5v.s3.amazonaws.com/default_image.png';

const adminSitePublicEnvs = {
  staging: {
    NEXT_PUBLIC_SECURE_LOCAL_STORAGE_PREFIX: '883be5edbdea4ea2b90f93c0bdd40c86',
    NEXT_PUBLIC_DEFAULT_TEAM_IMG_URL: defaultImage,
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: 'AIzaSyAQ-HWtziKrguptxzP0icx1ggy-kGr6vN4',
    NEXT_PUBLIC_FLUENT_ICONS_NAMES_URL: '/emoji',
    NEXT_PUBLIC_FLUENT_ICONS_URL: 'https://cdn.jsdelivr.net/gh/mkabumattar/fluentui-emoji@latest/icons',
  },
  production: {
    NEXT_PUBLIC_SECURE_LOCAL_STORAGE_PREFIX: '08db20379d734aadb0f1c40ecedadc3d',
    NEXT_PUBLIC_DEFAULT_TEAM_IMG_URL: defaultImage,
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: 'AIzaSyAQ-HWtziKrguptxzP0icx1ggy-kGr6vN4',
    NEXT_PUBLIC_FLUENT_ICONS_NAMES_URL: '/emoji',
    NEXT_PUBLIC_FLUENT_ICONS_URL: 'https://cdn.jsdelivr.net/gh/mkabumattar/fluentui-emoji@latest/icons',
  },
};

type CustomThrottleSetting = {
  burst?: number; // In a moment (spike)
  rate?: number; // Per second
};
type CustomThrottleStageSettings = {
  staging: CustomThrottleSetting;
  production: CustomThrottleSetting;
};
type CustomThrottleStackSettings = {
  appApi: CustomThrottleStageSettings;
  adminApi: CustomThrottleStageSettings;
};

type CustomThrottleStack = keyof CustomThrottleStackSettings;

const defaultThrottlingSettings = {
  adminApi: {
    staging: {
      throttle: {
        rate: 30,
        burst: 10,
      },
    },
    production: {
      throttle: {
        rate: 100,
        burst: 20,
      },
    },
  },
  appApi: {
    staging: {
      throttle: {
        rate: 10,
        burst: 5,
      },
    },
    production: {
      throttle: {
        rate: 100,
        burst: 20,
      },
    },
  },
};

export function getCustomDomainSettings(
  { local, stage }: App,
  stack: CustomDomainStack,
): CustomDomainSetting | undefined {
  if (local || !stage) return;
  if (stage === 'prod') return customDomainSettings[stack].production;
  if (stage === 'staging') return customDomainSettings[stack].staging;

  console.warn('Cannot get Custom Domain settings! Unknown stage!', {
    stage,
    isLocalApp: local,
  });
}

export function getCustomThrottlingSettings({ local, stage }: App, stack: CustomThrottleStack) {
  if (local || !stage) return {};
  if (stage === 'prod') return defaultThrottlingSettings[stack].production;
  if (stage === 'staging') return defaultThrottlingSettings[stack].staging;

  console.warn('Cannot get Custom Throttling settings! Unknown stage!', {
    stage,
    isLocalApp: local,
  });
  return {};
}

export function getApiCorsAllowedOrigins(app: App, stack: CustomDomainStack) {
  const localOrigins = [localAdminSiteUrl, localMarketplaceSiteUrl, sstConsoleUrl, oldSstConsoleUrl, 'https://d1zrad5gasbydk.cloudfront.net'];
  if (app.local || !app.stage) {
    return localOrigins;
  }

  const domainSettings = getCustomDomainSettings(app, stack);
  if (domainSettings) {
    const origins = [`https://${domainSettings.domainName}`, sstConsoleUrl, oldSstConsoleUrl];
    if (domainSettings.domainAlias) {
      origins.push(`https://${domainSettings.domainAlias}`);
    }
    return origins;
  }

  console.warn('Cannot get proper Admin Site URL! Defaulting to local URL!', {
    stage: app.stage,
    isLocalApp: app.local,
  });

  return localOrigins;
}

export function getAdminSitePublicEnvs({ local, stage }: App) {
  if (local || !stage) return {};
  if (stage === 'prod') return adminSitePublicEnvs.production;
  if (stage === 'staging') return adminSitePublicEnvs.staging;

  console.warn('Cannot get Admin Site Public Envs! Unknown stage!', {
    stage,
    isLocalApp: local,
  });

  return {};
}
