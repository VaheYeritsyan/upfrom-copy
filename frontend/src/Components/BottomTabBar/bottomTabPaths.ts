import { NavigationState } from '@react-navigation/routers';
import { Screens, Stacks } from '~types/navigation';

// There is no export for type Route from RN packages.
export type Route = NavigationState['routes'][0];

export const getCurrentScreenPath = <T extends Route = Route>(route?: T, parentPath = ''): string => {
  if (!route) return '';
  if (!route.state || typeof route.state.index === 'undefined') return `${parentPath}${route.name}`;

  return getCurrentScreenPath(route.state.routes[route.state.index] as T, `${parentPath}${route.name}.`);
};

export const pathsWithoutBottomTabBar = new Set([
  `${Stacks.HOME}.${Screens.MESSAGES_CHANNEL}`,
  `${Stacks.HOME}.${Screens.MESSAGES_SEARCH}`,
  `${Stacks.HOME}.${Screens.REPLY_THREAD}`,
  `${Stacks.HOME}.${Screens.EDIT_PROFILE}`,
  `${Stacks.HOME}.${Screens.NOTIFICATIONS_SETTINGS}`,
  `${Stacks.HOME}.${Screens.EVENT_DETAILS}`,
  `${Stacks.HOME}.${Screens.EDIT_EVENT}`,

  `${Stacks.MESSENGER}.${Screens.MESSAGES_CHANNEL}`,
  `${Stacks.MESSENGER}.${Screens.MESSAGES_SEARCH}`,
  `${Stacks.MESSENGER}.${Screens.REPLY_THREAD}`,
  `${Stacks.MESSENGER}.${Screens.EDIT_PROFILE}`,
  `${Stacks.MESSENGER}.${Screens.NOTIFICATIONS_SETTINGS}`,

  `${Stacks.PROFILE}.${Screens.MESSAGES_CHANNEL}`,
  `${Stacks.PROFILE}.${Screens.MESSAGES_SEARCH}`,
  `${Stacks.PROFILE}.${Screens.REPLY_THREAD}`,
  `${Stacks.PROFILE}.${Screens.EDIT_PROFILE}`,
  `${Stacks.PROFILE}.${Screens.NOTIFICATIONS_SETTINGS}`,

  `${Stacks.EVENTS}.${Screens.CREATE_EVENT}`,
  `${Stacks.EVENTS}.${Screens.EVENT_ASSIGNEES}`,
  `${Stacks.EVENTS}.${Screens.EVENT_LOCATION}`,
  `${Stacks.EVENTS}.${Screens.EVENT_DETAILS}`,
  `${Stacks.EVENTS}.${Screens.EDIT_EVENT}`,
  `${Stacks.EVENTS}.${Screens.EVENTS_SEARCH}`,
  `${Stacks.EVENTS}.${Screens.MESSAGES_CHANNEL}`,
  `${Stacks.EVENTS}.${Screens.MESSAGES_SEARCH}`,
  `${Stacks.EVENTS}.${Screens.EDIT_PROFILE}`,
  `${Stacks.EVENTS}.${Screens.NOTIFICATIONS_SETTINGS}`,
]);
