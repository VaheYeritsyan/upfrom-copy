import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { Home2, MenuBoard, MessageQuestion, MessageText } from 'iconsax-react-native';
import { Stacks } from '~types/navigation';
import { getCurrentScreenPath, pathsWithoutBottomTabBar } from '~Components/BottomTabBar/bottomTabPaths';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { getInitials } from '~utils/textFormat';
import { BottomTabBarButton } from '~Components/BottomTabBar/BottomTabBarButton';
import { AvatarImage } from '~Components/Avatar/AvatarImage';
import { effects } from '~Theme/Effects';
import { colors } from '~Theme/Colors';
import { useEventActionsModalsContext } from '~Hooks/useEventActionsModalsContext';
import { useBottomNavigationBadgesContext } from '~Hooks/useBottomNavigationBadgesContext';
import { openFeedbackInWeb } from '~utils/links';
import { SubmitFeedbackModal } from '~Components/BottomTabBar/SubmitFeedbackModal';
import { useOrganizationModalsContext } from '~Hooks/useOrganizationContext';

export const BottomTabBar: FC<BottomTabBarProps> = ({ state, navigation, insets }) => {
  const initialValue = 100 + insets.bottom;
  const translateY = useRef(new Animated.Value(initialValue)).current;
  const { isEventsBadgeVisible, isMessengerBadgeVisible } = useBottomNavigationBadgesContext();
  const { attendingEventMeta, respondingEventMeta, notAttendingEventMeta } = useEventActionsModalsContext();
  const { organizationMeta } = useOrganizationModalsContext();

  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);

  const { currentUser } = useCurrentUserContext();

  const currentRoute = state.routes[state.index];
  const currentRouteName = currentRoute?.name;
  const currentRoutePath = getCurrentScreenPath(currentRoute);

  const initials = currentUser?.avatarUrl ? null : getInitials(`${currentUser?.firstName} ${currentUser?.lastName}`);

  const isBottomBarVisible = useMemo(() => {
    if (
      respondingEventMeta ||
      attendingEventMeta ||
      notAttendingEventMeta ||
      isFeedbackModalVisible ||
      organizationMeta
    )
      return false;

    return !pathsWithoutBottomTabBar.has(currentRoutePath);
  }, [
    currentRoutePath,
    attendingEventMeta,
    respondingEventMeta,
    notAttendingEventMeta,
    isFeedbackModalVisible,
    organizationMeta,
  ]);

  const isHomeActive = currentRouteName === Stacks.HOME;
  const isEventsActive = currentRouteName === Stacks.EVENTS;
  const isMessengerActive = currentRouteName === Stacks.MESSENGER;
  // const isNotificationsActive = currentRouteName === Stacks.NOTIFICATIONS;
  const isProfileActive = currentRouteName === Stacks.PROFILE;

  useEffect(() => {
    const timing = Animated.timing(translateY, {
      toValue: isBottomBarVisible ? 0 : initialValue,
      duration: 300,
      useNativeDriver: true,
    });

    timing.start();

    return timing.stop;
  }, [translateY, isBottomBarVisible, initialValue]);

  const getNewState = (stack: Stacks) => {
    const state = navigation.getState();

    const route = state.routes[state.index];
    if (!route?.name || route?.name !== stack || !route.state?.routes?.length) return null;

    return {
      ...state,
      routes: state.routes.map(stackRoute => {
        if (stackRoute.name !== stack) return stackRoute;

        return { ...stackRoute, state: { index: 0, routes: [stackRoute.state?.routes[0]] } };
      }),
    };
  };

  const navigate = (stack: Stacks) => {
    const newState = getNewState(stack);

    if (newState) {
      navigation.dispatch(CommonActions.reset(newState));
    } else {
      navigation.navigate(stack);
    }
  };

  const handleHomeClick = () => {
    navigate(Stacks.HOME);
  };

  const handleEventsClick = () => {
    navigate(Stacks.EVENTS);
  };

  const handleMessengerClick = () => {
    navigate(Stacks.MESSENGER);
  };

  // const handleNotificationsClick = () => {
  //   navigate(Stacks.NOTIFICATIONS);
  // };

  const handleProfileClick = () => {
    navigate(Stacks.PROFILE);
  };

  const handleFeedBackClick = () => {
    setIsFeedbackModalVisible(true);
  };

  const handleFeedbackModalClose = () => {
    setIsFeedbackModalVisible(false);
  };

  const handleSubmitFeedbackPress = () => {
    setIsFeedbackModalVisible(false);

    // InteractionManager doesn't help here.
    setTimeout(() => {
      openFeedbackInWeb();
    }, 300);
  };

  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
        <BottomTabBarButton style={styles.buttonLeft} Icon={Home2} isActive={isHomeActive} onPress={handleHomeClick} />
        <BottomTabBarButton
          Icon={MenuBoard}
          isBadgeVisible={isEventsBadgeVisible}
          isActive={isEventsActive}
          onPress={handleEventsClick}
        />
        <BottomTabBarButton
          Icon={MessageText}
          isBadgeVisible={isMessengerBadgeVisible}
          isActive={isMessengerActive}
          onPress={handleMessengerClick}
        />
        {/*<BottomTabBarButton*/}
        {/*  Icon={NotificationBing}*/}
        {/*  isActive={isNotificationsActive}*/}
        {/*  isBadgeVisible*/}
        {/*  onPress={handleNotificationsClick}*/}
        {/*/>*/}
        <BottomTabBarButton isActive={isProfileActive} onPress={handleProfileClick}>
          <AvatarImage url={currentUser?.avatarUrl} initials={initials} type="circle" size={24} />
        </BottomTabBarButton>
        <BottomTabBarButton
          style={styles.buttonRight}
          Icon={MessageQuestion}
          iconColor={colors.purpleGradientStart}
          onPress={handleFeedBackClick}
        />
      </Animated.View>

      <SubmitFeedbackModal
        isVisible={isFeedbackModalVisible}
        onSubmitFeedbackPress={handleSubmitFeedbackPress}
        onClose={handleFeedbackModalClose}
      />
    </>
  );
};

const screenWidth = Dimensions.get('window').width;
const bottomTabWidth = 292;
const sideMargin = (screenWidth - bottomTabWidth) / 2;

const styles = StyleSheet.create({
  container: {
    ...effects.shadow1,
    position: 'absolute',
    bottom: 36,
    left: sideMargin,
    right: sideMargin,
    backgroundColor: colors.white,
    width: bottomTabWidth,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonLeft: {
    paddingLeft: 26,
  },
  buttonRight: {
    paddingRight: 23,
  },
});
