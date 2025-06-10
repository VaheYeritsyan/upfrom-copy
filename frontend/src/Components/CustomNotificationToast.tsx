import { ToastShowParams } from 'react-native-toast-message';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MessageNotif } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { navigateToNotificationEntity } from '~utils/navigation';
import { Typography } from '~Components/Typography';
import { hideToast } from '~utils/toasts';

type MessageToastProps = {
  toastProps: ToastShowParams;
};

export function CustomNotificationToast(props: MessageToastProps) {
  const { toastProps } = props;

  const userId = toastProps.props.userId;
  const teamId = toastProps.props.teamId;
  const eventId = toastProps.props.eventId;

  const handlePress = async () => {
    await navigateToNotificationEntity({ eventId, teamId, userId });
    hideToast();
  };

  return (
    <TouchableOpacity style={errorAlertStyles.alertToastContainer} activeOpacity={0.6} onPress={handlePress}>
      <LinearGradient
        colors={[colors.primaryMain, colors.primaryLight]}
        useAngle={true}
        angle={135}
        style={errorAlertStyles.alertToast}>
        <View key={toastProps.props.content} style={errorAlertStyles.alertContent}>
          <View style={errorAlertStyles.iconBackground}>
            <MessageNotif color={colors.grey100} variant="Bold" size={18} style={errorAlertStyles.icon} />
          </View>
          <View style={errorAlertStyles.alertTextContent}>
            <Typography variant="paragraph2" style={errorAlertStyles.alertText1Style}>
              {toastProps.props.title}
            </Typography>
          </View>
        </View>

        <View style={errorAlertStyles.bottomLine} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const errorAlertStyles = StyleSheet.create({
  alertToastContainer: {
    width: '85%',
    backgroundColor: colors.primaryMain,
    borderWidth: 0,
    borderRadius: 15,
    overflow: 'hidden',
  },
  alertToast: {
    backgroundColor: colors.primaryMain,
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

  alertTextContent: {
    flex: 1,
  },

  alertText1Style: {
    flex: 1,
    color: colors.white,
    marginRight: 8,
  },
});
