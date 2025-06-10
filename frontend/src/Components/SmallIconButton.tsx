import React, { FC } from 'react';
import { TouchableOpacityProps, TouchableOpacity, StyleSheet } from 'react-native';
import { IconProps } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { Typography, TypographyProps } from '~Components/Typography';

type Props = Omit<TouchableOpacityProps, 'children'> & {
  Icon: FC<IconProps>;
  text: string;
  iconSize?: IconProps['size'];
  iconVariant?: IconProps['variant'];
  iconColor?: string;
  textVariant?: TypographyProps['variant'];
  textColor?: string;
  isBordered?: boolean;
};

export const SmallIconButton: FC<Props> = ({
  Icon,
  isBordered,
  style,
  disabled,
  iconSize = 16,
  iconColor = colors.primaryMain,
  iconVariant = 'Linear',
  textVariant = 'body3Medium',
  textColor = colors.grey600,
  activeOpacity = 0.8,
  text,
  ...props
}) => {
  const disabledColor = colors.grey400;

  return (
    <TouchableOpacity
      {...props}
      style={[styles.container, isBordered && styles.containerBordered, style, disabled && styles.containerDisabled]}
      disabled={disabled}
      activeOpacity={activeOpacity}>
      <Icon size={iconSize} color={disabled ? disabledColor : iconColor} variant={iconVariant} />
      <Typography variant={textVariant} style={{ color: disabled ? disabledColor : textColor }}>
        {text}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...effects.shadow1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    gap: 8,
  },
  containerBordered: {
    borderWidth: 0.5,
    borderColor: colors.grey200,
    borderStyle: 'solid',
  },
  containerDisabled: {
    backgroundColor: colors.grey200,
    borderColor: colors.grey200,
  },
});
