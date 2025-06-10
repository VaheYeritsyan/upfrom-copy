import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList, Screens } from '~types/navigation';
import { useAuthContext } from '~Hooks/useAuthContext';

type AuthRedirectProps = BottomTabScreenProps<MainStackParamList, Screens.AUTH_REDIRECT>;

export function AuthRedirect({
  route: {
    params: { token },
  },
}: AuthRedirectProps) {
  const { signIn } = useAuthContext();

  useEffect(() => {
    signIn(token);
  }, [token]);

  return (
    <View style={styles.container}>
      <Text>Authenticating</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
