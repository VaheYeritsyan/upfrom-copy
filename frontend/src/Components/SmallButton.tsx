import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import React from 'react';
import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';
import { effects } from '~Theme/Effects';
import type { TouchableOpacityProps } from 'react-native';

type SmallButtonProps = TouchableOpacityProps & {
  text: string;
  state: 'active' | 'inactive' | 'disabled';
};

export function SmallButton({ text, state = 'inactive', ...rest }: SmallButtonProps) {
  return (
    <TouchableOpacity
      disabled={state === 'disabled' ? true : false}
      {...rest}
      style={[styles.container, styles[`${state}Container`]]}>
      <Text style={[styles.text, styles[`${state}Text`]]}>{text}</Text>
    </TouchableOpacity>
  );
}

const greyBorder = {
  borderColor: colors.grey200,
  borderWidth: 0.5,
  // borderWidth: 0.5,
};

const styles = StyleSheet.create({
  text: {
    ...typography.body3Medium,
  },
  activeText: {
    color: 'white',
  },
  inactiveText: {
    color: colors.grey500,
  },
  disabledText: {
    color: colors.grey400,
  },
  activeContainer: {
    backgroundColor: colors.primaryMain,
  },
  inactiveContainer: {
    backgroundColor: 'white',
    ...greyBorder,
  },
  disabledContainer: {
    backgroundColor: colors.grey200,
    ...greyBorder,
  },
  container: {
    justifyContent: 'center',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 100,
    ...effects.shadow1,
  },
});
