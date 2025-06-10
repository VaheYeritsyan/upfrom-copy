import React, { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ProfileCircle } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';

export type Props = {
  style?: StyleProp<ViewStyle>;
  size: number;
};

const borderWidth = 2;

export const getAvatarImageProfileBadge =
  (color: string = colors.primaryMain): FC<Props> =>
  ({ style, size }) => {
    const containerSize = useMemo(() => size + borderWidth * 2, [size]);
    const borderRadius = useMemo(() => containerSize / 2, [containerSize]);

    return (
      <View style={[styles.container, style, { width: containerSize, height: containerSize, borderRadius }]}>
        <ProfileCircle variant="Bulk" color={color} size={size} />
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
