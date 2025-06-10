import React, { FC, useCallback, useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Channel } from 'stream-chat';
import { ChannelPreviewMessengerProps, useChannelPreviewDisplayPresence } from 'stream-chat-react-native';
import { Screens } from '~types/navigation';
import { getDateAndTimeFromNow } from '~utils/dateFormat';
import { getInitials, getPlural } from '~utils/textFormat';
import { navigationRef } from '~utils/navigation';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { useChatContext } from '~Context/ChatContext';
import { PreviewMessengerImage } from '~Components/ChatClient/PreviewMessengerImage';
import { Typography } from '~Components/Typography';
import { Badge } from '~Components/Badge';
import { colors } from '~Theme/Colors';
import { AvatarImage } from '~Components/Avatar/AvatarImage';

export type Props = ChannelPreviewMessengerProps & {
  style?: StyleProp<ViewStyle>;
  onPress?: (channel: Channel) => void;
};

const disabledUserTitle = 'Disabled User';

export const PreviewMessenger: FC<Props> = ({ style, channel, unread, latestMessagePreview, onPress }) => {
  const { currentUser } = useCurrentUserContext();
  const { setChannel } = useChatContext();

  const isOnline = useChannelPreviewDisplayPresence(channel);

  const members = useMemo(() => {
    if (!channel?.state?.members) return [];

    return Object.values(channel.state.members);
  }, [channel.state.members]);

  const channelTeam = useMemo(() => {
    if (!channel.id || !currentUser?.teams?.length) return null;

    return currentUser?.teams.find(team => team.id === (channel.data?.teamId || channel.id)) || null;
  }, [channel.id, channel.data?.teamId, currentUser?.teams]);

  const isTeam = useMemo(
    () => currentUser?.teams?.map(({ id }) => id).includes(channel.id!),
    [currentUser?.teams, channel.id],
  );
  const isGroup = useMemo(() => !isTeam && members.length >= 3, [members.length, isTeam]);
  const badgeText = useMemo(() => {
    if (!isGroup && !isTeam) return null;
    return isGroup ? 'Group' : 'Team';
  }, [isGroup, isTeam]);
  const badgeBgColor = useMemo(() => {
    return isGroup ? colors.grey200 : colors.black;
  }, [isGroup]);
  const badgeTextColor = useMemo(() => {
    return isGroup ? colors.grey600 : colors.white;
  }, [isGroup]);
  const lastMessageAuthor = useMemo(() => {
    if (latestMessagePreview.messageObject?.user?.id === currentUser?.id) return 'You';
    if (latestMessagePreview.messageObject?.user?.deactivated_at) return disabledUserTitle;
    return latestMessagePreview.messageObject?.user?.name;
  }, [latestMessagePreview.messageObject]);
  const lastMessageText = useMemo(() => {
    if (latestMessagePreview.messageObject?.text) return latestMessagePreview.messageObject?.text.trim();
    const attachmentsCount = latestMessagePreview.messageObject?.attachments?.length || 0;
    if (attachmentsCount) return `${attachmentsCount} ${getPlural('Attachment', attachmentsCount)}`;
    return null;
  }, [latestMessagePreview.messageObject]);
  const membersWithoutCurrentUser = useMemo(() => {
    return members.filter(({ user }) => user?.id !== currentUser?.id);
  }, [members, currentUser?.id]);
  const chatName = useMemo(() => {
    return (
      channel.data?.name ||
      membersWithoutCurrentUser.map(({ user }) => (user?.deactivated_at ? disabledUserTitle : user?.name)).join(', ')
    );
  }, [channel.data?.name, membersWithoutCurrentUser]);

  const handlePress = useCallback(() => {
    if (onPress) {
      // There is an error in data types in stream-chat library, will update it after they will fix an issue
      // @ts-ignore
      onPress(channel);
      return;
    }

    // There is an error in data types in stream-chat library, will update it after they will fix an issue
    // @ts-ignore
    setChannel(channel);
    navigationRef.current?.navigate(Screens.MESSAGES_CHANNEL as never);
  }, []);

  if (!members.length) return null;

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress} activeOpacity={0.8}>
      <PreviewMessengerImage
        members={membersWithoutCurrentUser}
        teamName={isTeam ? channelTeam?.name : null}
        isUnread={!!unread}
        isOnline={isOnline}
        imageUrl={isTeam ? channelTeam?.imageUrl : null}
      />

      <View style={styles.content}>
        <View style={styles.contentTop}>
          {badgeText ? (
            <View style={styles.contentTopBadgeContainer}>
              {!isTeam && channelTeam ? (
                <AvatarImage
                  style={styles.contentTopBadgeTeamAvatar}
                  initials={getInitials(channelTeam.name)}
                  url={channelTeam.imageUrl}
                  size={26}
                  type="square"
                />
              ) : null}

              <Badge
                style={[styles.contentTopBadge, !isTeam && channelTeam && styles.contentTopBadgeTeam]}
                text={badgeText}
                textColor={badgeTextColor}
                textVariant="label2Bold"
                bgColor={badgeBgColor}
              />
            </View>
          ) : null}

          <Typography
            style={[styles.title, !unread && styles.titleRead]}
            variant={unread ? 'body3Bold' : 'body3Medium'}
            numberOfLines={1}>
            {chatName || 'Empty name'}
          </Typography>
        </View>

        <Typography style={!unread && styles.messageRead} variant="paragraph3" numberOfLines={2}>
          {lastMessageText ? (
            <>
              <Typography style={[styles.messageAuthor, !unread && styles.messageRead]} variant="paragraph3">
                {lastMessageAuthor}:&nbsp;
              </Typography>
              {lastMessageText}
            </>
          ) : (
            'No messages yet...'
          )}
        </Typography>
        <Typography style={styles.date} variant="label1Medium">
          {getDateAndTimeFromNow(
            (latestMessagePreview?.messageObject?.created_at || channel.data?.created_at) as string,
          )}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  content: {
    gap: 4,
    flex: 1,
  },
  contentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contentTopBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTopBadge: {
    height: 15,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  contentTopBadgeTeam: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingLeft: 5,
  },
  contentTopBadgeTeamAvatar: {
    borderRadius: 6,
    borderColor: colors.white,
    borderWidth: 3,
  },
  title: {
    flex: 1,
  },
  titleRead: {
    color: colors.grey600,
  },
  messageAuthor: {
    fontWeight: '600',
  },
  messageRead: {
    color: colors.grey500,
  },
  date: {
    color: colors.grey400,
  },
});
