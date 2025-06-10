import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Pages } from '~/constants/pages';
import { LinkTabsComponent } from '~/components/Tabs/LinkTabsComponent';
import { LinkTabContentComponent } from '~/components/Tabs/LinkTabContentComponent';
import { Box, Grid, Typography } from '@mui/material';
import { UserCard } from '~/components/UserCard';
import { TeamCard } from '~/components/TeamCard';
import { EventCard } from '~/components/EventCard';
import { useEventByIDQuery } from '~/api/useEventByIDQuery';
import { UserWithAttending } from '~/types/eventUsers';
import { LoadingWrapperComponent } from '~/components/Loading/LoadingWrapperComponent';
import { MainLayout } from '~/layouts/MainLayout';
import { EventGuestsTableComponent } from '~/components/EntityTable/EventGuestsTable';
import styles from './event-page.module.scss';
import { OrganizationCard } from '~/components/OrganizationCard';
import { MapViewComponent } from '~/components/MapViewComponent';
import { DEFAULT_TEAM_IMG_URL } from '~/constants/config';

const EventsPage = () => {
  const { query } = useRouter();
  const id: string = query.id as string;
  const { event, fetching } = useEventByIDQuery(id);

  const tabs = useMemo(() => {
    if (!id) return [];

    return [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getEventPageLink(id)!, label: 'Info' },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getEventPageLink(id, Pages.GUESTS)!, label: `Guests (${event?.guests?.length || 0})` },
    ];
  }, [id, event?.guests?.length]);

  return (
    <MainLayout title="Event Details">
      <LoadingWrapperComponent isLoading={!event || fetching}>
        {event ? (
          <Box className={styles.eventPage}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <EventCard event={event} isEditable={true} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MapViewComponent
                  centerPoint={{
                    center: { lat: Number(event.location?.lat), lng: Number(event.location?.lng) },
                    zoom: 4,
                  }}
                  width="100%"
                  items={[
                    {
                      id: event.id,
                      header: event.title,
                      lat: Number(event.location?.lat),
                      lng: Number(event.location?.lng),
                      imageUrl: event.imageUrl ? event.imageUrl : DEFAULT_TEAM_IMG_URL,
                      itemType: 'event',
                    },
                  ]}
                />
              </Grid>
            </Grid>

            <LinkTabsComponent tabs={tabs} />
            <LinkTabContentComponent path={tabs[0]?.path}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6">Organization</Typography>
                  {event.team?.organization && (
                    <OrganizationCard organization={event.team.organization} isEditable={false} />
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6">Team</Typography>
                  {event.team && <TeamCard team={event.team} isEditable={false} />}
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Typography variant="h6">Owner</Typography>
                  {event.owner && <UserCard user={event.owner} isEditable={false} />}
                </Grid>
              </Grid>
            </LinkTabContentComponent>
            <LinkTabContentComponent path={tabs[1]?.path}>
              {event.guests.length > 0 && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <EventGuestsTableComponent
                    isLoading={fetching}
                    eventId={event.id}
                    rows={
                      event.guests.map(item => ({
                        ...item.user,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        isAttending: item.isAttending,
                      })) as UserWithAttending[]
                    }
                  />
                </Grid>
              )}
            </LinkTabContentComponent>
          </Box>
        ) : null}
      </LoadingWrapperComponent>
    </MainLayout>
  );
};

export default EventsPage;
