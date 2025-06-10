import Toast from 'react-native-toast-message';

import { NotificationMetadata } from '@up-from/services/src/push/notification-data';

export const showAlert = (alertText: string, onPress?: () => void) => {
  Toast.show({
    type: 'errorAlert',
    topOffset: 60,
    onPress,
    props: {
      errorText: alertText,
    },
  });
};

export const hideToast = () => {
  Toast.hide();
};

export const showMessage = (title: string, content: string, channelType?: string, channelId?: string) => {
  Toast.show({
    type: 'messageAlert',
    topOffset: 60,
    props: {
      title,
      content,
      channelType,
      channelId,
    },
  });
};

export const showNotification = (title: string, metadata: NotificationMetadata) => {
  Toast.show({
    type: 'notificationAlert',
    topOffset: 60,
    props: {
      title,
      ...metadata,
    },
  });
};
