import { useSession } from 'sst/node/auth';

import { VisibleError } from '@up-from/util/error';

declare module 'sst/node/auth' {
  export interface SessionTypes {
    // Regular user in application and marketplace
    user: {
      id: string;
      chatToken?: string;
    };
    // Administrator in Admin Portal
    admin: {
      id: string;
      email: string;
    };
    // Public token. Equal to "no token". Used for session logout.
    public: NonNullable<unknown>;
  }
}

// User
export function authorizeUser() {
  const session = useSession();
  const { type: sessionType } = session;

  // Exclude public sessions
  if (!sessionType || sessionType === 'public') {
    throw new VisibleError('User is not authenticated', { isExposable: true, extraInput: { session } });
  }

  if (sessionType === 'user') return;

  throw new VisibleError('User is not authorized', { isExposable: true, extraInput: { session } });
}

export function getAuthorizedUserProperties() {
  authorizeUser();

  const { properties } = useSession();
  if (!('id' in properties) || !properties.id) {
    throw new VisibleError('Invalid session', { isExposable: true, extraInput: { properties } });
  }

  return properties;
}

export function authorizeAdmin() {
  const session = useSession();
  const { type: sessionType } = session;

  // Exclude public sessions
  if (!sessionType || sessionType === 'public') {
    throw new VisibleError('User is not authenticated', { isExposable: true, extraInput: { session } });
  }

  if (session.type === 'admin') return;

  throw new VisibleError('User is not authorized', { isExposable: true, extraInput: { session } });
}

export * as Session from './session.js';
