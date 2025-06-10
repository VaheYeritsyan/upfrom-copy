import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, Stacks, TabStackParamList } from '~types/navigation';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStack } from '~Navigators/HomeStack';
import { EventsStack } from '~Navigators/EventsStack';
import { MessengerStack } from '~Navigators/MessengerStack';
import { NotificationsStack } from '~Navigators/NotificationsStack';
import { ProfileStack } from '~Navigators/ProfileStack';
import { BottomTabBar } from '~Components/BottomTabBar/BottomTabBar';

type Props = StackScreenProps<MainStackParamList, Stacks.TABS>;

const renderBottomTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

const Tab = createBottomTabNavigator<TabStackParamList>();
export const TabsStack: FC<Props> = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: {}, lazy: true }} tabBar={renderBottomTabBar}>
      <Tab.Screen name={Stacks.HOME} component={HomeStack} />
      <Tab.Screen name={Stacks.EVENTS} component={EventsStack} />
      <Tab.Screen name={Stacks.MESSENGER} component={MessengerStack} />
      <Tab.Screen name={Stacks.NOTIFICATIONS} component={NotificationsStack} />
      <Tab.Screen name={Stacks.PROFILE} component={ProfileStack} />
    </Tab.Navigator>
  );
};
