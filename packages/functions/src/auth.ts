import { AuthHandler, LinkAdapter, Session, createAdapter } from 'sst/node/auth';
import { usePath, useQueryParam } from 'sst/node/api';

import { Chat, User, Team, TeamUser } from '@up-from/core';
import { Loader } from '@up-from/repository/dataloader';
import { AuthCode } from '@up-from/repository/auth-code';
import {
  logger,
  VisibleError,
  validateEmail,
  getUnifiedPhoneFormat,
  getAuthorizedUserProperties,
  authorizeUser,
} from '@up-from/util';

import { ApiResponse, addAppVersionHeaders as withVersion } from '#util/api-response';
import { CodeAdapter } from '#util/auth-on-code-adapter';
import { LogoutAdapter } from '#util/auth-logout-adapter';

const defaultUserRole = 'member';

async function onError(err?: unknown) {
  const error = new VisibleError('Unexpected auth error', {
    isExposable: false,
    isOperational: false,
    cause: err,
  });
  return withVersion(ApiResponse.unauthorized(error));
}

function respondWithTokenRedirect(user: User.UserShape, redirectUrl?: string) {
  const redirect = redirectUrl || 'upfrom://auth-redirect';
  const tokenType = 'user';
  const { id } = user;

  const chatToken = Chat.createUserToken(id);
  return withVersion(
    Session.parameter({
      redirect,
      type: tokenType,
      properties: { id, chatToken },
      options: { expiresIn: 1000 * 60 * 60 * 24 * 30 }, // 30 days
    }),
  );
}

function respondWithTokenCookieRedirect(user: User.UserShape, redirectUrl?: string) {
  const redirect = redirectUrl || 'upfrom://auth-redirect';
  const tokenType = 'user';
  const { id } = user;

  const chatToken = Chat.createUserToken(id);
  return withVersion(
    Session.cookie({
      redirect,
      type: tokenType,
      properties: { id, chatToken },
      options: { expiresIn: 1000 * 60 * 60 * 24 * 30 }, // 30 days
    }),
  );
}

async function obtainUser(email: string, teamId?: string) {
  const user = await User.findOne({ email });
  if (user) {
    return User.validateUser(user, true);
  }

  try {
    if (teamId) {
      await Team.getValidTeam(teamId); // Just check the team (it exists and not disabled)
    }
  } catch (err) {
    throw new VisibleError('User is not allowed to join this team', {
      isExposable: true,
      cause: err,
      serviceMessage: `The team is not a valid one`,
      extraInput: { teamId },
    });
  }

  const newUser = await User.create({ email, isSignupCompleted: false });
  if (!teamId) return newUser;

  await TeamUser.add(teamId, newUser.id, defaultUserRole);
  return newUser;
}

