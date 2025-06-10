import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock } from 'iconsax-react-native';
import { Event, Team } from '@up-from/graphql/genql';
import { addTodayToDateString, getFullTextDateAndTime, getIsDateToday } from '~/utils/dateFormat';
import { EntityCard } from '~Components/EntityCard';
import { Feature } from '~Components/Feature';
import { EntityInfo } from '~Components/EntityInfo';
import { Badge } from '~Components/Badge';
import { colors } from '~Theme/Colors';

type Props = Pick<Event, 'id' | 'title' | 'imageUrl'> & {
  startsAt: number;
  endsAt: number;
  team?: Pick<Team, 'name' | 'imageUrl'> | null;
  onPress?: (id: string) => void;
};

const allTeamImgSrc = require('~assets/images/infinity.png');
const placeholderImgSrc = require('~assets/images/placeholderImage.png');

export const EventCardSmall: FC<Props> = ({ id, title, imageUrl, team, startsAt, endsAt, onPress }) => {
  const isToday = getIsDateToday(startsAt);
  const isPast = endsAt < Date.now();
  const isOngoing = startsAt < Date.now() && endsAt > Date.now();
  const isTodayAndNotPast = isToday && !isPast && !isOngoing;

  const eventTypeColor = team ? colors.primaryMain : colors.purpleGradientStart;
  const timeColor = isTodayAndNotPast ? colors.primaryMain : colors.grey500;

  const date = getFullTextDateAndTime(startsAt);
  const dateValue = isToday ? addTodayToDateString(date) : date;

  const handlePress = () => {
    onPress?.(id);
  };

  return (
    <EntityCard
      style={[styles.card, isOngoing && { ...styles.cardOngoing, borderColor: eventTypeColor }]}
      name={title}
      avatarUrl={imageUrl || undefined}
      avatarSource={imageUrl ? null : placeholderImgSrc}
      avatarType="square"
      avatarSize={80}
      id={id}
      typographyVariant="h6"
      onPress={handlePress}>
      <View style={styles.cardContent}>
        <Feature
          style={styles.cardFeature}
          Icon={Clock}
          textColor={timeColor}
          typographyVariant="body3Medium"
          iconVariant="Bold"
          color={timeColor}
          size={14}>
          {dateValue}
        </Feature>

        <View style={styles.cardFooter}>
          <EntityInfo
            style={styles.cardFooterTeam}
            avatarSource={team ? null : allTeamImgSrc}
            avatarUrl={team?.imageUrl || undefined}
            fullName={team?.name || 'All Teams'}
            avatarSize={22}
            gap={8}
            typographyVariant="body1Medium"
            typographyColor={colors.grey400}
            avatarType="square"
          />

          {isOngoing ? (
            <Badge
              style={styles.cardFooterBadge}
              text="Happening Now"
              textColor={colors.white}
              bgColor={eventTypeColor}
              textTransform="none"
            />
          ) : null}
        </View>
      </View>
    </EntityCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 14,
  },
  cardOngoing: {
    borderWidth: 2,
  },
  cardContent: {
    height: 58,
    gap: 22,
    justifyContent: 'space-between',
  },
  cardFeature: {
    gap: 4,
  },
  cardFooter: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFooterTeam: {
    flex: 1,
  },
  cardFooterBadge: {
    height: 18,
    paddingVertical: 2,
  },
});
