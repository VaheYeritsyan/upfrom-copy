import React, { FC, ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Typography } from '~Components/Typography';

type HeaderProps = ViewProps & {
  title: string;
  endAdornmentStyle?: ViewProps['style'];
  endAdornment?: ReactNode;
};

export const LargeTitleHeader: FC<HeaderProps> = ({
  children,
  title,
  endAdornment,
  endAdornmentStyle,
  style,
  ...props
}) => (
  <View {...props} style={[styles.headerContainer, style]}>
    <View style={styles.headerTop}>
      <Typography variant="h2">{title}</Typography>

      <View style={[styles.headerRight, endAdornmentStyle]}>{endAdornment}</View>
    </View>

    {children}
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 32,
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
  },
});
