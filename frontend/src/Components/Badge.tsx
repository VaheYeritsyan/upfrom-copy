import React, { FC } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '~Theme/Colors';
import { Variant } from '~Theme/Typography';
import { Typography } from '~Components/Typography';

export type BadgeProps = ViewProps & {
  text: string;
  textVariant?: Variant;
  textTransform?: 'none' | 'uppercase';
  textColor?: string;
  bgColor?: string;
};

export const Badge: FC<BadgeProps> = ({
  text,
  textColor = colors.white,
  textTransform = 'uppercase',
  bgColor = colors.black,
  textVariant = 'label2Bold',
  ...props
}) => (
  <View {...props} style={[styles.badgeContainer, { backgroundColor: bgColor }, props.style]}>
    <Typography style={{ textTransform, color: textColor }} variant={textVariant}>
      {text}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  badgeContainer: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
});
