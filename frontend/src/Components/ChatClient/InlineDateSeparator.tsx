import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'stream-chat-react-native';
import { getDateFromNow } from '~utils/dateFormat';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';

export type InlineDateSeparatorProps = {
  date?: Date;
};

export const InlineDateSeparator = memo<InlineDateSeparatorProps>(({ date }) => {
  const {
    theme: {
      colors: { overlay },
      inlineDateSeparator: { container, text },
    },
  } = useTheme();

  if (!date) {
    return null;
  }

  const dateString = getDateFromNow(date);

  return (
    <View style={[styles.container, { backgroundColor: overlay }, container]} testID="date-separator">
      <Typography variant="body1Medium" style={[styles.text, { color: colors.grey500 }, text]}>
        {dateString}
      </Typography>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
