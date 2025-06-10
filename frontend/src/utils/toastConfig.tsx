import { ToastShowParams } from 'react-native-toast-message';
import React from 'react';
import { CustomErrorToast } from '~Components/CustomErrorToast';
import { CustomMessageToast } from '~Components/CustomMessageToast';
import { CustomNotificationToast } from '~Components/CustomNotificationToast';

/*
  1. Create the config
*/
export const toastConfig = {
  errorAlert: (props: ToastShowParams) => <CustomErrorToast toastProps={props} />,
  messageAlert: (props: ToastShowParams) => <CustomMessageToast toastProps={props} />,
  notificationAlert: (props: ToastShowParams) => <CustomNotificationToast toastProps={props} />,
};
