import { AuthHandler, Session, GoogleAdapter } from 'sst/node/auth';
import { useDomainName } from 'sst/node/api';
import { Config } from 'sst/node/config';

import { Admin } from '@up-from/core/admin/admin';
import { VisibleError, logger } from '@up-from/util';

import { ApiResponse } from '#util/api-response';

const logName = 'Admin Auth:';

const google = GoogleAdapter({
  mode: 'oidc',
  clientID: Config.GOOGLE_CLIENT_ID,
  onSuccess: async tokenSet => {
    logger.info(`${logName}: Google Adapter: On success`);

    const claims = tokenSet.claims();
    if (tokenSet.expired()) {
      logger.warn(`${logName} Token Set is expired`, { isExpired: tokenSet.expired(), email: claims?.email });
      return ApiResponse.unauthorized();
    }

    if (!claims?.email) {
      logger.warn(`${logName} Claims have no email!`, { email: claims?.email });
      return ApiResponse.unauthorized();
    }

    const admin = await Admin.findOneByEmail(claims.email);
    const adminPortalUrl = Config.ADMIN_SITE_URL;
    if (!adminPortalUrl) {
      new VisibleError(`${logName} Failed to get Admin Portal URL!`, {
        extraInput: { adminPortalEnv: adminPortalUrl },
      });
      return ApiResponse.internalError();
    }

    return Session.parameter({
      options: {
        expiresIn: 1000 * 60 * 60 * 24, // 1 day
      },
      redirect: `${adminPortalUrl}/auth/callback`,
      type: 'admin',
      properties: { email: admin.email, id: admin.id },
    });
  },
});

// Main purpose of this handler is to handle a specific Google response which triggers an error
// This kind of response is received when a user uses 2FA to log into Google account
const googleAuthHandler = async () => {
  try {
    console.debug('domain name', useDomainName());
    return await google();
  } catch (err: unknown) {
    // Handle checks.state error and try to authorize one more time
    if (err instanceof TypeError && err?.message === 'checks.state argument is missing') {
      logger.warn(`${logName}: Google Adapter: Caught "checks.state" error. Using workaround.`, { error: err });

      const authUrl = `https://${useDomainName()}/auth/google/authorize`;
      return ApiResponse.found(authUrl);
    }

    new VisibleError(`Unrecognized Google Adapter failure`, { isExposable: false, cause: err });
    return ApiResponse.internalError();
  }
};

export const handler = AuthHandler({
  providers: {
    google: () => googleAuthHandler(),
  },
});
