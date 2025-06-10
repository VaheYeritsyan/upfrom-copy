import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FileAttachmentProps,
  FileIcon,
  useMessageContext,
  useTheme,
  getFileSizeDisplayText,
} from 'stream-chat-react-native';
import { openInWeb } from '~utils/links';

type Props = FileAttachmentProps & {
  isThread?: boolean;
};

export const MessageFileAttachment: FC<Props> = props => {
  const {
    isThread,
    additionalTouchableProps,
    attachment,
    attachmentSize,
    AttachmentActions,
    onLongPress,
    onPress,
    onPressIn,
    preventPress,
    styles: stylesProp = {},
  } = props;

  const { isMyMessage } = useMessageContext();

  const {
    theme: {
      colors: { black, grey, grey_whisper, white },
      messageSimple: {
        file: { container, details, fileSize, title },
      },
    },
  } = useTheme();

  const defaultOnPress = () => {
    if (!attachment.asset_url) return;

    openInWeb(attachment.asset_url);
  };

  return (
    <TouchableOpacity
      disabled={preventPress}
      onLongPress={event => {
        if (onLongPress) {
          onLongPress({
            additionalInfo: { attachment },
            emitter: 'fileAttachment',
            event,
          });
        }
      }}
      onPress={event => {
        if (onPress) {
          onPress({
            additionalInfo: { attachment },
            defaultHandler: defaultOnPress,
            emitter: 'fileAttachment',
            event,
          });
        } else {
          defaultOnPress();
        }
      }}
      onPressIn={event => {
        if (onPressIn) {
          onPressIn({
            additionalInfo: { attachment },
            defaultHandler: defaultOnPress,
            emitter: 'fileAttachment',
            event,
          });
        } else {
          defaultOnPress();
        }
      }}
      testID="file-attachment"
      {...additionalTouchableProps}>
      <View style={[styles.container, { backgroundColor: white }, container, stylesProp.container]}>
        <FileIcon mimeType={attachment.mime_type} size={attachmentSize} />
        <View style={[styles.details, details, stylesProp.details]}>
          <Text
            numberOfLines={2}
            style={[styles.title, { color: isMyMessage && !isThread ? white : black }, title, stylesProp.title]}>
            {attachment.title}
          </Text>
          <Text
            style={[styles.size, { color: isMyMessage && !isThread ? grey_whisper : grey }, fileSize, stylesProp.size]}>
            {getFileSizeDisplayText(attachment.file_size)}
          </Text>
        </View>
      </View>
      {attachment.actions?.length && AttachmentActions ? <AttachmentActions {...attachment} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 8,
  },
  details: {
    maxWidth: '60%',
    paddingLeft: 16,
  },
  size: {
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
});
