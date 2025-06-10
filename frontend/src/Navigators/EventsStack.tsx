import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EventsStackParamList, Screens, Stacks, TabStackParamList } from '~types/navigation';
import { CreateEvent } from '~Containers/Events/CreateEvent';
import { Events } from '~Containers/Events/Events';
import { EventAssignees } from '~Containers/Events/EventAssingnees';
import { ProfileSettings } from '~Containers/Profile/ProfileSettings';
import { EditProfile } from '~Containers/Profile/EditProfile';
import { TeamDetails } from '~Containers/Teams/TeamDetails';
import { UserProfile } from '~Containers/Profile/UserProfile';
import { Messenger } from '~Containers/Messages/Messenger';
import { MessagesChannel } from '~Containers/Messages/MessagesChannel';
import { ReplyThread } from '~Containers/Messages/ReplyThread';
import { EventLocation } from '~Containers/Events/EventLocation';
import { EventInvitations } from '~Containers/Events/EventInvitations';
import { EventDetails } from '~Containers/Events/EventDetails';
import { EditEvent } from '~Containers/Events/EditEvent';
import { PastEvents } from '~Containers/Events/PastEvents';
import { EventsSearch } from '~Containers/Events/EventsSearch';
import { NotificationsSettings } from '~Containers/Profile/NotificationsSettings';
import { MessagesSearch } from '~Containers/Messages/MessagesSearch';

type Props = BottomTabScreenProps<TabStackParamList, Stacks.EVENTS>;

const Stack = createStackNavigator<EventsStackParamList>();
export const EventsStack: FC<Props> = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Screens.EVENTS} component={Events} />
    <Stack.Screen name={Screens.CREATE_EVENT} component={CreateEvent} />
    <Stack.Screen name={Screens.EVENT_ASSIGNEES} component={EventAssignees} />
    <Stack.Screen name={Screens.EVENT_LOCATION} component={EventLocation} />
    <Stack.Screen name={Screens.EVENT_INVITATIONS} component={EventInvitations} />
    <Stack.Screen name={Screens.EVENT_DETAILS} component={EventDetails} />
    <Stack.Screen name={Screens.EDIT_EVENT} component={EditEvent} />
    <Stack.Screen name={Screens.PROFILE_SETTINGS} component={ProfileSettings} />
    <Stack.Screen name={Screens.EDIT_PROFILE} component={EditProfile} />
    <Stack.Screen name={Screens.TEAM_DETAILS} component={TeamDetails} />
    <Stack.Screen name={Screens.USER_PROFILE} component={UserProfile} />
    <Stack.Screen name={Screens.MESSENGER} component={Messenger} />
    <Stack.Screen name={Screens.MESSAGES_CHANNEL} component={MessagesChannel} />
    <Stack.Screen name={Screens.MESSAGES_SEARCH} component={MessagesSearch} />
    <Stack.Screen name={Screens.REPLY_THREAD} component={ReplyThread} />
    <Stack.Screen name={Screens.PAST_EVENTS} component={PastEvents} />
    <Stack.Screen name={Screens.EVENTS_SEARCH} component={EventsSearch} />
    <Stack.Screen name={Screens.NOTIFICATIONS_SETTINGS} component={NotificationsSettings} />
  </Stack.Navigator>
);
