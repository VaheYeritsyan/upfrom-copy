import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '~Theme/Colors';
import { Typography } from '~Components/Typography';

type Props = {
  title: string;
  height?: number;
};

export const EmptyPlaceholder: FC<Props> = ({ title, height = 200 }) => (
  <View style={[styles.container, { height }]}>
    <Typography style={styles.text} align="center" variant="h6">
      {title}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.grey300,
  },
  text: {
    color: colors.grey400,
    width: 220,
  },
});
