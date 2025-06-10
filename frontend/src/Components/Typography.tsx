import { Text, StyleSheet, TextProps } from 'react-native';
import React from 'react';
import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';
import type { Variant } from '~Theme/Typography';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

// TODO: Make color an input prop
export type TypographyProps = TextProps & {
  variant: Variant;
  align?: 'center' | 'left' | 'right' | 'justify';
  primaryGradient?: boolean;
  errorGradient?: boolean;
};

export function Typography({
  style,
  variant,
  align,
  errorGradient = false,
  primaryGradient = false,
  ...rest
}: TypographyProps) {
  const styles = StyleSheet.create({
    default: {
      ...typography[variant],
      color: colors.black,
      textAlign: align,
    },
    gradient: {
      opacity: 0,
    },
  });

  if (primaryGradient || errorGradient) {
    return (
      // @ts-ignore https://github.com/react-native-masked-view/masked-view/issues/149
      <MaskedView maskElement={<Text style={[styles.default, style]} {...rest} />}>
        <LinearGradient
          colors={primaryGradient ? [colors.primaryMain, colors.primaryLight] : [colors.dangerMain, colors.dangerLight]}
          useAngle={true}
          angle={135}>
          <Text style={[styles.default, style, styles.gradient]} {...rest} />
        </LinearGradient>
      </MaskedView>
    );
  }

  return <Text style={[styles.default, style]} {...rest} />;
}
