import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';
import { Image } from '~Components/Image/Image';

type TopSectionProps = { activeStep: 'phoneNumber' | 'email' };

export function TopSection({ activeStep }: TopSectionProps) {
  return (
    <>
      <View style={styles.container}>
        <Typography align="center" variant="h1">
          Verify your
        </Typography>
        <Typography style={styles.headingText} align="center" variant="h1" primaryGradient>
          Identity
        </Typography>
        {activeStep === 'phoneNumber' && (
          <>
            <Typography style={styles.successText} primaryGradient align="center" variant="h5">
              Email Successfully Verified
            </Typography>
            <Typography variant="paragraph1" align="center" style={styles.bodyText}>
              To complete the verification we’ll text a Link to your Phone Number. Standard message and data rates
              apply.
            </Typography>
          </>
        )}
        {activeStep === 'email' && (
          <>
            <Typography variant="paragraph1" align="center" style={styles.bodyText}>
              We'll send a Link to the E-mail Address provided below.
            </Typography>
          </>
        )}
      </View>
      <View style={styles.imageContainer}>
        <Image resizeMode="contain" style={styles.image} source={require('~assets/images/magic-link.png')} />
      </View>
    </>
  );
}

const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  successText: {
    marginBottom: 16,
  },
  headingText: {
    marginBottom: 24,
  },
  bodyText: {
    color: colors.grey400,
    marginHorizontal: 50,
    width: 262,
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: deviceWidth / 2.5,
    height: deviceWidth / 2.5,
    aspectRatio: 1,
    marginBottom: 12,
  },
});
