import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { Channel, StreamChat } from 'stream-chat';
import { DefaultStreamChatGenerics } from 'stream-chat-react-native';
import { Screens, Stacks } from '~types/navigation';
import { NotificationMetadata } from '@up-from/services/src/push/notification-data';

export const navigationRef = createNavigationContainerRef();

const stacksWithEventDetails = new Set([Stacks.EVENTS, Stacks.HOME]);
const stacksWithMessenger = new Set([Stacks.EVENTS, Stacks.HOME, Stacks.PROFILE, Stacks.MESSENGER]);

export const navigateToEvent = (eventId: string) => {
  if (!navigationRef?.isReady()) return;

  const state = navigationRef.getState();
  if (!state) return;

  const tabsStack = state.routes.find(({ name }) => name === Stacks.TABS);
  if (!tabsStack?.state) return;
  const currentStack = tabsStack.state.routes[tabsStack.state.index!];

  if (stacksWithEventDetails.has(currentStack.name as Stacks)) {
    navigationRef.dispatch(CommonActions.navigate(Screens.EVENT_DETAILS, { eventId }));
  } else {
    const routes = state.routes.map(route => {
      if (route.name !== Stacks.TABS) return route;

      const routes = [
        // @ts-ignore
        ...route.state?.routes.filter(({ name }) => name !== Stacks.EVENTS),
        {
          name: Stacks.EVENTS,
          state: {
            index: 1,
            routes: [{ name: Screens.EVENTS }, { name: Screens.EVENT_DETAILS, params: { eventId } }],
          },
        },
      ];

      return {
        ...route,
        state: {
          ...route.state,
          index: routes.length - 1,
          routes,
        },
      };
    });

    navigationRef.dispatch(CommonActions.reset({ ...state, routes }));
  }
};

export const navigateToUser = (userId: string) => {
  if (!navigationRef?.isReady()) return;

  const state = navigationRef.getState();
  if (!state) return;

  const tabsStack = state.routes.find(({ name }) => name === Stacks.TABS);
  if (!tabsStack?.state) return;

  navigationRef.dispatch(CommonActions.navigate(Screens.USER_PROFILE, { userId }));
};

export const navigateToTeam = (teamId: string) => {
  if (!navigationRef?.isReady()) return;

  const state = navigationRef.getState();
  if (!state) return;

  const tabsStack = state.routes.find(({ name }) => name === Stacks.TABS);
  if (!tabsStack?.state) return;

  navigationRef.dispatch(CommonActions.navigate(Screens.TEAM_DETAILS, { teamId }));
};

export const navigateToMessengerChannel = async (
  id?: string,
  type?: string,
  chatClient?: StreamChat | null,
  setChannel?: (chanel: Channel<DefaultStreamChatGenerics> | null) => void,
) => {
  if (!navigationRef?.isReady() || !id || !type || !chatClient) return;

  const channels = await chatClient.queryChannels({ id, type });
  if (!channels[0]) return;
  setChannel?.(channels[0]);

  const state = navigationRef.getState();
  if (!state) return;

  const tabsStack = state.routes.find(({ name }) => name === Stacks.TABS);
  if (!tabsStack?.state) return;
  const currentStack = tabsStack.state.routes[tabsStack.state.index!];

  if (stacksWithMessenger.has(currentStack.name as Stacks)) {
    navigationRef.dispatch(CommonActions.navigate(Screens.MESSAGES_CHANNEL));
  } else {
    const routes = state.routes.map(route => {
      if (route.name !== Stacks.TABS) return route;

      const routes = [
        // @ts-ignore
        ...route.state?.routes.filter(({ name }) => name !== Stacks.MESSENGER),
        {
          name: Stacks.MESSENGER,
          state: {
            index: 1,
            routes: [{ name: Screens.MESSENGER }, { name: Screens.MESSAGES_CHANNEL }],
          },
        },
      ];

      return {
        ...route,
        state: {
          ...route.state,
          index: routes.length - 1,
          routes,
        },
      };
    });

    navigationRef.dispatch(CommonActions.reset({ ...state, routes }));
  }
};

export const navigateToNotificationEntity = async ({
  chatId,
  teamId,
  userId,
  eventId,
}: NotificationMetadata & { chatId?: string }) => {
  if (eventId) navigateToEvent(eventId);
  if (userId) navigateToUser(userId);
  if (teamId) navigateToTeam(teamId);
  if (chatId) await navigateToMessengerChannel(chatId);
};
