import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NotificationsStackParamList, Screens, Stacks, TabStackParamList } from '~types/navigation';
import { Home } from '~Containers/Home/Home';
import { Details } from '~Containers/Details';

type Props = BottomTabScreenProps<TabStackParamList, Stacks.NOTIFICATIONS>;

// TODO: Replace with related  screens once they're implemented
const Stack = createStackNavigator<NotificationsStackParamList>();
export const NotificationsStack: FC<Props> = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Screens.HOME} component={Home} />
    <Stack.Screen name={Screens.DETAILS} component={Details} options={{ title: 'Overview' }} />
  </Stack.Navigator>
);
