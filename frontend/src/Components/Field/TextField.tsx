import React, { useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { useController } from 'react-hook-form';
import type { UseControllerProps, FieldValues } from 'react-hook-form';
import { Container } from './Container';
import { inputDisabledStyles, inputMultilineStyles, inputStyles } from './inputStyles';
import MaskInput from 'react-native-mask-input';
import type { ContainerProps } from './Container';
import type { MaskInputProps } from 'react-native-mask-input';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { TextInputContentSizeChangeEventData } from 'react-native/Libraries/Components/TextInput/TextInput';
import { colors } from '~Theme/Colors';

const isIOS = Platform.OS === 'ios';

const styles = StyleSheet.create({
  input: inputStyles,
  inputDisabled: inputDisabledStyles,
  inputMultiline: inputMultilineStyles,
});

type TextField<T extends FieldValues> = UseControllerProps<T> &
  Pick<ContainerProps, 'label' | 'radius'> &
  Pick<MaskInputProps, 'mask' | 'keyboardType' | 'autoCapitalize'> & {
    useMaskedValue?: boolean;
    isDisabled?: boolean;
    isMultiline?: boolean;
    editable?: boolean;
  };

export function TextField<T extends FieldValues>({
  rules,
  control,
  name,
  defaultValue,
  radius,
  label,
  keyboardType,
  autoCapitalize,
  mask,
  isDisabled,
  isMultiline,
  editable,
  useMaskedValue = false,
}: TextField<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, rules, defaultValue, control });
  const [isFocused, setIsFocused] = useState(false);
  const [lines, setLines] = useState(1);

  const height = lines * styles.input.lineHeight! + 40;

  function handleChange(masked: string, unmasked: string) {
    if (isDisabled) return;

    const updatedValue = (useMaskedValue ? masked : unmasked) as typeof value;
    onChange(updatedValue);
  }

  function handleContentSizeChange({ nativeEvent }: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) {
    if (isDisabled || !isMultiline) return;

    if (isIOS) {
      setLines(nativeEvent.contentSize.height / styles.input.lineHeight!);
    } else {
      setLines(Math.round((Math.max(nativeEvent.contentSize.height, 56) - 40) / styles.input.lineHeight!));
    }
  }

  return (
    <Container
      label={label}
      error={error?.message}
      radius={radius}
      floatLabel={!!value || isFocused}
      isDisabled={isDisabled}>
      <MaskInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        editable={editable ?? !isDisabled}
        multiline={isMultiline}
        numberOfLines={lines}
        scrollEnabled={false}
        placeholderTextColor={colors.grey400}
        textBreakStrategy="simple"
        style={[
          styles.input,
          isDisabled && styles.inputDisabled,
          isMultiline && styles.inputMultiline,
          isIOS ? { maxHeight: height } : { height },
        ]}
        onChangeText={handleChange}
        onContentSizeChange={handleContentSizeChange}
        placeholder={''}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        mask={mask}
      />
    </Container>
  );
}
