import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList, Screens, Stacks } from '~types/navigation';
import { EmailVerification } from '~Containers/Auth/EmailVerification';
import { CompleteSignUp } from '~Containers/CompleteSignUp';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { TabsStack } from '~Navigators/TabsStack';
import { AuthRedirect } from '~Containers/AuthRedirect';
import { Welcome } from '~Containers/Welcome';
import { PhoneAuth } from '~Containers/Auth/PhoneAuth';
import { navigationRef } from '~utils/navigation';
import { YouAreDisabled } from '~Containers/YouAreDisabled';
import { UpdateYourApp } from '~Containers/UpdateYourApp';
import { useAuthContext } from '~Hooks/useAuthContext';

const Stack = createStackNavigator<MainStackParamList>();

export function Application() {
  const { currentUser, isLoading: isCurrentUserLoading } = useCurrentUserContext();
  const { isNeedToUpdate } = useAuthContext();

  if (isCurrentUserLoading) {
    // TODO: Add global loading screen for reuse. should probably be set with initialRouteName
    return null;
  }

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        linking={{
          prefixes: ['upfrom://'],
          config: {
            screens: {
              [Screens.AUTH_REDIRECT]: { path: 'auth-redirect' },
              [Screens.WELCOME]: {
                path: 'invite/:type/:teamId',
              },
            },
          },
        }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isNeedToUpdate ? <Stack.Screen name={Screens.UPDATE_YOUR_APP} component={UpdateYourApp} /> : null}

          {currentUser && !isNeedToUpdate ? (
            <>
              {currentUser.isDisabled ? (
                <Stack.Screen name={Screens.YOU_ARE_DISABLED} component={YouAreDisabled} />
              ) : null}
              {!currentUser.profile?.phone ? <Stack.Screen name={Screens.PHONE_AUTH} component={PhoneAuth} /> : null}
              {!currentUser.profile?.isSignupCompleted ? (
                <Stack.Screen name={Screens.COMPLETE_SIGN_UP} component={CompleteSignUp} />
              ) : null}
              {currentUser.isDisabled ? null : <Stack.Screen name={Stacks.TABS} component={TabsStack} />}
            </>
          ) : (
            <>
              <Stack.Screen name={Screens.WELCOME} component={Welcome} />
              <Stack.Screen name={Screens.EMAIL_VERIFICATION} component={EmailVerification} />
            </>
          )}

          {!currentUser?.profile?.phone ? <Stack.Screen name={Screens.AUTH_REDIRECT} component={AuthRedirect} /> : null}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
