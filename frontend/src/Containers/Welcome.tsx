import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '~Theme/Colors';
import { Image } from '~Components/Image/Image';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { useAuthContext } from '~Hooks/useAuthContext';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList, Screens } from '~types/navigation';
import { MainLayout } from '~Components/MainLayout';

type WelcomeProps = BottomTabScreenProps<MainStackParamList, Screens.WELCOME>;

const welcomeImage = require('~assets/images/splash-screen.png');

export function Welcome({ navigation, route: { params } }: WelcomeProps) {
  const { setInvitation } = useAuthContext();
  const teamId = params?.teamId;
  const type = params?.type;
  useEffect(() => {
    if (teamId && type) {
      setInvitation({ teamId, type });
    }
  }, [teamId, type, setInvitation]);

  return (
    <MainLayout
      containerStyle={styles.container}
      stickyBottomContainerStyle={styles.stickyBottomContainer}
      stickyBottomContent={
        <ContainedButton color="black" onPress={() => navigation.navigate(Screens.EMAIL_VERIFICATION)} text="Start" />
      }>
      <View style={styles.content}>
        <Typography align="center" variant="h1">
          Team Up,{'\n'}Change Lives
        </Typography>
        <Typography style={styles.body} align="center" variant="paragraph1">
          UpFrom empowers people to magnify mentorship by leveraging the power of teams
        </Typography>
        <Image resizeMode="contain" style={styles.image} source={welcomeImage} />
      </View>
    </MainLayout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: 50,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '80%',
  },
  image: {
    width: undefined,
    height: undefined,
    aspectRatio: 1,
  },
  body: {
    marginHorizontal: 15,
    color: colors.grey400,
  },
  buttonSection: {
    paddingHorizontal: 24,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
