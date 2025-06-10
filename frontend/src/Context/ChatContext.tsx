import React, { createContext, ReactNode, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { DefaultStreamChatGenerics, MessageType } from 'stream-chat-react-native';
import Config from 'react-native-config';
import { useAuthContext } from '~Hooks/useAuthContext';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { AxiosError } from 'axios';
import { Channel, DefaultGenerics, StreamChat } from 'stream-chat';
import { showAlert, showNotification } from '~utils/toasts';
import messaging from '@react-native-firebase/messaging';
import { setBadgeCount } from 'react-native-notification-badge';
import { showMessage } from '~utils/toasts';
import { useDeviceApi } from '~Hooks/useDeviceApi';
import { navigateToNotificationEntity, navigationRef } from '~utils/navigation';
import { Screens } from '~types/navigation';
import { getTokenData } from '~utils/session';

interface IChatContext {
  channel: Channel<DefaultStreamChatGenerics> | null;
  setChannel: (chanel: Channel<DefaultStreamChatGenerics> | null) => void;
  thread: MessageType<DefaultStreamChatGenerics> | null;
  setThread: (thread: MessageType<DefaultStreamChatGenerics> | null) => void;
  clientIsReady: boolean;
  setClientIsReady: (clientIsReady: boolean) => void;
  chatClient: StreamChat<DefaultGenerics> | null;
  unreadCount: number;
}

export const ChatContext = createContext<IChatContext>({
  channel: null,
  setChannel: () => {},
  thread: null,
  setThread: () => {},
  clientIsReady: false,
  setClientIsReady: () => {},
  chatClient: null,
  unreadCount: 0,
});

const screensWithoutNotificationAlerts = new Set([Screens.MESSAGES_CHANNEL, Screens.REPLY_THREAD]);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [channel, setChannel] = useState<Channel<DefaultStreamChatGenerics> | null>(null);
  const [thread, setThread] = useState<MessageType<DefaultStreamChatGenerics> | null>(null);
  const [clientIsReady, setClientIsReady] = useState(false);
  const chatClient = StreamChat.getInstance(Config.STREAM_CHAT_API_KEY ?? '');

  const deviceApi = useDeviceApi();
  const { token } = useAuthContext();
  const { currentUser, refresh: refreshCurrentUser } = useCurrentUserContext();
  const userData = getTokenData(token).tokenData;
  const [unreadCount, setUnreadCount] = useState(0);

  const unsubscribeTokenRefreshListenerRef = useRef<() => void>();

  const isAndroid = Platform.OS === 'android';

  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (isAndroid) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    if (enabled) {
      // console.log('Authorization status:', authStatus);
    }
  };

  const registerPushToken = async () => {
    // unsubscribe any previous listener
    unsubscribeTokenRefreshListenerRef.current?.();
    await messaging().registerDeviceForRemoteMessages(); // Register device
    const msgToken = await messaging().getToken();

    const removeOldToken = async () => {
      const oldToken = await deviceApi.getDeviceId();
      if (oldToken !== null) {
        await Promise.all([chatClient.removeDevice(oldToken), deviceApi.removeDevice(oldToken)]);
      }
    };

    await deviceApi.addDevice(msgToken);

    unsubscribeTokenRefreshListenerRef.current = messaging().onTokenRefresh(async newToken => {
      await Promise.all([removeOldToken(), deviceApi.addDevice(newToken)]);
    });
  };

  const disconnectUser = useCallback(() => {
    chatClient.disconnectUser();
    setClientIsReady(false);
  }, []);

  const connectUser = useCallback(async () => {
    if (!currentUser || !userData || chatClient.userID) return;

    const user = {
      id: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      image: currentUser.avatarUrl,
    };

    const userResponse = await chatClient.connectUser(user, userData.properties.chatToken);
    // @ts-ignore
    setUnreadCount(userResponse.me.total_unread_count);
    setClientIsReady(true);

    chatClient.on('user.deactivated', ({ user }) => {
      if (!user?.deactivated_at) return;

      refreshCurrentUser();
    });
  }, [currentUser, userData, chatClient.userID]);

  useEffect(() => {
    if (currentUser && !currentUser.isDisabled && !chatClient.userID) {
      const clearBadge = async () => {
        if (isAndroid) return;
        await setBadgeCount(0);
      };
      clearBadge();
      const setupClient = async () => {
        try {
          if (userData !== null && userData.properties.chatToken) {
            await requestPermission();
            await registerPushToken();
            await connectUser();
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            let message: string;
            try {
              message = error.response?.data?.message?.replaceAll('"', '') || 'Something went wrong';
            } catch {
              message = error.message;
            }

            showAlert(message);
            console.log(`An error occurred while connecting the user: ${error.message}`);
          }
        }
      };

      const init = async () => {
        await setupClient();
      };
      if (!chatClient.userID) {
        init();
      }

      chatClient.on(event => {
        if (event.total_unread_count !== undefined) {
          setUnreadCount(event.total_unread_count);
        }
      });
    }
  }, [chatClient, clientIsReady, currentUser, userData]);

  useEffect(() => {
    messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data && remoteMessage.data.id && navigationRef?.isReady()) {
        const currentRouteName = navigationRef.getCurrentRoute()?.name as Screens;
        if (currentRouteName && screensWithoutNotificationAlerts.has(currentRouteName)) return;

        const message = await chatClient.getMessage(remoteMessage.data.id.toString());
        const channelId = message.message.channel?.id;
        const channelType = message.message.channel?.type;
        if (channelId === channel?.id && channelType === channel?.type) return;

        showMessage(
          `New message from ${message.message.user?.name}`,
          message.message.text?.slice(0, 100) ?? '',
          channelType,
          channelId,
        );
      } else if (remoteMessage.data && remoteMessage.notification) {
        showNotification(remoteMessage.notification.body!, remoteMessage.data);
      }
    });
  }, [channel?.id]);

  useEffect(() => {
    if (!navigationRef?.isReady()) return;

    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage?.data) {
          const { userId, teamId, eventId } = remoteMessage.data;
          const chatId = typeof remoteMessage.data.id === 'string' ? remoteMessage.data.id : undefined;

          await navigateToNotificationEntity({
            userId: userId.toString(),
            teamId: teamId.toString(),
            eventId: eventId.toString(),
            chatId,
          });
        }
      });
  }, [navigationRef?.isReady()]);

  useEffect(() => {
    if (!token) {
      disconnectUser();
    }
  }, [disconnectUser, token]);

  useEffect(() => {
    return disconnectUser;
  }, [chatClient]);

  const contextValue = useMemo(
    () => ({
      channel,
      setChannel,
      thread,
      setThread,
      clientIsReady,
      setClientIsReady,
      unreadCount,
      chatClient,
    }),
    [channel, setChannel, thread, setThread, clientIsReady, setClientIsReady, chatClient, unreadCount],
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => React.useContext(ChatContext);
