import React, { FC, memo, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { EmojiHappy, EmojiSad } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { Typography } from '~Components/Typography';
import { Image, Props as ImageProps } from '~Components/Image/Image';
import { Hexagon } from '~Components/Hexagon/Hexagon';

export type AvatarType = 'circle' | 'square' | 'hexagon';

export type AvatarProps = {
  style?: ImageProps['style'] & Pick<ViewStyle, 'backgroundColor'>;
  url?: string | null;
  source?: ImageProps['source'];
  isDisabledEntity?: boolean;
  initials: string | null;
  initialsColor?: string;
  backgroundColor?: string;
  Badge?: FC<Required<Pick<AvatarProps, 'size'>> & { style?: StyleProp<ViewStyle> }> | null;
  type?: AvatarType;
  size?: number;
};

const borderLimbs = {
  22: 4,
  26: 6,
};
const minBadgeSize = 24;
const badgeDividers = {
  circle: -1,
  square: -0.5,
  hexagon: -0.5,
};

export const AvatarImage = memo<AvatarProps>(
  ({
    style,
    url,
    source,
    initials,
    isDisabledEntity,
    type = 'circle',
    size = 100,
    backgroundColor,
    initialsColor,
    Badge,
  }) => {
    const borderRadius = useMemo(() => {
      if (type === 'circle') return size / 2;

      // size 22 has 4px, 26 has 6px, and the all rest have 8px
      return borderLimbs[size as keyof typeof borderLimbs] ?? 8;
    }, [type, size]);

    const containerStyle = useMemo(
      () => ({
        height: size,
        width: size,
        borderRadius,
      }),
      [size, borderRadius],
    );

    const initialsStyle = useMemo(
      () => ({
        fontSize: size / 2.75,
        lineHeight: size / 1.75,
        letterSpacing: 0,
      }),
      [size],
    );

    const color = useMemo(() => {
      return initialsColor || styles.initials.color;
    }, [initialsColor]);

    const background = useMemo(() => {
      return backgroundColor || (style?.backgroundColor as string) || styles.containerPlaceholder.backgroundColor;
    }, [backgroundColor, style?.backgroundColor]);

    const badgeSize = useMemo(() => {
      if (!Badge) return 0;

      return Math.max(size / 3, minBadgeSize);
    }, [Badge, size]);

    const badgeStyle = useMemo(() => {
      if (!badgeSize) return {};
      if (size === 40) return { right: -5, bottom: -5 };

      const inserts = (badgeSize / 4) * badgeDividers[type];
      return { right: inserts, bottom: inserts };
    }, [badgeSize, size, type]);

    const initialsOrEmojiNode = useMemo(() => {
      return isDisabledEntity ? (
        <EmojiSad color={color} size={size / 2} />
      ) : (
        <>
          {initials ? (
            <Typography style={[initialsStyle, { color }]} variant="h1">
              {initials}
            </Typography>
          ) : (
            <EmojiHappy color={color} size={size / 2} />
          )}
        </>
      );
    }, [isDisabledEntity, initials, size, initialsStyle, color]);

    const hexagonNode =
      type === 'hexagon' ? (
        <Hexagon size={size} color={background}>
          {initialsOrEmojiNode}
        </Hexagon>
      ) : null;

    const imageNode =
      (url || source) && !isDisabledEntity ? (
        <Image style={[containerStyle, style]} source={source} url={url!} />
      ) : null;

    const avatarNode = (
      <View style={[styles.containerPlaceholder, containerStyle, { backgroundColor: background }, style]}>
        {initialsOrEmojiNode}
      </View>
    );

    const badgeNode = Badge && !!badgeSize ? <Badge style={[styles.badge, badgeStyle]} size={badgeSize} /> : null;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {hexagonNode || imageNode || avatarNode}
        {badgeNode}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  containerPlaceholder: {
    backgroundColor: colors.grey300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  initials: {
    color: colors.grey500,
  },
  badge: {
    position: 'absolute',
  },
});
