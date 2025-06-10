import React, { useState, useEffect, useMemo, useCallback, ReactNode, createContext, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { showAlert } from '~utils/toasts';
import * as sessionUtil from '~utils/session';
import { useForegroundEffect } from '~Hooks/useForegroundEffect';

// ? it's not clear whether or not invitation info belongs in this context
// ? or in any context at all. Similarly, maybe AuthContext will become AppContext
// ? and capture global, non-persisted state e.g. alerts, loading, etc.
export type InvitationProps = undefined | { type: 'mentor' | 'mentee'; teamId: string };

interface IAuthContext {
  token: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
  invitation: InvitationProps;
  setInvitation: Dispatch<SetStateAction<InvitationProps>>;
  isNeedToUpdate: boolean;
  setIsNeedToUpdate: (setIsNeedToUpdate: boolean) => void;
}

export const DefaultAuthContext = createContext<IAuthContext>({
  token: null,
  signIn: () => {},
  signOut: () => {},
  invitation: undefined,
  setInvitation: () => {},
  isNeedToUpdate: false,
  setIsNeedToUpdate: () => {},
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [token, setToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationProps>();
  const [isNeedToUpdate, setIsNeedToUpdate] = useState(false);

  const signIn = useCallback(async (newToken: string) => {
    const { token } = await sessionUtil.setToken(newToken);
    if (!token) showAlert('Token expired, please log in again to continue.');

    setToken(token);
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    await sessionUtil.removeToken();
  }, []);

  const setInitialToken = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const { token: initialToken, expiresIn } = await sessionUtil.getToken();
    if (initialToken && expiresIn <= 0) {
      showAlert('Your session expired, please log in again to continue.');
      setToken(null);
    } else {
      setToken(initialToken);
    }
  };

  const setTokenTimeout = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!token) return;

    const { expiresIn } = sessionUtil.getTokenData(token);
    if (expiresIn <= 0) {
      await signOut();
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      await signOut();
      showAlert('Your session expired, please log in again to continue.');
    }, expiresIn);
  };

  useEffect(() => {
    setTokenTimeout();
  }, [token]);

  useForegroundEffect(() => {
    setTokenTimeout();
  });

  useEffect(() => {
    setInitialToken();
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      signIn,
      signOut,
      invitation,
      setInvitation,
      isNeedToUpdate,
      setIsNeedToUpdate,
    }),
    [token, signIn, signOut, invitation, isNeedToUpdate],
  );

  return <DefaultAuthContext.Provider value={contextValue}>{children}</DefaultAuthContext.Provider>;
};
