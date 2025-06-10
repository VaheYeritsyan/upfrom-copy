import React, { FC } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ArrowCircleRight, CloseCircle, TickCircle } from 'iconsax-react-native';
import { EventUser } from '@up-from/graphql/genql';
import { Typography } from '~Components/Typography';
import { EntityInfo } from '~Components/EntityInfo';
import { colors } from '~Theme/Colors';
import { EventType } from '~types/event';
import { getPlural } from '~utils/textFormat';

type Props = {
  guests: Required<EventUser>[];
  eventType: EventType;
  onGustPress: (id: string) => void;
};

const renderStatus = (isAttending: EventUser['isAttending'], isAllTeamsEvent: boolean) => {
  if (isAllTeamsEvent && isAttending)
    return (
      <>
        <TickCircle size={14} color={colors.purpleGradientStart} variant="Bold" />
        <Typography style={styles.purpleText} variant="body3Medium">
          Attending
        </Typography>
      </>
    );

  if (!isAllTeamsEvent && isAttending)
    return (
      <>
        <TickCircle size={14} color={colors.primaryMain} variant="Bold" />
        <Typography style={styles.blueText} variant="body3Medium">
          Accepted
        </Typography>
      </>
    );

  // The "isAttending" equals "null" when invitation is pending
  if (isAttending === null)
    return (
      <>
        <ArrowCircleRight size={14} color={colors.grey400} variant="Bold" />
        <Typography style={styles.greyText} variant="body3Medium">
          Pending
        </Typography>
      </>
    );

  if (!isAttending)
    return (
      <>
        <CloseCircle size={14} color={colors.black} variant="Bold" />
        <Typography variant="body3Medium">Declined</Typography>
      </>
    );

  return null;
};

export const EventGuests: FC<Props> = ({ guests, eventType, onGustPress }) => {
  const title = eventType === EventType.MY_TEAM ? 'Invited Member' : 'Attendee';

  return (
    <View style={styles.container}>
      <Typography variant="body1SemiBold">{getPlural(title, guests.length)}</Typography>
      <View style={styles.list}>
        {guests.map(
          ({ user, isAttending }) =>
            user && (
              <TouchableOpacity
                style={styles.listItem}
                key={user.id}
                disabled={user.isDisabled}
                onPress={() => onGustPress(user.id)}
                activeOpacity={0.6}>
                <EntityInfo
                  fullName={`${user.firstName} ${user.lastName}`}
                  avatarUrl={user.avatarUrl ?? undefined}
                  avatarSize={26}
                  isDisabledEntity={user.isDisabled}
                  gap={8}
                  typographyVariant="body1SemiBold"
                />

                {eventType !== EventType.INDIVIDUAL ? (
                  <View style={styles.listItemStatus}>
                    {renderStatus(isAttending, eventType === EventType.ALL_TEAMS)}
                  </View>
                ) : null}
              </TouchableOpacity>
            ),
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 18,
    borderRadius: 8,
    borderColor: colors.grey200,
  },
  blueText: {
    color: colors.primaryMain,
  },
  greyText: {
    color: colors.grey400,
  },
  purpleText: {
    color: colors.purpleGradientStart,
  },
  list: {
    gap: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  listItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
