import { ToastShowParams } from 'react-native-toast-message';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Danger } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';

type ErrorToastProps = {
  toastProps: ToastShowParams;
};

export function CustomErrorToast(props: ErrorToastProps) {
  const { toastProps } = props;

  return (
    <TouchableOpacity
      style={errorAlertStyles.alertToastContainer}
      activeOpacity={toastProps.onPress ? 0.8 : 1}
      onPress={toastProps.onPress}
      disabled={!toastProps.onPress}>
      <LinearGradient
        colors={[colors.dangerMain, colors.dangerLight]}
        useAngle={true}
        angle={135}
        style={errorAlertStyles.alertToast}>
        <View key={toastProps.props.errorText} style={errorAlertStyles.alertContent}>
          <View style={errorAlertStyles.iconBackground}>
            <Danger color={colors.grey100} variant="Bold" size={18} style={errorAlertStyles.icon} />
          </View>
          <Text style={errorAlertStyles.alertText1Style}>{toastProps.props.errorText}</Text>
        </View>

        <View style={errorAlertStyles.bottomLine} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const errorAlertStyles = StyleSheet.create({
  alertToastContainer: {
    width: '85%',
  },
  alertToast: {
    backgroundColor: '#FF2020',
    borderWidth: 0,
    borderRadius: 15,
  },
  alertContent: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },

  iconBackground: {
    backgroundColor: colors.alertIconBackground,
    width: 36,
    height: 36,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  icon: {
    alignItems: 'center',
  },

  bottomLine: {
    backgroundColor: colors.grey100,
    width: '15%',
    height: 5,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  alertText1Style: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
    color: colors.grey100,
    marginRight: 8,
  },
});
