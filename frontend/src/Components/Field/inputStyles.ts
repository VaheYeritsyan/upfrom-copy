import { TextStyle, Platform } from 'react-native';
import { typography } from '~Theme/Typography';
import { colors } from '~Theme/Colors';

const isIOS = Platform.OS === 'ios';

export const inputStyles: TextStyle = {
  color: colors.black,
  ...(isIOS
    ? {
        paddingTop: 28,
      }
    : {
        minHeight: 56,
        height: 16,
        paddingTop: 14,
      }),
  // Height is needed for android
  paddingLeft: 0,
  marginRight: 16,
  paddingBottom: 0,
  ...typography.body2SemiBold,
};

export const inputContainerStyles = {
  paddingRight: 40,
  flex: 1,
  minHeight: 54,
};

export const inputMultilineStyles: TextStyle = {
  paddingTop: 28,
  paddingBottom: 12,
  ...(isIOS
    ? {}
    : {
        height: 16,
      }),
};

export const inputDisabledStyles: TextStyle = {
  color: colors.grey400,
};
