import React, { ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';
import { effects } from '~Theme/Effects';
import { ArrowDown2 } from 'iconsax-react-native';

const leftSpacing = 16;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderColor: colors.grey200,
    minHeight: 56,
    borderWidth: 1,
    ...effects.shadow1,
    paddingLeft: leftSpacing,
  },
  icon: {
    position: 'absolute',
    right: leftSpacing,
    top: 19,
  },
  label: {
    flex: 1,
    paddingRight: 16,
    position: 'absolute',
    color: colors.grey400,
    left: leftSpacing,
  },
  labelDisabled: {
    color: colors.grey300,
  },
  labelUnfloated: {
    top: 20,
    ...typography.body2Medium,
  },
  labelError: {
    color: colors.danger,
  },
  labelFloated: {
    top: 12,
    ...typography.body3Medium,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
});

const radiusStyles = {
  all: { borderRadius: 6 },
  top: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0.5,
  },
  bottom: {
    borderTopWidth: 0.5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  none: { borderRadius: 0, borderBottomWidth: 0.5, borderTopWidth: 0.5 },
};

export type ContainerProps = {
  radius?: 'none' | 'all' | 'top' | 'bottom';
  isDisabled?: boolean;
  label: string;
  floatLabel: boolean;
  error?: string;
  children: ReactNode;
  isArrowVisible?: boolean;
};

export function Container({
  radius = 'all',
  label,
  error,
  isDisabled,
  floatLabel,
  children,
  isArrowVisible,
}: ContainerProps) {
  return (
    <View style={[styles.container, radiusStyles[radius], !!error && styles.errorBorder]}>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          floatLabel ? styles.labelFloated : styles.labelUnfloated,
          isDisabled && styles.labelDisabled,
          !!error && styles.labelError,
        ]}>
        {label}
        {error ? ` • ${error}` : null}
      </Text>
      {isArrowVisible ? <ArrowDown2 style={styles.icon} color={colors.grey400} size={18} /> : null}
      {children}
    </View>
  );
}
