import { colors } from '~Theme/Colors';
import { typography } from '~Theme/Typography';

export const chatTheme = {
  messageList: {
    container: {
      backgroundColor: colors.grey100,
      borderColor: 'transparent',
    },
  },
  inlineDateSeparator: {
    container: {
      backgroundColor: 'transparent',
      border: 0,
      borderColor: 'transparent',
    },
    text: {
      ...typography.body3Medium,
      color: colors.grey500,
    },
  },
  dateHeader: {
    container: {
      backgroundColor: colors.grey100,
      border: 0,
      borderColor: 'transparent',
    },
    text: {
      ...typography.body3Medium,
      color: colors.grey500,
    },
  },
  messageSimple: {
    file: {
      container: {
        backgroundColor: colors.grey200,
        borderColor: 'transparent',
      },
    },
    content: {
      replyBorder: {
        borderColor: 'transparent',
      },
      containerInner: {
        backgroundColor: colors.grey200,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      deletedContainerInner: {
        backgroundColor: colors.grey200,
        borderWidth: 0,
        borderColor: 'transparent',
      },
      markdown: {
        text: {
          color: colors.black,
          ...typography.body1Medium,
        },
      },
      textContainer: {
        borderWidth: 0,
        borderColor: 'transparent',
      },
    },
  },
  channelPreview: {
    container: {
      backgroundColor: colors.grey100,
      border: 0,
      borderColor: 'transparent',
    },
  },
  channelListSkeleton: {
    container: {
      backgroundColor: colors.grey100,
      border: 0,
      borderColor: 'transparent',
    },
  },
  channelListMessenger: {
    flatList: {
      backgroundColor: colors.grey100,
      border: 0,
      borderColor: 'transparent',
    },
    flatListContent: {
      backgroundColor: colors.grey100,
      border: 0,
      borderColor: 'transparent',
    },
  },
};
