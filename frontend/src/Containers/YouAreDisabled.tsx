import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Typography } from '~Components/Typography';
import { ContainedButton } from '~Components/ContainedButton';
import { MainLayout } from '~Components/MainLayout';
import { colors } from '~Theme/Colors';
import { openInfoEmailInMail } from '~utils/links';
import { Image } from '~Components/Image/Image';

const disableIcon = require('~assets/images/account-is-disabled.png');

export function YouAreDisabled() {
  return (
    <MainLayout
      containerStyle={styles.container}
      stickyBottomContainerStyle={styles.stickyBottomContainer}
      stickyBottomContent={<ContainedButton text="Contact Us" color="black" onPress={openInfoEmailInMail} />}>
      <View style={styles.body}>
        <View style={styles.imageContainer}>
          <Image resizeMode="contain" style={styles.image} source={disableIcon} />
        </View>
        <Typography align="center" variant="h1">
          Account
        </Typography>
        <Typography align="center" variant="h1" errorGradient>
          Disabled
        </Typography>
        <Typography style={styles.bodyText} align="center" variant="h6">
          We're sorry, but your UpFrom account has been temporarily disabled. If you believe this is an error or need
          assistance, please contact us for further assistance.
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
    flex: 1,
  },
  bodyText: {
    marginTop: 14,
    maxWidth: 260,
    marginHorizontal: 25,
    color: colors.grey400,
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
