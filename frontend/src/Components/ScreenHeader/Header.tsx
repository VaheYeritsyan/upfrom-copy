import React, { FC, ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Typography } from '~Components/Typography';

type HeaderProps = ViewProps & {
  startAdornmentStyle?: ViewProps['style'];
  endAdornmentStyle?: ViewProps['style'];
  middleStyle?: ViewProps['style'];
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  isBackArrowInvisible?: boolean;
  withBackTitle?: boolean;
};

export const Header: FC<HeaderProps> = ({
  children,
  isBackArrowInvisible,
  startAdornment,
  endAdornment,
  startAdornmentStyle,
  endAdornmentStyle,
  middleStyle,
  style,
  withBackTitle,
  ...props
}) => {
  const navigation = useNavigation();
  const isBackButtonVisible = !isBackArrowInvisible;

  return (
    <View {...props} style={[styles.headerContainer, style]}>
      <View style={[styles.headerLeft, !isBackButtonVisible && styles.headerLeftWithoutBackArrow, startAdornmentStyle]}>
        {isBackButtonVisible ? (
          <TouchableOpacity style={styles.headerBackButton} activeOpacity={0.6} onPress={navigation.goBack}>
            <ArrowLeft2 color={colors.grey500} variant="Linear" size={18} style={styles.headerBackIcon} />
            {withBackTitle ? (
              <Typography style={styles.headerBackText} variant="body1SemiBold">
                Back
              </Typography>
            ) : null}
          </TouchableOpacity>
        ) : null}
        {startAdornment}
      </View>

      <View style={[styles.headerMiddle, middleStyle]}>{children}</View>

      <View style={[styles.headerRight, endAdornmentStyle]}>{endAdornment}</View>
    </View>
  );
};

const headerHeight = 54;
const styles = StyleSheet.create({
  headerContainer: {
    ...effects.shadow2,
    backgroundColor: colors.white,
    borderRadius: 27,
    height: headerHeight,
    gap: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeftWithoutBackArrow: {
    paddingVertical: 14,
    paddingLeft: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingRight: 18,
  },
  headerMiddle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    gap: 8,
  },
  headerBackButton: {
    height: headerHeight,
    justifyContent: 'center',
    paddingLeft: 18,
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackIcon: {
    alignItems: 'center',
  },
  headerBackText: {
    color: colors.grey500,
  },
});
