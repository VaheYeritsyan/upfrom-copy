import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'stream-chat-react-native';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';
import { getDateFromNow, getDateFromShortDateString } from '~utils/dateFormat';

export interface DateHeaderProps {
  dateString?: string | number;
}

export const DateHeader = memo<DateHeaderProps>(({ dateString }) => {
  const {
    theme: {
      colors: { overlay },
      dateHeader: { container, text },
    },
  } = useTheme();

  const textDate = getDateFromNow(getDateFromShortDateString(String(dateString || 0)));

  return (
    <View style={[styles.container, { backgroundColor: overlay }, container]}>
      <Typography variant="body1Medium" style={[styles.text, { color: colors.grey500 }, text]}>
        {textDate}
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
    marginTop: 8,
    paddingHorizontal: 8,
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
