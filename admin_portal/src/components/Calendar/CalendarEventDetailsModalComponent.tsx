import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  GroupOutlined,
  DescriptionOutlined,
  EventOutlined,
  Close,
  AssignmentTurnedInOutlined,
  OpenInNewOutlined,
  PlaceOutlined,
} from '@mui/icons-material';
import { Event } from '@up-from/graphql-ap/genql';
import { getPlural } from 'frontend/src/utils/textFormat';
import { Pages } from '~/constants/pages';
import { getFullLongDate, getDateTime } from '~/util/date';
import { ModalComponent, Props as ModalProps } from '~/components/Modal/ModalComponent';
import { IconButtonComponent } from '~/components/Button/IconButtonComponent';
import { ImageComponent } from '~/components/Image/ImageComponent';
import styles from './calendar-event-details-modal.module.scss';

type Props = Pick<ModalProps, 'onClose' | 'isOpen'> &
  Event & {
    color: string;
  };

export const CalendarEventDetailsModalComponent: FC<Props> = ({
  onClose,
  isOpen,
  color,
  id,
  title,
  startsAt,
  endsAt,
  description,
  guests,
  imageUrl,
  owner,
  team,
  isIndividual,
  location,
  isCancelled,
  address,
}) => {
  const eventTimeType = useMemo(() => {
    const now = Date.now();

    if (startsAt <= now && endsAt >= now) return 'Ongoing';
    if (startsAt < now) return 'Past';
    if (startsAt > now) return 'Upcoming';

    return 'Unknown';
  }, [startsAt, endsAt]);

  const isAllTeamsEvent = !isIndividual && !team?.id;

  const eventType = useMemo(() => {
    if (isIndividual) return 'Individual';
    if (!isIndividual && team?.id) return 'Team';
    if (isAllTeamsEvent) return 'All Teams';

    return 'Unknown';
  }, [isIndividual, team?.id, isAllTeamsEvent]);

  const guestsCount = guests?.length || 0;
  const attendingGuestsCount = guests?.filter(guest => guest.isAttending).length || 0;
  const declinedGuestsCount = guests?.filter(guest => guest.isAttending === false).length || 0;
  const awaitingGuestsCount =
    guests?.filter(guest => guest.isAttending === undefined || guest.isAttending === null).length || 0;

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      className={styles.eventModal}
      bodyClassName={styles.eventModalBody}>
      <IconButtonComponent className={styles.eventModalCloseButton} onClick={onClose} sx={{ color: 'white' }}>
        <Close />
      </IconButtonComponent>

      <Box className={styles.eventModalContent}>
        <ImageComponent className={styles.eventModalImg} src={imageUrl || undefined} />

        <Box className={clsx(styles.eventModalRow, styles.eventModalHeader)}>
          <Box className={styles.eventModalRowIconContainer}>
            <Tooltip title="Calendar color">
              <Box className={styles.eventModalColor} sx={{ backgroundColor: color }} />
            </Tooltip>
          </Box>
          <Box>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="h6">
                {title}

                {isCancelled ? (
                  <Typography className={styles.eventModalDangerBadge} color="white" variant="caption">
                    Cancelled
                  </Typography>
                ) : null}
              </Typography>
            </Box>
            <Typography variant="body2">
              {getFullLongDate(startsAt)}, {getDateTime(startsAt)} - {getDateTime(endsAt)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {eventTimeType} event
            </Typography>
          </Box>
        </Box>

        <Box className={styles.eventModalRow}>
          <Box className={styles.eventModalRowIconContainer}>
            <Tooltip title="Decription">
              <DescriptionOutlined />
            </Tooltip>
          </Box>
          <Box className={styles.eventModalRowContent}>
            <Typography variant="body2">{description || 'No description provided'}</Typography>
          </Box>
        </Box>

        <Box className={styles.eventModalRow}>
          <Box className={styles.eventModalRowIconContainer}>
            <Tooltip title="Event Page">
              <OpenInNewOutlined />
            </Tooltip>
          </Box>
          <Box className={styles.eventModalRowContent}>
            <Typography variant="body2">
              <Link href={Pages.getEventPageLink(id) || ''} target="_blank">
                More event information
              </Link>
            </Typography>
          </Box>
        </Box>

        <Box className={styles.eventModalRow}>
          <Box className={styles.eventModalRowIconContainer}>
            <Tooltip title={team ? 'Event team' : 'Event type'}>
              <GroupOutlined />
            </Tooltip>
          </Box>
          <Box className={styles.eventModalRowContent}>
            {team ? (
              <>
                <Typography variant="body2">
                  <Link href={Pages.getTeamPageLink(team.id) || ''} target="_blank">
                    {team.name}
                  </Link>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {eventType} Event
                </Typography>
              </>
            ) : (
              <Typography variant="body2">{eventType} Event</Typography>
            )}
          </Box>
        </Box>

        <Box className={styles.eventModalRow}>
          <Box className={styles.eventModalRowIconContainer}>
            <Tooltip title="Attendees information">
              <AssignmentTurnedInOutlined />
            </Tooltip>
          </Box>
          <Box className={styles.eventModalRowContent}>
            {team ? (
              <>
                <Typography variant="body2">
                  {guestsCount} invited {getPlural('guest', guestsCount)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {attendingGuestsCount} attending
                </Typography>
                {awaitingGuestsCount ? (
                  <Typography variant="caption" color="textSecondary">
                    {awaitingGuestsCount} awaiting
                  </Typography>
                ) : null}
                {declinedGuestsCount ? (
                  <Typography variant="caption" color="textSecondary">
                    {declinedGuestsCount} declined
                  </Typography>
                ) : null}
              </>
            ) : (
              <Typography variant="body2">
                {guestsCount} attending {getPlural('guest', guestsCount)}
              </Typography>
            )}
          </Box>
        </Box>

        <Box className={styles.eventModalRow}>
          <Box className={styles.eventModalRowIconContainer}>
            <Tooltip title="Event location">
              <PlaceOutlined />
            </Tooltip>
          </Box>
          <Box className={styles.eventModalRowContent}>
            <Typography variant="body2">{location?.locationName}</Typography>
            <Typography variant="caption" color="textSecondary">
              {address}
            </Typography>
          </Box>
        </Box>

        {owner ? (
          <Box className={styles.eventModalRow}>
            <Box className={styles.eventModalRowIconContainer}>
              <Tooltip title="Event owner">
                <EventOutlined />
              </Tooltip>
            </Box>
            <Box className={styles.eventModalRowContent}>
              <Typography variant="body2">
                <Link href={Pages.getUserPageLink(owner.id) || ''} target="_blank">
                  {owner.firstName} {owner.lastName}
                </Link>
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>
    </ModalComponent>
  );
};
