import { StyleSheet, Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

export const effects = StyleSheet.create({
  shadow1: isIOS
    ? {
        shadowColor: 'hsla(200, 6%, 9%, 0.04)',
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
      }
    : {
        elevation: 2,
      },
  shadow2: isIOS
    ? {
        shadowRadius: 32,
        shadowOffset: { width: 10, height: 12 },
        shadowColor: 'hsla(200, 6%, 9%, 0.1)',
        shadowOpacity: 5,
      }
    : {
        elevation: 2,
      },
  shadow3: isIOS
    ? {
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowColor: 'hsla(200, 6%, 9%, 0.1)',
        shadowOpacity: 5,
      }
    : {
        elevation: 2,
      },
});
