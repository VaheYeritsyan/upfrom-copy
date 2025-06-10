import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { TickCircle } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';

interface CheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handlePress = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={handlePress}>
      {!isChecked && <View style={styles.checkbox} />}
      {isChecked && <TickCircle color={colors.primaryMain} variant="Bold" size={20} style={styles.icon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 14,
    borderColor: colors.grey200,
  },
  icon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 14,
    borderColor: colors.primaryMain,
  },
});
