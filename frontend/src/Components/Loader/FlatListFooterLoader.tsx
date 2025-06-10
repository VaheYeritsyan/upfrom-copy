import React, { FC } from 'react';
import { ViewProps, View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '~Theme/Colors';

type Props = ViewProps & {
  isLoading?: boolean;
};

export const FlatListFooterLoader: FC<Props> = ({ style, isLoading, ...props }) =>
  isLoading ? (
    <View {...props} style={[styles.container, style]}>
      <ActivityIndicator size="small" color={colors.primaryMain} />
    </View>
  ) : null;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
