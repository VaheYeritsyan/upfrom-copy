import { StyleSheet, View } from 'react-native';
import React from 'react';
import { effects } from '~Theme/Effects';
import { Button } from '~Components/Button';
import type { ButtonProps } from '~Components/Button';

type ContainedButtonProps = Omit<ButtonProps, 'shape' | 'size' | 'fullWidth'>;

export function ContainedButton({ color = 'black', disabled, ...rest }: ContainedButtonProps) {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 100,
      ...effects.shadow2,
    },
  });

  return (
    <View style={styles.container}>
      <Button shape="pill" size="medium" fullWidth disabled={disabled} {...rest} color={color} />
    </View>
  );
}
