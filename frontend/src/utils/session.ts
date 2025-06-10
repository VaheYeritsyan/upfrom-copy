import EncryptedStorage from 'react-native-encrypted-storage';
import jwt from 'jwt-decode';
import { UserTokenData } from '~types/userTokenData';

const STORAGE_KEY = 'token';

export const getTokenData = (token?: string | null) => {
  if (!token) return { tokenData: null, expiresIn: 0 };

  const tokenData = jwt<UserTokenData>(token);
  const expiresIn = tokenData?.exp ? tokenData.exp * 1000 - Date.now() : 0;

  return { tokenData, expiresIn };
};

export const setToken = async (value: string, key = STORAGE_KEY) => {
  const { expiresIn } = getTokenData(value);
  if (expiresIn <= 0) return { token: null, expiresIn: expiresIn };

  await EncryptedStorage.setItem(key, value);
  return { token: value, expiresIn };
};

export const removeToken = async (key = STORAGE_KEY) => {
  try {
    await EncryptedStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const getToken = async (key = STORAGE_KEY) => {
  const emptyResult = { token: null, tokenData: null, expiresIn: 0 };

  const token = await EncryptedStorage.getItem(key);
  if (!token) return emptyResult;

  const { tokenData, expiresIn } = getTokenData(token);
  if (expiresIn <= 0) {
    await removeToken(key);
    return { ...emptyResult, token, expiresIn };
  }

  return { token, tokenData, expiresIn };
};
