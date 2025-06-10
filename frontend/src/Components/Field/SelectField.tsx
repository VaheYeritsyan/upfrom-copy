import React from 'react';
import { StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useController } from 'react-hook-form';
import type { UseControllerProps, FieldValues } from 'react-hook-form';
import type { PickerSelectProps } from 'react-native-picker-select';
import { Container } from './Container';
import type { ContainerProps } from './Container';
import { inputStyles, inputContainerStyles } from './inputStyles';
import { colors } from '~Theme/Colors';

const styles = StyleSheet.create({
  input: inputStyles,
  inputContainer: inputContainerStyles,
});

type SelectFieldProps<T extends FieldValues> = Pick<PickerSelectProps, 'items' | 'placeholder'> &
  UseControllerProps<T> &
  Pick<ContainerProps, 'label' | 'radius'>;

export function SelectField<T extends FieldValues>({
  items,
  name,
  defaultValue,
  rules,
  control,
  label,
  radius = 'all',
}: SelectFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, rules, defaultValue, control });

  return (
    <Container label={label} radius={radius} error={error?.message} floatLabel isArrowVisible>
      <RNPickerSelect
        placeholder={{ value: '', label: 'Not selected' }}
        value={value}
        onValueChange={onChange}
        items={items}
        textInputProps={{
          placeholderTextColor: colors.grey400,
        }}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
          inputAndroidContainer: styles.inputContainer,
          inputIOSContainer: styles.inputContainer,
        }}
        useNativeAndroidPickerStyle={false}
      />
    </Container>
  );
}
