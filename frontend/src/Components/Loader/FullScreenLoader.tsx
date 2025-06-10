import React, { FC } from 'react';
import { ViewProps, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';

type Props = ViewProps;

export const FullScreenLoader: FC<Props> = ({ style, ...props }) => (
  <SafeAreaView {...props} style={[styles.container, style]}>
    <ActivityIndicator size={32} color={colors.primaryMain} />
    <Typography variant="body2Medium">Loading</Typography>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
});
