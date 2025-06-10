import { getBuildNumber, getVersion } from 'react-native-device-info';
import { Platform } from 'react-native';

const headerKeys: { [K in typeof Platform.OS]?: string } = {
  android: 'x-app-android-min-version',
  ios: 'x-app-ios-min-version',
};

export const validateAppMinVersion = (headers: Response['headers']) => {
  const headerKey = headerKeys[Platform.OS];
  if (!headerKey) return false;

  return headers.get(headerKey)! > getVersion() + ' ' + '(' + getBuildNumber() + ')';
};
