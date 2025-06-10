import React, { FC, useMemo } from 'react';
import { ChannelMemberResponse } from 'stream-chat';
import { StyleSheet, View } from 'react-native';
import { getInitials } from '~utils/textFormat';
import { AvatarImage } from '~Components/Avatar/AvatarImage';
import { colors } from '~Theme/Colors';

type Props = {
  members: ChannelMemberResponse[];
  teamName?: string | null;
  imageUrl?: string | null;
  isUnread?: boolean;
  isOnline?: boolean;
};

const MAX_AVATARS_COUNT = 3;

const getImageContainerStyles = (size: number, isSquare?: boolean) => {
  const containerSize = size + 6;
  return {
    width: containerSize,
    height: containerSize,
    borderRadius: isSquare ? 8 : containerSize / 2,
  };
};

export const PreviewMessengerImage: FC<Props> = ({ members, teamName, imageUrl, isUnread, isOnline }) => {
  const slicedMembers = members.slice(0, MAX_AVATARS_COUNT);
  const membersCount = members.length;
  const isTeam = !!teamName;

  const teamInitials = isTeam ? getInitials(teamName) : '';

  const avatarStyles = useMemo(() => {
    switch (membersCount) {
      case 1:
        return [];
      case 2:
        return [styles.imagesItemMedium, styles.imagesItemLarge];
      default:
        return [styles.imagesItemSmall, styles.imagesItemMedium, styles.imagesItemLarge];
    }
  }, [membersCount]);

  const avatarSizes = useMemo(() => {
    switch (membersCount) {
      case 1:
        return [50];
      case 2:
        return [30, 38];
      default:
        return [20, 30, 38];
    }
  }, [membersCount]);

  return (
    <View style={styles.imageContainer}>
      {imageUrl || isTeam ? (
        <View
          style={[
            styles.imageItemContainer,
            isUnread && styles.imageItemContainerUnread,
            getImageContainerStyles(50, isTeam),
          ]}>
          <AvatarImage url={imageUrl} initials={teamInitials} size={50} type={isTeam ? 'square' : 'circle'} />
        </View>
      ) : (
        <>
          {slicedMembers.map(({ user }, idx) => (
            <View
              style={[
                styles.imageItemContainer,
                isUnread && styles.imageItemContainerUnread,
                getImageContainerStyles(avatarSizes[idx]),
                avatarStyles[idx],
              ]}
              key={user?.id}>
              <AvatarImage
                initials={getInitials(user?.name || '')}
                size={avatarSizes[idx]}
                type="circle"
                isDisabledEntity={!!user?.deactivated_at}
                // There is an error in data types in stream-chat library, will update it after they will fix an issue
                // @ts-ignore
                url={user?.image}
              />
            </View>
          ))}
        </>
      )}
      {isOnline ? (
        <View style={[styles.onlineIndicatorContainer, isUnread && styles.onlineIndicatorContainerUnread]}>
          <View style={styles.onlineIndicator} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: 60,
    height: 60,
    minWidth: 60,
    minHeight: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageItemContainer: {
    backgroundColor: colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageItemContainerUnread: {
    backgroundColor: colors.primaryMain,
  },
  imagesItemLarge: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imagesItemMedium: {
    position: 'absolute',
    top: 14,
    right: 0,
  },
  imagesItemSmall: {
    position: 'absolute',
    top: 34,
    left: 10,
  },
  onlineIndicatorContainer: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: 4,
    right: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grey100,
  },
  onlineIndicatorContainerUnread: {
    backgroundColor: colors.primaryMain,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
});
