import React, { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Global, Profile2User } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { EventType } from '~types/event';
import { Typography } from '~Components/Typography';

type Props = {
  eventType: EventType;
  style?: StyleProp<ViewStyle>;
  isTextVisible?: boolean;
};

export const EventTypeIcon: FC<Props> = ({ style, eventType, isTextVisible }) => (
  <View style={[styles.icon, style]}>
    {eventType === EventType.ALL_TEAMS ? (
      <Global variant="Bold" color={colors.white} size={14} />
    ) : (
      <Profile2User variant="Bold" color={colors.white} size={14} />
    )}

    {isTextVisible ? (
      <Typography style={styles.text} variant="body3Medium">
        {eventType === EventType.ALL_TEAMS ? 'Visible to all teams' : 'Visible to your team'}
      </Typography>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  icon: {
    height: 26,
    minWidth: 38,
    gap: 4,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.blackTransparent20,
    borderRadius: 100,
  },
  text: {
    color: colors.white,
  },
});
