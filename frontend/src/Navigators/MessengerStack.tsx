import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MessengerStackParamList, Screens, Stacks, TabStackParamList } from '~types/navigation';
import { TeamDetails } from '~Containers/Teams/TeamDetails';
import { UserProfile } from '~Containers/Profile/UserProfile';
import { Messenger } from '~Containers/Messages/Messenger';
import { MessagesChannel } from '~Containers/Messages/MessagesChannel';
import { ReplyThread } from '~Containers/Messages/ReplyThread';
import { ProfileSettings } from '~Containers/Profile/ProfileSettings';
import { EditProfile } from '~Containers/Profile/EditProfile';
import { NotificationsSettings } from '~Containers/Profile/NotificationsSettings';
import { MessagesSearch } from '~Containers/Messages/MessagesSearch';

type Props = BottomTabScreenProps<TabStackParamList, Stacks.MESSENGER>;

const Stack = createStackNavigator<MessengerStackParamList>();
export const MessengerStack: FC<Props> = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Screens.MESSENGER} component={Messenger} />
    <Stack.Screen name={Screens.MESSAGES_CHANNEL} component={MessagesChannel} />
    <Stack.Screen name={Screens.MESSAGES_SEARCH} component={MessagesSearch} />
    <Stack.Screen name={Screens.REPLY_THREAD} component={ReplyThread} />
    <Stack.Screen name={Screens.TEAM_DETAILS} component={TeamDetails} />
    <Stack.Screen name={Screens.USER_PROFILE} component={UserProfile} />
    <Stack.Screen name={Screens.PROFILE_SETTINGS} component={ProfileSettings} />
    <Stack.Screen name={Screens.EDIT_PROFILE} component={EditProfile} />
    <Stack.Screen name={Screens.NOTIFICATIONS_SETTINGS} component={NotificationsSettings} />
  </Stack.Navigator>
);
