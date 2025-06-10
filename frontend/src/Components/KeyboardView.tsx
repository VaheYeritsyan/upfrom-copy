import React, { FC } from 'react';
import { KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform, StyleSheet } from 'react-native';

type KeyboardViewProps = KeyboardAvoidingViewProps;

const isIOS = Platform.OS === 'ios';

export const KeyboardView: FC<KeyboardViewProps> = ({
  style,
  behavior = isIOS ? 'padding' : 'height',
  children,
  ...props
}) => (
  <KeyboardAvoidingView behavior={behavior} {...props} style={[styles.container, style]}>
    {children}
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
