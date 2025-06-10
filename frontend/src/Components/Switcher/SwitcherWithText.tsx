import React, { FC } from 'react';
import { StyleProp, ViewStyle, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Selector } from '~Components/Selector';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';

export type Props = {
  style?: StyleProp<ViewStyle>;
  title: string;
  subtitle: string;
  value: boolean;
  onChange?: (value: boolean) => void;
};

enum Options {
  OFF = 'Off',
  ON = 'On',
}
const options = Object.values(Options);

export const SwitcherWithText: FC<Props> = ({ style, value, title, subtitle, onChange }) => {
  const selectedOption = value ? Options.ON : Options.OFF;

  const handlePress = () => {
    onChange?.(!value);
  };

  const handleOptionSelect = (option: Options) => {
    onChange?.(option === Options.ON);
  };

  return (
    <TouchableOpacity style={[styles.switcher, style]} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.switcherContent}>
        <Typography variant="body1Medium">{title}</Typography>
        <Typography style={styles.switcherContentGrey} variant="body3Medium">
          {subtitle}
        </Typography>
      </View>

      <Selector
        style={styles.switcherSelector}
        options={options}
        selectedOption={selectedOption}
        activeColors={[null, colors.white]}
        activeBgColors={[colors.white, colors.primaryMain]}
        onOptionSelected={handleOptionSelect}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switcher: {
    paddingVertical: 20,
    gap: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switcherContent: {
    maxWidth: 238,
    flex: 1,
    gap: 2,
  },
  switcherContentGrey: {
    color: colors.grey500,
  },
  switcherSelector: {
    padding: 2,
    maxWidth: 104,
    minWidth: 104,
    height: 40,
    paddingHorizontal: 4,
  },
});
