import React, { FC, ReactNode, useCallback, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextInput,
  ViewStyle,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from 'react-native';
import { SearchNormal1 } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';

type Props = Omit<TextInputProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onContainerPress?: () => void;
};

export const SearchTextField: FC<Props> = ({
  style,
  value,
  defaultValue,
  startAdornment,
  placeholder,
  endAdornment,
  onContainerPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    },
    [props.onBlur],
  );
  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    },
    [props.onFocus],
  );

  const node = (
    <>
      {startAdornment || <SearchNormal1 color={colors.grey400} variant="Linear" size={16} />}
      <TextInput
        {...props}
        style={styles.input}
        value={value}
        defaultValue={defaultValue}
        placeholderTextColor={colors.grey400}
        placeholder={placeholder}
        onPressIn={onContainerPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {endAdornment}
    </>
  );

  return onContainerPress ? (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.inputContainer, style, isFocused && styles.inputContainerFocused]}
      onPress={onContainerPress}>
      {node}
    </TouchableOpacity>
  ) : (
    <View style={[styles.inputContainer, style, isFocused && styles.inputContainerFocused]}>{node}</View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: 6,
    paddingRight: 6,
    paddingLeft: 20,
    gap: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.grey300,
    backgroundColor: colors.grey200,
    flex: 1,
    borderRadius: 24,
  },
  inputContainerFocused: {
    borderWidth: 2,
    borderColor: colors.primaryMain,
  },
  input: {
    color: colors.grey600,
    flex: 1,
    padding: 0,
    ...typography.body1SemiBold,
  },
});
