import React, { FC } from 'react';
import { StyleSheet, View, TextProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ArrowRight2, IconProps } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { Typography } from '~Components/Typography';
import { Variant } from '~Theme/Typography';

type Props = TouchableOpacityProps & {
  Icon: FC<IconProps>;
  children: TextProps['children'];
  iconColor?: string;
  iconVariant?: IconProps['variant'];
  textVariant?: Variant;
  textColor?: string;
};

export const ActionMenuItem: FC<Props> = ({
  Icon,
  children,
  style,
  activeOpacity = 0.6,
  iconVariant = 'Bulk',
  iconColor = colors.grey600,
  textVariant = 'body1Medium',
  textColor = colors.black,
  disabled,
  ...props
}) => (
  <TouchableOpacity
    {...props}
    style={[styles.container, disabled && styles.containerDisabled, style]}
    activeOpacity={activeOpacity}
    disabled={disabled}>
    <View style={styles.containerContent}>
      <Icon size={24} color={iconColor} variant={iconVariant} />
      <Typography style={{ color: textColor }} variant={textVariant}>
        {children}
      </Typography>
    </View>

    <ArrowRight2 size={18} color={colors.grey400} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.grey200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  containerDisabled: {
    opacity: 0.6,
  },

  containerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
});
