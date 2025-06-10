import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Pages } from '~/constants/pages';
import * as sessionStorageUtil from '~/util/storage/session';
import { isBrowser } from '~/util/common';
import { useToast } from '~/hooks/useToast';
import { SessionLoadingComponent } from '~/components/Loading/SessionLoadingComponent';

interface IAuthContext {
  token: string | null;
  logIn: (token: string) => void;
  logOut: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const { push } = useRouter();

  const timeout = useRef<NodeJS.Timeout | null>();

  const [token, setToken] = useState<string | null>();
  const { showError } = useToast();

  const setAuthTimeoutForLogOut = useCallback((expiresIn: number) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    timeout.current = setTimeout(() => {
      setToken(null);
      showError('Your session expired, please log in again to continue.', expiresIn);
    }, expiresIn);
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;

    const { token: storedToken, expiresIn } = sessionStorageUtil.getToken();
    if (storedToken && expiresIn > 0) setAuthTimeoutForLogOut(expiresIn);
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (typeof token === 'undefined') return;

    if (token) {
      const { expiresIn } = sessionStorageUtil.setToken(token);
      if (expiresIn > 0) setAuthTimeoutForLogOut(expiresIn);
    } else {
      if (!Pages.isPublic(pathname)) sessionStorageUtil.setRedirectUrl(pathname);
      sessionStorageUtil.removeToken();
      push(Pages.LOGIN);
    }
  }, [token]);

  const logIn = useCallback((token: string) => {
    setToken(token);
    push(sessionStorageUtil.getRedirectUrl());
  }, []);

  const logOut = useCallback(() => {
    setToken(null);
  }, []);

  const contextValue: IAuthContext = useMemo(() => ({ token: token ?? null, logIn, logOut }), [token, logIn, logOut]);

  const isLoadingVisible = useMemo(() => {
    return typeof token === 'undefined' || (!token && !Pages.isPublic(pathname));
  }, [token, pathname]);

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoadingVisible ? <SessionLoadingComponent /> : children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuthContext should be used only inside <AuthContextProvider>');
  }

  return { ...authContext };
};
