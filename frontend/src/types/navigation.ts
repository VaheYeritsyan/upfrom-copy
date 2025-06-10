import { Event } from '@up-from/graphql/genql';
import { InvitationProps } from '~Context/AuthContext';
import { ImagePickerData } from '~types/imagePicker';
import { EventsFilter } from '~types/event';

export enum Stacks {
  AUTH = 'AuthStack',
  TABS = 'TabsStack',
  COMPLETE_REGISTRATION = 'CompleteRegistrationStack',
  HOME = 'HomeStack',
  EVENTS = 'EventsStack',
  MESSENGER = 'MessengerStack',
  NOTIFICATIONS = 'NotificationsStack',
  PROFILE = 'ProfileStack',
}

export enum Screens {
  HOME = 'Home',
  WELCOME = 'Welcome',
  PHONE_AUTH = 'PhoneAuth',
  AUTH_REDIRECT = 'AuthRedirect',
  COMPLETE_SIGN_UP = 'CompleteSignUp',
  YOU_ARE_DISABLED = 'YouAreDisabled',
  UPDATE_YOUR_APP = 'UpdateYourApp',
  DETAILS = 'Details',
  TEAMS = 'Teams',
  MESSENGER = 'Messenger',
  REPLY_THREAD = 'ReplyThread',
  MESSAGES_CHANNEL = 'MessagesChannel',
  MESSAGES_SEARCH = 'MessagesSearch',
  EMAIL_VERIFICATION = 'EmailVerification',
  TEAM_DETAILS = 'TeamDetails',
  USER_PROFILE = 'UserProfile',
  OWN_PROFILE = 'OwnProfile',
  PROFILE_SETTINGS = 'ProfileSettings',
  EDIT_PROFILE = 'EditProfile',
  EVENTS = 'Events',
  CREATE_EVENT = 'CreateEvent',
  EVENT_ASSIGNEES = 'EventAssignees',
  EVENT_LOCATION = 'EventLocation',
  EVENT_INVITATIONS = 'EventInvitations',
  EVENT_DETAILS = 'EventDetails',
  EDIT_EVENT = 'EditEvent',
  PAST_EVENTS = 'PastEvents',
  EVENTS_SEARCH = 'EventsSearch',
  NOTIFICATIONS_SETTINGS = 'NotificationSettings',
}

export type MainStackParamList = {
  [Stacks.TABS]: undefined;

  // Extra screens
  [Screens.EMAIL_VERIFICATION]: undefined;
  [Screens.COMPLETE_SIGN_UP]: undefined;
  [Screens.YOU_ARE_DISABLED]: undefined;
  [Screens.UPDATE_YOUR_APP]: undefined;
  [Screens.AUTH_REDIRECT]: { token: string };
  [Screens.WELCOME]: InvitationProps | undefined;
  [Screens.PHONE_AUTH]: undefined;
};

export type TabStackParamList = {
  [Stacks.COMPLETE_REGISTRATION]: undefined;
  [Stacks.HOME]: undefined;
  [Stacks.EVENTS]: undefined;
  [Stacks.MESSENGER]: undefined;
  [Stacks.NOTIFICATIONS]: undefined;
  [Stacks.PROFILE]: undefined;
};

export type HomeStackParamList = TabStackParamList & {
  [Screens.HOME]: undefined;
  [Screens.DETAILS]: undefined;
  [Screens.MESSENGER]: undefined;
  [Screens.MESSAGES_CHANNEL]: undefined | { messageId: string };
  [Screens.MESSAGES_SEARCH]: undefined | { query: string };
  [Screens.REPLY_THREAD]: undefined | { messageId: string };
  [Screens.USER_PROFILE]: { userId: string };
  [Screens.TEAMS]: undefined;
  [Screens.TEAM_DETAILS]: { teamId: string };
  [Screens.OWN_PROFILE]: undefined;
  [Screens.PROFILE_SETTINGS]: undefined;
  [Screens.EDIT_PROFILE]: undefined;
  [Screens.NOTIFICATIONS_SETTINGS]: undefined;
  [Screens.EVENT_DETAILS]: { eventId: string; withCalendarModal?: boolean };
  [Screens.EDIT_EVENT]: { eventId: string };
};

export type EventsStackParamList = TabStackParamList & {
  [Screens.EVENTS]: { eventsFilter?: EventsFilter };
  [Screens.CREATE_EVENT]: undefined;
  [Screens.EVENT_ASSIGNEES]: Pick<Event, 'title' | 'description' | 'startsAt' | 'endsAt' | 'address'> & {
    imageData: ImagePickerData | null;
  };
  [Screens.EVENT_LOCATION]: EventsStackParamList[Screens.EVENT_ASSIGNEES] & {
    invitedIds?: string[];
    isOwnerAttending: boolean | null;
    isIndividual: boolean;
    teamId: string | null;
  };
  [Screens.EVENT_DETAILS]: { eventId: string; withCalendarModal?: boolean };
  [Screens.MESSENGER]: undefined;
  [Screens.MESSAGES_CHANNEL]: undefined | { messageId: string };
  [Screens.MESSAGES_SEARCH]: undefined | { query: string };
  [Screens.REPLY_THREAD]: undefined | { messageId: string };
  [Screens.USER_PROFILE]: { userId: string };
  [Screens.TEAM_DETAILS]: { teamId: string };
  [Screens.PROFILE_SETTINGS]: undefined;
  [Screens.EDIT_PROFILE]: undefined;
  [Screens.NOTIFICATIONS_SETTINGS]: undefined;
  [Screens.EVENT_INVITATIONS]: undefined;
  [Screens.EDIT_EVENT]: { eventId: string };
  [Screens.PAST_EVENTS]: undefined | { eventsFilter?: EventsFilter };
  [Screens.EVENTS_SEARCH]: undefined | { query: string };
};

export type MessengerStackParamList = TabStackParamList & {
  [Screens.MESSENGER]: undefined;
  [Screens.MESSAGES_CHANNEL]: undefined | { messageId: string };
  [Screens.MESSAGES_SEARCH]: undefined | { query: string };
  [Screens.REPLY_THREAD]: undefined | { messageId: string };
  // Making navigation smooth
  [Screens.USER_PROFILE]: { userId: string };
  [Screens.TEAM_DETAILS]: { teamId: string };
  [Screens.PROFILE_SETTINGS]: undefined;
  [Screens.EDIT_PROFILE]: undefined;
  [Screens.NOTIFICATIONS_SETTINGS]: undefined;
};

export type NotificationsStackParamList = TabStackParamList & {
  [Screens.HOME]: undefined;
  [Screens.DETAILS]: undefined;
};

export type ProfileStackParamList = TabStackParamList & {
  [Screens.OWN_PROFILE]: undefined;
  [Screens.PROFILE_SETTINGS]: undefined;
  [Screens.EDIT_PROFILE]: undefined;
  [Screens.NOTIFICATIONS_SETTINGS]: undefined;
  [Screens.USER_PROFILE]: { userId: string };
  [Screens.TEAM_DETAILS]: { teamId: string };
  [Screens.MESSENGER]: undefined;
  [Screens.MESSAGES_CHANNEL]: undefined | { messageId: string };
  [Screens.MESSAGES_SEARCH]: undefined | { query: string };
  [Screens.REPLY_THREAD]: undefined | { messageId: string };
};
