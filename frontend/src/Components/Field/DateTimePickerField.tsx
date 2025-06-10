import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity as TouchableOpacityRN, Platform } from 'react-native';
import { TouchableOpacity as TouchableOpacityGH } from 'react-native-gesture-handler';
import { useController } from 'react-hook-form';
import { Container } from './Container';
import { inputStyles, inputContainerStyles } from './inputStyles';
import DateTimePickerModal, { DateTimePickerProps } from 'react-native-modal-datetime-picker';
import type { ContainerProps } from './Container';
import type { UseControllerProps, FieldValues } from 'react-hook-form';
import { getFullTextDate, getFullTextDateAndTime, getFullTextDateTime } from '~utils/dateFormat';
import { colors } from '~Theme/Colors';

const styles = StyleSheet.create({
  input: inputStyles,
  inputContainer: inputContainerStyles,
});

type DateTimePickerFieldProps<T extends FieldValues> = UseControllerProps<T> &
  Pick<ContainerProps, 'label' | 'radius'> &
  Pick<DateTimePickerProps, 'mode' | 'maximumDate' | 'minimumDate'>;

const isIOS = Platform.OS === 'ios';
const TouchableOpacity = isIOS ? TouchableOpacityGH : TouchableOpacityRN;

export function DateTimePickerField<T extends FieldValues>({
  rules,
  control,
  name,
  defaultValue,
  radius,
  label,
  mode,
  maximumDate,
  minimumDate,
}: DateTimePickerFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, rules, defaultValue, control });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleConfirm = (date: typeof value) => {
    onChange(date);
    setShowDatePicker(false);
  };

  const dateInputValue = useMemo(() => {
    if (!value) return undefined;

    return new Date(value);
  }, [value]);

  const textInputValue = useMemo(() => {
    if (!value) return undefined;

    switch (mode) {
      case 'date':
        return getFullTextDate(value);
      case 'time':
        return getFullTextDateTime(value);
      default:
        return getFullTextDateAndTime(value);
    }
  }, [mode, value]);

  return (
    <Container label={label} error={error?.message} radius={radius} floatLabel isArrowVisible>
      {/* have to redundantly add pressability to handl differing ios/android behavior */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer} activeOpacity={1}>
        <TextInput
          editable={false}
          onPressOut={() => setShowDatePicker(true)}
          value={textInputValue}
          style={styles.input}
          onChangeText={() => null}
          placeholder="Not Selected"
          placeholderTextColor={colors.grey400}
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode={mode}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        date={dateInputValue}
        display="inline"
        locale="en-us"
        is24Hour={false}
        onConfirm={handleConfirm}
        onCancel={() => setShowDatePicker(false)}
      />
    </Container>
  );
}
