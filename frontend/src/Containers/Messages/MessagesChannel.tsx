import React, { useEffect } from 'react';
import { StyleSheet, View, InteractionManager, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Channel, MessageList, MessageInput, useChannelPreviewDisplayPresence } from 'stream-chat-react-native';
import { ProfileCircle, Profile2User } from 'iconsax-react-native';
import type { DeepPartial, Theme } from 'stream-chat-react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors } from '~Theme/Colors';
import { useChatContext } from '~Context/ChatContext';
import { MessengerStackParamList, Screens } from '~types/navigation';
import { typography } from '~Theme/Typography';
import { useChatClient } from '~Components/ChatClient/hooks/useChatClient';
import { Header } from '~Components/ScreenHeader/Header';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { EntityInfo } from '~Components/EntityInfo';
import { Badge } from '~Components/Badge';
import { Participants } from '~Components/Participants';
import { useKeyboard } from '~Hooks/useKeyboard';
import { useChatMembersModal } from '~Containers/Messages/hooks/useChatMembersModal';
import { ChatMembersModal } from '~Components/ChatClient/ChatMembersModal';
import { InlineDateSeparator } from '~Components/ChatClient/InlineDateSeparator';
import { DateHeader } from '~Components/ChatClient/DateHeader';
import { MessageAvatar } from '~Components/ChatClient/MessageAvatar';
import { MessageRepliesAvatars } from '~Components/ChatClient/MessageRepliesAvatars';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Message } from '~Components/ChatClient/Message';
import { FullScreenLoader } from '~Components/Loader/FullScreenLoader';
import { MessageFileAttachment } from '~Components/ChatClient/MessageFileAttachment';

type MessagesChannelProps = BottomTabScreenProps<MessengerStackParamList, Screens.MESSAGES_CHANNEL>;
const isIos = Platform.OS === 'ios';

export function MessagesChannel({ navigation, route }: MessagesChannelProps) {
  const paramsMessageId = route.params?.messageId;

  const { top } = useSafeAreaInsets();
  const { channel, setThread, setChannel, thread } = useChatContext();
  const { filterTeamParticipants } = useChatClient();
  const { currentUser } = useCurrentUserContext();
  const { isKeyboardVisible } = useKeyboard();
  const { isMembersModalVisible, setIsMembersModalVisible } = useChatMembersModal();

  // There is an error in data types in stream-chat library, will update it after they will fix an issue
  // @ts-ignore
  const isOnline = useChannelPreviewDisplayPresence(channel);

  useEffect(() => {
    setThread(null);
    return () => {
      setChannel(null);
    };
  }, []);

  if (!channel || channel === null) {
    return <FullScreenLoader />;
  }

  const handleOpenMembersModal = () => {
    setIsMembersModalVisible(true);
  };

  const handleCloseMembersModal = () => {
    setIsMembersModalVisible(false);
  };

  const handleMemberPress = (userId: string) => {
    setIsMembersModalVisible(false);
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(Screens.USER_PROFILE, { userId });
    });
  };

  const handleDirectChatMemberPress = () => {
    navigation.navigate(Screens.USER_PROFILE, { userId: participants[0]!.user!.id });
  };

  const isTeam = currentUser?.teams?.map(({ id }) => id).includes(channel.id!);
  const members = Object.values(channel.state.members);
  const participants = filterTeamParticipants(channel.state.members);
  const isGroupChat = !isTeam && participants.length >= 2;
  const endAdornmentElement =
    isTeam || isGroupChat ? (
      <TouchableOpacity activeOpacity={0.6} onPress={handleOpenMembersModal}>
        <Profile2User color={colors.primaryMain} variant="Bold" size={24} style={styles.icon} />
      </TouchableOpacity>
    ) : participants.length === 1 && !participants[0].user?.deactivated_at ? (
      <TouchableOpacity activeOpacity={0.6} onPress={handleDirectChatMemberPress}>
        <ProfileCircle color={colors.primaryMain} variant="Bold" size={24} style={styles.icon} />
      </TouchableOpacity>
    ) : null;
  const HeaderContent = (
    <>
      {isTeam ? (
        <>
          <EntityInfo
            fullName={channel.data?.name!}
            avatarSize={26}
            gap={8}
            avatarUrl={channel.data?.image}
            badge={<Badge text="Team" bgColor={colors.black} textColor={colors.white} />}
            avatarType="square"
            typographyVariant="body1SemiBold"
          />
        </>
      ) : participants.length === 1 ? (
        <EntityInfo
          fullName={participants[0].user?.name!}
          avatarSize={26}
          isDisabledEntity={!!participants[0]?.user?.deactivated_at}
          gap={8}
          isOnline={isOnline}
          // There is an error in data types in stream-chat library, will update it after they will fix an issue
          // @ts-ignore
          avatarUrl={participants[0].user?.image!}
          avatarType="circle"
          typographyVariant="body1SemiBold"
        />
      ) : (
        <Participants
          participants={participants}
          text={isGroupChat ? channel.data?.name : undefined}
          onContainerPress={handleOpenMembersModal}
        />
      )}
    </>
  );

  return channel ? (
    <>
      <View style={styles.container}>
        <Channel
          keyboardVerticalOffset={isIos ? 0 : undefined}
          // There is an error in data types in stream-chat library, will update it after they will fix an issue
          // @ts-ignore
          channel={channel}
          messageId={paramsMessageId}
          Message={Message}
          MessageAvatar={MessageAvatar}
          MessageRepliesAvatars={MessageRepliesAvatars}
          InlineDateSeparator={InlineDateSeparator}
          DateHeader={DateHeader}
          FileAttachment={MessageFileAttachment}
          thread={thread}>
          <Header
            style={[styles.header, { marginTop: styles.header.marginTop + top }]}
            endAdornment={endAdornmentElement}>
            {HeaderContent}
          </Header>
          <MessageList
            onThreadSelect={message => {
              if (channel?.id && message) {
                setThread(message);
                navigation.navigate(Screens.REPLY_THREAD);
              }
            }}
            myMessageTheme={myMessageTheme}
          />
          <SafeAreaView edges={isKeyboardVisible ? [] : ['bottom']}>
            <MessageInput />
          </SafeAreaView>
        </Channel>
      </View>

      <ChatMembersModal
        chatEntityName={isGroupChat ? 'Group' : 'Team'}
        isVisible={isMembersModalVisible}
        onClose={handleCloseMembersModal}
        members={members}
        onMemberPress={handleMemberPress}
      />
    </>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginHorizontal: 12,
    marginTop: 12,
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    alignItems: 'center',
  },
  text: {
    ...typography.body1Bold,
    color: colors.black,
    marginLeft: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  emptyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.grey400,
  },
});

// TODO: find correct guide for streamChat theming, at the moment not all documented options working correctly

const myMessageTheme: DeepPartial<Theme> = {
  messageSimple: {
    file: {
      container: {
        backgroundColor: colors.primaryMain,
        borderColor: 'transparent',
      },
    },
    content: {
      replyBorder: {
        borderColor: 'transparent',
      },
      containerInner: {
        backgroundColor: colors.primaryMain,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      deletedContainerInner: {
        backgroundColor: colors.primaryMain,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      markdown: {
        text: {
          color: colors.white,
          ...typography.body1Medium,
        },
      },
      textContainer: {
        borderWidth: 0,
        borderColor: 'transparent',
      },
    },
  },
};
