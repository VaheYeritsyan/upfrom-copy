import secureLocalStorage from 'react-secure-storage';
import jwtDecode from 'jwt-decode';
import { Pages } from '~/constants/pages';

const SESSION_TOKEN = 'token';
const REDIRECT_URL = 'redirectUrl';

export const setToken = (value: string, key = SESSION_TOKEN) => {
  secureLocalStorage.setItem(key, value);

  const decodedToken = jwtDecode(value as string) as Record<string, number>;
  const expiresIn = decodedToken.exp * 1000 - Date.now();

  return { token: value as string, expiresIn };
};

export const removeToken = (key = SESSION_TOKEN) => {
  return secureLocalStorage.removeItem(key);
};

export const getToken = (key = SESSION_TOKEN) => {
  const token = secureLocalStorage.getItem(key);
  if (!token) return { token: null, expiresIn: 0 };

  const decodedToken = jwtDecode(token as string) as Record<string, number>;
  const expiresIn = decodedToken.exp * 1000 - Date.now();

  if (expiresIn <= 0) {
    removeToken();
    return { token: null, expiresIn: 0 };
  }

  return { token: token as string, expiresIn };
};

export const setRedirectUrl = (value?: string | null, key = REDIRECT_URL) => {
  if (!value) return;

  return localStorage.setItem(key, value);
};

export const removeRedirectUrl = (key = REDIRECT_URL) => {
  return localStorage.removeItem(key);
};

export const getRedirectUrl = (key = REDIRECT_URL) => {
  const url = localStorage.getItem(key) || Pages.DASHBOARD;
  removeRedirectUrl(key);

  return url;
};
