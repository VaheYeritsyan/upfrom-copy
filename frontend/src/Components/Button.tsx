import { StyleSheet, Text, View, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import React, { ReactNode } from 'react';
import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';
import LinearGradient from 'react-native-linear-gradient';
import { effects } from '~Theme/Effects';

export type ButtonProps = TouchableOpacityProps & {
  text: string;
  color?:
    | 'black'
    | 'blue'
    | 'white'
    | 'danger'
    | 'whiteDanger'
    | 'grey'
    | 'lightGrey'
    | 'blueGradient'
    | 'purpleGradient';
  shape?: 'pill' | 'rectangle';
  size?: 'small' | 'medium' | 'large';
  primaryGradient?: boolean;
  fullWidth?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

const gradientColors = {
  blueGradient: [colors.primaryMainGradientStart, colors.primaryMainGradientEnd],
  purpleGradient: [colors.purpleGradientStart, colors.purpleGradientEnd],
};

export function Button({
  text,
  style,
  color = 'blue',
  disabled,
  shape = 'pill',
  size = 'small',
  fullWidth = false,
  startAdornment,
  endAdornment,
  activeOpacity = 0.6,
  ...rest
}: ButtonProps) {
  function buttonColor() {
    if (disabled) {
      return styles.disabledButton;
    } else if (color !== 'blueGradient' && color !== 'purpleGradient') {
      return styles[`${color}Button`];
    }
  }

  const gradientColor = gradientColors[color as keyof typeof gradientColors];

  return (
    <View style={[!fullWidth && styles.span, !disabled && styles.shadow]}>
      <TouchableOpacity disabled={disabled} activeOpacity={activeOpacity} {...rest}>
        {gradientColor && !disabled ? (
          <LinearGradient style={[styles[size], styles[shape], style]} colors={gradientColor} useAngle angle={135}>
            {startAdornment}
            <Text style={[styles.text, styles[`${size}Text`]]}>{text}</Text>
            {endAdornment}
          </LinearGradient>
        ) : (
          <View style={[styles[shape], styles[size], buttonColor(), style]}>
            {startAdornment}
            <Text
              style={[
                styles.text,
                styles[`${size}Text`],
                color === 'white' && styles.whiteContrastText,
                color === 'whiteDanger' && styles.whiteDangerText,
                color === 'danger' && styles.dangerText,
                color === 'grey' && styles.greyText,
                color === 'lightGrey' && styles.lightGreyText,
                disabled && styles.disabledText,
              ]}>
              {text}
            </Text>
            {endAdornment}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...effects.shadow1,
  },
  span: {
    flexDirection: 'row',
  },
  rectangle: {
    borderRadius: 6,
  },
  pill: {
    borderRadius: 26,
  },
  blueButton: {
    backgroundColor: colors.primaryMain,
  },
  blackButton: {
    backgroundColor: colors.black,
  },
  whiteButton: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: colors.grey200,
  },
  whiteDangerButton: {
    backgroundColor: 'white',
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  greyButton: {
    backgroundColor: colors.grey200,
  },
  lightGreyButton: {
    backgroundColor: colors.grey200,
  },
  disabledButton: {
    backgroundColor: colors.grey200,
  },
  disabledText: {
    color: colors.grey400,
  },
  whiteContrastText: {
    color: colors.grey600,
  },
  largeText: {
    ...typography.body1SemiBold,
  },
  mediumText: {
    ...typography.body1SemiBold,
  },
  smallText: {
    ...typography.body3Medium,
  },
  text: { textAlign: 'center', color: 'white' },
  whiteDangerText: { color: colors.danger },
  dangerText: { color: colors.white },
  greyText: { color: colors.grey600 },
  lightGreyText: { color: colors.grey400 },
  small: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  large: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});
