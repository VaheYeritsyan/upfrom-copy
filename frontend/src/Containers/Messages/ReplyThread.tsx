import React from 'react';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Channel, Thread, ShowThreadMessageInChannelButton } from 'stream-chat-react-native';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useChatContext } from '~Context/ChatContext';
import { colors } from '~Theme/Colors';
import { Header } from '~Components/ScreenHeader/Header';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboard } from '~Hooks/useKeyboard';
import { Message } from '~Components/ChatClient/Message';
import { MessageAvatar } from '~Components/ChatClient/MessageAvatar';
import { MessageRepliesAvatars } from '~Components/ChatClient/MessageRepliesAvatars';
import { MessageFileAttachment } from '~Components/ChatClient/MessageFileAttachment';
import { MessengerStackParamList, Screens } from '~types/navigation';

type ReplyThreadProps = BottomTabScreenProps<MessengerStackParamList, Screens.REPLY_THREAD>;
const isIos = Platform.OS === 'ios';

export function ReplyThread({ route }: ReplyThreadProps) {
  const paramsMessageId = route.params?.messageId;
  const { channel, thread, setThread } = useChatContext();
  const { top } = useSafeAreaInsets();
  const { isKeyboardVisible } = useKeyboard();

  return (
    <SafeAreaView style={styles.container} edges={isKeyboardVisible ? [] : ['bottom']}>
      <View style={styles.container}>
        <Channel
          // There is an error in data types in stream-chat library, will update it after they will fix an issue
          // @ts-ignore
          channel={channel}
          keyboardVerticalOffset={isIos ? 0 : undefined}
          thread={thread}
          Message={Message}
          MessageRepliesAvatars={MessageRepliesAvatars}
          MessageAvatar={MessageAvatar}
          FileAttachment={props => <MessageFileAttachment {...props} isThread />}
          messageId={paramsMessageId}
          threadList
          ShowThreadMessageInChannelButton={ShowThreadMessageInChannelButton}>
          <Header style={[styles.header, { marginTop: styles.header.marginTop + top }]}>
            <Text style={styles.text}>Thread</Text>
          </Header>
          <Thread
            onThreadDismount={() => {
              setThread(null);
            }}
          />
        </Channel>
      </View>
    </SafeAreaView>
  );
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
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginLeft: 10,
    alignItems: 'center',
  },
});
