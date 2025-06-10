import React, { FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { View, ViewProps, StyleSheet, ScrollView, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboard } from '~Hooks/useKeyboard';
import { colors } from '~Theme/Colors';

type Props = PropsWithChildren & {
  header?: ReactNode;
  style?: ViewProps['style'];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  containerStyle?: ViewProps['style'];
  isHeaderBackgroundInvisible?: boolean;
  headerContainerStyle?: ViewProps['style'];
  stickyBottomContent?: ReactNode;
  stickyBottomContainerStyle?: ViewProps['style'];
};

export const MainLayout: FC<Props> = ({
  containerStyle,
  style,
  header,
  isRefreshing,
  onRefresh,
  isHeaderBackgroundInvisible,
  headerContainerStyle,
  stickyBottomContent,
  stickyBottomContainerStyle,
  children,
}) => {
  const { top, left, right, bottom } = useSafeAreaInsets();

  const { isKeyboardVisible } = useKeyboard();

  const stylesTop = useMemo(
    () => (header ? styles.headerContainer.height + styles.headerWrapper.marginTop : 0),
    [header],
  );
  const paddingTop = useMemo(() => top + stylesTop, [top, stylesTop]);
  const backgroundColor = useMemo(() => (containerStyle as ViewStyle)?.backgroundColor, [containerStyle]);

  return (
    <View style={containerStyle}>
      {header ? (
        <View style={[styles.headerContainer, { left, right, paddingTop: top }, headerContainerStyle]}>
          <View
            style={[
              styles.headerBackground,
              {
                height: top + (isHeaderBackgroundInvisible ? 0 : styles.headerBackground.height),
                backgroundColor,
              },
            ]}
          />
          <View style={styles.headerWrapper}>{header}</View>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[{ paddingTop }, styles.content, style]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              progressViewOffset={paddingTop}
              refreshing={!!isRefreshing}
              progressBackgroundColor={backgroundColor}
              tintColor={colors.grey500}
              colors={[colors.grey500, colors.grey500, colors.grey500, colors.grey500]}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
        scrollIndicatorInsets={{ top: stylesTop }}>
        {children}

        {isKeyboardVisible ? <View style={styles.stickyBottomWithOpenedKeyboard}>{stickyBottomContent}</View> : null}
      </ScrollView>

      {!isKeyboardVisible && stickyBottomContent ? (
        <View
          style={[
            styles.stickyBottomContent,
            stickyBottomContainerStyle,
            { paddingBottom: bottom || ((stickyBottomContainerStyle as ViewStyle)?.paddingBottom as number) || 0 },
          ]}>
          {stickyBottomContent}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 54,
    position: 'absolute',
    zIndex: 100,
    top: 0,
  },
  headerWrapper: {
    marginTop: 12,
    marginHorizontal: 12,
    zIndex: 1,
  },
  headerBackground: {
    position: 'absolute',
    height: 54 / 2 + 12,
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    paddingBottom: 200,
  },
  refreshControl: {
    left: 0,
    right: 0,
    top: 0,
    position: 'absolute',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyBottomWithOpenedKeyboard: {
    marginTop: 32,
  },
  stickyBottomContent: {
    zIndex: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
