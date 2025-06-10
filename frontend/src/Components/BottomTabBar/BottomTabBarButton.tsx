import React, { FC, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, TouchableOpacityProps, View } from 'react-native';
import { IconProps } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';

type Props = Omit<TouchableOpacityProps, 'children'> &
  (PropsWithChildren & {
    Icon?: FC<IconProps>;
    isActive?: boolean;
    iconColor?: string;
    isBadgeVisible?: boolean;
  });

export const BottomTabBarButton: FC<Props> = ({
  Icon,
  iconColor,
  isActive,
  isBadgeVisible,
  children,
  style,
  ...props
}) => {
  const color = isActive ? colors.primaryMain : iconColor || colors.grey300;

  return (
    <Pressable {...props} style={[styles.container, style]}>
      {Icon ? <Icon size={24} color={color} variant="Bold" /> : null}

      {children ? (
        <View style={[styles.childrenContainer, isActive && styles.childrenContainerActive]}>{children}</View>
      ) : null}

      {isBadgeVisible ? (
        <View style={[styles.badgeContainer, style]}>
          <View style={styles.badgeWrapper}>
            <View style={styles.badge}>
              <View style={styles.badgeInner} />
            </View>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    flex: 1,
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    height: 24,
    width: 24,
  },
  badge: {
    top: -4,
    right: -3,
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  badgeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  childrenContainer: {
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 15,
    height: 30,
    width: 30,
    overflow: 'hidden',
  },
  childrenContainerActive: {
    borderColor: colors.primaryMain,
  },
});
