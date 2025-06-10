import React, { FC } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '~Theme/Colors';

type Props = ViewProps & {
  marginVertical?: number;
};

export const Divider: FC<Props> = ({ style, marginVertical = 32, ...props }) => (
  <View {...props} style={[styles.divider, { marginVertical }, style]} />
);

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.grey200,
  },
});
