import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { MainLayout } from '~Components/MainLayout';
import { colors } from '~Theme/Colors';
import { openStorePage } from '~utils/links';
import { Image } from '~Components/Image/Image';

const updateYourApp = require('~assets/images/update_your_app.png');

export function UpdateYourApp() {
  return (
    <MainLayout
      containerStyle={styles.container}
      stickyBottomContainerStyle={styles.stickyBottomContainer}
      stickyBottomContent={<ContainedButton text="Update Now" color="blueGradient" onPress={openStorePage} />}>
      <View style={styles.body}>
        <View style={styles.imageContainer}>
          <Image resizeMode="contain" style={styles.image} source={updateYourApp} />
        </View>
        <Typography align="center" variant="h1" primaryGradient>
          Important Update
        </Typography>
        <Typography align="center" variant="h1">
          Required
        </Typography>
        <Typography style={styles.bodyText} align="center" variant="h6">
          We've made significant changes to improve your UpFrom experience. However, your current app version is not
          compatible with these updates.
        </Typography>
        <Typography style={styles.bodyText2} align="center" variant="h6">
          Please update your app to the latest version to continue using UpFrom without interruption.
        </Typography>
      </View>
    </MainLayout>
  );
}

const deviceWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  body: {
    marginTop: 75,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bodyText: {
    marginTop: 14,
    maxWidth: 260,
    marginHorizontal: 25,
    color: colors.grey400,
  },
  bodyText2: {
    marginTop: 14,
    maxWidth: 260,
    marginHorizontal: 25,
    color: colors.primaryLight,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  imageContainer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: deviceWidth / 2,
    height: deviceWidth / 2,
    aspectRatio: 1,
  },
  footerText: {
    maxWidth: 280,
    color: colors.grey400,
  },
  linkText: {
    color: colors.primaryMain,
  },
});
