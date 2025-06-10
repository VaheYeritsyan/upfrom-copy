import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { User } from 'iconsax-react-native';
import { Typography } from '~Components/Typography';
import { Badge } from '~Components/Badge';
import { colors } from '~Theme/Colors';

type Props = {
  assignedAs?: string;
  assignedAsColor?: string;
  assignedAsBgColor?: string;
};

const badgeTextColors: { [K: string]: string } = {
  mentor: colors.primaryMain,
  member: colors.grey600,
};

const badgeBgColors: { [K: string]: string } = {
  mentor: colors.primaryLightOpacity,
  member: colors.grey200,
};

export const EntityTeamInfoWithFooter: FC<Props> = ({ assignedAs = 'mentor', assignedAsColor, assignedAsBgColor }) => (
  <View style={styles.teamContent}>
    <User variant="Bold" color={colors.grey500} size={14} />
    <Typography style={styles.teamContentText} variant="body3Medium">
      You are assigned as
    </Typography>
    <Badge
      style={styles.teamContentBadge}
      text={assignedAs}
      textVariant="label2Bold"
      textColor={assignedAsColor || badgeTextColors[assignedAs]}
      bgColor={assignedAsBgColor || badgeBgColors[assignedAs]}
    />
  </View>
);

const styles = StyleSheet.create({
  teamContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamContentText: {
    color: colors.grey500,
  },
  teamContentBadge: {
    height: 15,
    lineHeight: 10,
    paddingVertical: 2,
  },
});
