import React, { FC } from 'react';
import { StyleSheet, View, ViewProps, TextProps } from 'react-native';
import { IconProps } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { Typography, TypographyProps } from '~Components/Typography';

export type FeatureProps = ViewProps & {
  Icon: FC<IconProps>;
  children: TextProps['children'];
  iconVariant?: IconProps['variant'];
  typographyVariant?: TypographyProps['variant'];
  size?: number;
  color?: string;
  textColor?: string;
};

export const Feature: FC<FeatureProps> = ({
  Icon,
  iconVariant,
  typographyVariant = 'body1Medium',
  size,
  color,
  textColor,
  children,
  ...props
}) => (
  <View {...props} style={[styles.container, props.style]}>
    <Icon
      style={styles.icon}
      size={size ? size : 24}
      color={color ? color : colors.primaryMain}
      variant={iconVariant}
    />
    <Typography
      style={[
        styles.text,
        {
          color: textColor ? textColor : colors.grey500,
        },
      ]}
      numberOfLines={1}
      variant={typographyVariant}>
      {children}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
});