// Link adapters
const emailAdapter = LinkAdapter({
  onLink: async (link: string, { email, teamId }) => {
    logger.debug('Email Adapter: onLink parameters', { link, email, teamId });

    if (!email) {
      const error = new VisibleError('Email address is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    try {
      validateEmail(email);
    } catch (err) {
      if (err instanceof VisibleError) return ApiResponse.badRequest(err);

      return withVersion(ApiResponse.badRequest('Invalid email address'));
    }

    try {
      await User.sendVerificationLinkEmail(email, link);
    } catch (err) {
      const error = new VisibleError('Failed to send a verification link via email', {
        isExposable: true,
        cause: err,
        extraInput: { email, link },
      });
      return withVersion(ApiResponse.internalError(error));
    }

    return withVersion(ApiResponse.accepted());
  },

  onSuccess: async ({ email, teamId }) => {
    logger.debug('Email Adapter: onSuccess parameters', { email, teamId });

    try {
      validateEmail(email);
      const user = await obtainUser(email, teamId);
      return respondWithTokenRedirect(user);
    } catch (err) {
      const error = new VisibleError('Failed to complete email verification', {
        isExposable: true,
        cause: err,
        extraInput: { email, teamId },
      });
      return withVersion(ApiResponse.internalError(error));
    }
  },

  onError,
});

const phoneAdapter = LinkAdapter({
  onLink: async (link: string, { phone, id }) => {
    logger.debug('Phone Adapter: onLink parameters', { link, phone, id });

    if (!phone) {
      const error = new VisibleError('Phone number is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    try {
      const { id: authorizedId } = getAuthorizedUserProperties();
      if (id !== authorizedId) {
        throw new VisibleError(`User ID mismatch. Requested user ID "${id}" Token user ID "${authorizedId}"`, {
          isExposable: false,
          extraInput: { userId: id, authorizedId },
        });
      }
    } catch (err) {
      if (err instanceof VisibleError) return ApiResponse.unauthorized(err);

      return withVersion(ApiResponse.unauthorized('Invalid session'));
    }

    try {
      const user = await User.findOne({ phone });
      if (user) {
        const error = new VisibleError('User with this phone number already exists', {
          isExposable: true,
          extraInput: { phone },
        });
        return withVersion(ApiResponse.badRequest(error));
      }
    } catch (err) {
      new VisibleError('Failed to perform user search', { isExposable: false, cause: err, extraInput: { phone } });
      return withVersion(ApiResponse.internalError());
    }

    let validPhone: string;
    try {
      validPhone = getUnifiedPhoneFormat(phone);
    } catch (err) {
      if (err instanceof VisibleError) return withVersion(ApiResponse.badRequest(err));

      return withVersion(ApiResponse.badRequest('Phone number validation failed'));
    }

    try {
      await User.sendVerificationSms(validPhone, link);
    } catch (err) {
      const error = new VisibleError('Failed to send a confirmation link via SMS', {
        isExposable: true,
        cause: err,
        extraInput: { phone },
      });
      return withVersion(ApiResponse.internalError(error));
    }

    return withVersion(ApiResponse.accepted());
  },
  onSuccess: async ({ phone, id }) => {
    logger.debug('Phone Adapter: onSuccess parameters', { phone, id });

    try {
      const user = await User.update(id, { phone });
      User.validateUser(user, true);
      return respondWithTokenRedirect(user);
    } catch (err) {
      const error = new VisibleError('Failed to complete SMS verification', {
        isExposable: true,
        cause: err,
        extraInput: { phone, id },
      });
      return withVersion(ApiResponse.internalError(error));
    }
  },

  onError,
});

const MultiLinkAdapter = createAdapter(() => () => {
  const [step] = usePath().slice(-1);
  logger.debug('MultiLink Adapter: Auth step:', { step });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  let email: string | undefined;
  if (step === 'authorize') {
    email = useQueryParam('email');
  }

  if (step === 'callback') {
    const token = useQueryParam('token');
    logger.debug('MultiLink Adapter: token:', { token });

    if (typeof token === 'string') {
      try {
        const tokenBody = token.split('.')[1];
        const body = Buffer.from(tokenBody, 'base64').toString();
        ({ email } = JSON.parse(body));
      } catch (err) {
        new VisibleError('Failed to parse token body', { isExposable: false, cause: err, extraInput: { token } });
      }
    }
  }

  if (email) {
    return emailAdapter();
  }

  return phoneAdapter();
});

// Code adapters
const emailCodeAdapter = CodeAdapter({
  codeLength: 6,
  onCode: async (code: string, { email }) => {
    logger.debug('Email Adapter: onCode parameters', { code, email });

    if (!email) {
      const error = new VisibleError('Email address is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    try {
      validateEmail(email);
    } catch (err) {
      if (err instanceof VisibleError) return ApiResponse.badRequest(err);

      return withVersion(ApiResponse.badRequest('Invalid email address'));
    }

    try {
      await AuthCode.createOne({ code, email, type: 'user' });
    } catch (err) {
      const error = new VisibleError('Failed to store a verification code', {
        isExposable: false,
        cause: err,
        extraInput: { code, email },
      });
      return withVersion(ApiResponse.internalError(error));
    }

    try {
      await User.sendVerificationCodeEmail(email, code);
    } catch (err) {
      new VisibleError(`Failed to send a verification code "${code}" via email`, {
        isExposable: false,
        cause: err,
        extraInput: { email, code },
      });
      return withVersion(ApiResponse.internalError('Failed to send a verification code via email'));
    }

    return withVersion(ApiResponse.accepted());
  },

  onSuccess: async (code, { email, teamId, redirectUrl }) => {
    logger.debug('Email Adapter: onSuccess parameters', { code, email, teamId });

    if (!redirectUrl) {
      const error = new VisibleError('Redirect URL is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    if (!email) {
      const error = new VisibleError('Email address is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    let foundCode;
    try {
      foundCode = await AuthCode.takeOne({ code, email, type: 'user' });
    } catch (err) {
      const error = new VisibleError('Failed to find a verification code', {
        isExposable: false,
        cause: err,
        extraInput: { code, email },
      });
      return withVersion(ApiResponse.internalError(error));
    }

    if (!foundCode) {
      const error = new VisibleError(`Failed to complete verification: Invalid verification code`, {
        isExposable: true,
        extraInput: { code, email },
      });
      return withVersion(ApiResponse.unauthorized(error));
    }

    try {
      const user = await obtainUser(email, teamId);
      return respondWithTokenCookieRedirect(user, redirectUrl);
    } catch (err) {
      const error = new VisibleError('Failed to complete email verification', {
        isExposable: true,
        cause: err,
        extraInput: { email, teamId },
      });
      return withVersion(ApiResponse.internalError(error));
    }
  },

  onError,
});

const phoneCodeAdapter = CodeAdapter({
  codeLength: 6,
  onCode: async (code: string, { phone }) => {
    logger.debug('Phone Adapter: onCode parameters', { code, phone });

    try {
      authorizeUser();
    } catch (err) {
      if (err instanceof VisibleError) return ApiResponse.ok(err);

      return withVersion(ApiResponse.unauthorized('Invalid session'));
    }

    if (!phone) {
      const error = new VisibleError('Phone number is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    let validPhone: string;
    try {
      validPhone = getUnifiedPhoneFormat(phone);
    } catch (err) {
      if (err instanceof VisibleError) return withVersion(ApiResponse.badRequest(err));

      return withVersion(ApiResponse.badRequest('Phone number validation failed'));
    }

    try {
      const user = await User.findOne({ phone: validPhone });
      if (user) {
        const error = new VisibleError('User with this phone number already exists', {
          isExposable: true,
          extraInput: { validPhone },
        });
        return withVersion(ApiResponse.badRequest(error));
      }
    } catch (err) {
      new VisibleError('Failed to perform user search', { isExposable: false, cause: err, extraInput: { validPhone } });
      return withVersion(ApiResponse.internalError());
    }

    try {
      await AuthCode.createOne({ code, phone: validPhone, type: 'user' });
    } catch (err) {
      const error = new VisibleError('Failed to store a verification code', {
        isExposable: false,
        cause: err,
        extraInput: { code, phone },
      });
      return withVersion(ApiResponse.internalError(error));
    }

    try {
      await User.sendVerificationSms(validPhone, `Your UpFrom verification code: ${code}`);
    } catch (err) {
      new VisibleError(`Failed to send a verification code "${code}" via SMS`, {
        isExposable: true,
        cause: err,
        extraInput: { phone, code },
      });
      return withVersion(ApiResponse.internalError(`Failed to send a verification code via SMS`));
    }

    return withVersion(ApiResponse.accepted());
  },
  onSuccess: async (code, { phone, redirectUrl }) => {
    logger.debug('Phone Adapter: onSuccess parameters', { phone, code });

    if (!redirectUrl) {
      const error = new VisibleError('Redirect URL is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    let userId;
    try {
      const properties = getAuthorizedUserProperties();
      userId = properties.id;
    } catch (err) {
      if (err instanceof VisibleError) return ApiResponse.unauthorized(err);

      return withVersion(ApiResponse.unauthorized('Invalid session'));
    }

    if (!phone) {
      const error = new VisibleError('Phone number is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    let validPhone: string;
    try {
      validPhone = getUnifiedPhoneFormat(phone);
    } catch (err) {
      if (err instanceof VisibleError) return withVersion(ApiResponse.badRequest(err));

      return withVersion(ApiResponse.badRequest('Phone number validation failed'));
    }

    let foundCode;
    try {
      foundCode = await AuthCode.takeOne({ code, phone: validPhone, type: 'user' });
    } catch (err) {
      const error = new VisibleError('Failed to find a verification code', {
        isExposable: false,
        cause: err,
        extraInput: { code, phone },
      });
      return withVersion(ApiResponse.internalError(error));
    }

    if (!foundCode) {
      const error = new VisibleError(`Failed to complete verification: Invalid verification code`, {
        isExposable: true,
        extraInput: { code, phone },
      });
      return withVersion(ApiResponse.unauthorized(error));
    }

    try {
      const user = await User.update(userId, { phone: validPhone });
      User.validateUser(user, true);
      return respondWithTokenCookieRedirect(user, redirectUrl);
    } catch (err) {
      const error = new VisibleError('Failed to complete SMS verification', {
        isExposable: true,
        cause: err,
        extraInput: { phone, userId },
      });
      return withVersion(ApiResponse.internalError(error));
    }
  },

  onError,
});

const MultiCodeAdapter = createAdapter(() => () => {
  const [step] = usePath().slice(-1);
  logger.debug('Code Adapter: Auth step:', { step });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  const email = useQueryParam('email');
  if (email) {
    return emailCodeAdapter();
  }

  return phoneCodeAdapter();
});

const logoutAdapter = LogoutAdapter({
  onLogout: async ({ redirectUrl }) => {
    logger.debug('Logout Adapter');

    if (!redirectUrl) {
      const error = new VisibleError('Redirect URL is not provided', { isExposable: true });
      return withVersion(ApiResponse.badRequest(error));
    }

    const tokenType = 'public';

    // Set public token on logout
    return withVersion(
      Session.cookie({
        redirect: redirectUrl,
        type: tokenType,
        properties: {},
      }),
    );
  },

  onError,
});

export const handler = AuthHandler({
  providers: {
    link: MultiLinkAdapter(),
    code: MultiCodeAdapter(),
    logout: () => logoutAdapter(),
  },
});
