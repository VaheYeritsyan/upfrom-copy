import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewProps } from 'react-native';
import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';

type SelectorProps<OptionType> = {
  style?: ViewProps['style'];
  options: OptionType[];
  isDisabled?: boolean;
  activeBgColors?: (null | undefined | string)[];
  activeColors?: (null | undefined | string)[];
  selectedOption: OptionType;
  onOptionSelected: (option: OptionType) => void;
};

export function Selector<OptionType extends string>({
  style,
  options,
  selectedOption,
  isDisabled,
  activeBgColors,
  activeColors,
  onOptionSelected,
}: SelectorProps<OptionType>) {
  const handleOptionSelect = (option: OptionType) => {
    onOptionSelected(option);
  };

  return (
    <View style={[styles.toggleContainer, style]}>
      {options.map((option, idx) => {
        const backgroundColor = activeBgColors?.[idx] || styles.itemActive.backgroundColor;
        const color = activeColors?.[idx] || styles.toggleTextActive.color;

        return (
          <TouchableOpacity
            style={option === selectedOption ? [styles.itemActive, { backgroundColor }] : styles.itemInActive}
            onPress={() => handleOptionSelect(option)}
            disabled={isDisabled}
            activeOpacity={isDisabled ? 1 : 0.6}
            key={option}>
            <Text style={option === selectedOption ? [styles.toggleTextActive, { color }] : styles.toggleTextInActive}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.grey200,
    height: 52,
    borderRadius: 26,
    borderWidth: 0.5,
    borderColor: colors.grey300,
    paddingHorizontal: 10,
  },
  itemActive: {
    display: 'flex',
    justifyContent: 'space-around',
    alignContent: 'center',
    alignItems: 'center',
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    flex: 1,
  },
  itemInActive: {
    display: 'flex',
    justifyContent: 'space-around',
    alignContent: 'center',
    alignItems: 'center',
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    flex: 1,
  },
  toggleTextActive: {
    color: colors.grey600,
    alignSelf: 'center',
    ...typography.body3Medium,
  },
  toggleTextInActive: {
    color: colors.grey500,
    alignSelf: 'center',
    ...typography.body3Medium,
  },
});
