import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid } from '@mui/material';
import { UserCard } from '~/components/UserCard';
import { useUserProfileByIDQuery } from '~/api/useUserProfileByIDQuery';
import { TableOrder } from '~/types/table';
import { LoadingWrapperComponent } from '~/components/Loading/LoadingWrapperComponent';
import { MainLayout } from '~/layouts/MainLayout';
import { Pages } from '~/constants/pages';
import { LinkTabsComponent } from '~/components/Tabs/LinkTabsComponent';
import { LinkTabContentComponent } from '~/components/Tabs/LinkTabContentComponent';
import { ProgressionChartComponent } from '~/components/Chart/ProgressionChartComponent';
import { splitOngoingAndOtherEvents } from '~/util/event';
import { EventsTableComponent } from '~/components/EntityTable/EventsTable';
import { UserTeamsTableComponent } from '~/components/EntityTable/UserTeamsTable';
import styles from './user-page.module.scss';
import { MapViewComponent } from '~/components/MapViewComponent';
import { DEFAULT_TEAM_IMG_URL } from '~/constants/config';

export default function User() {
  const { query } = useRouter();
  const id: string = query.id as string;

  const { user, fetching } = useUserProfileByIDQuery(id);

  const events = useMemo(() => {
    return splitOngoingAndOtherEvents(user?.events);
  }, [user?.events]);

  const tabs = useMemo(() => {
    if (!id) return [];

    return [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      {
        path: Pages.getUserPageLink(id, Pages.ONGOING_EVENTS)!,
        label: `Ongoing Events (${events.ongoing?.length || 0})`,
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getUserPageLink(id)!, label: `Events (${events?.other.length || 0})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getUserPageLink(id, Pages.TEAMS)!, label: `Teams (${user?.teams.length || 0})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getUserPageLink(id, Pages.CHARTS)!, label: 'Charts' },
    ];
  }, [id, events.other?.length, events.ongoing?.length, user?.teams.length]);

  return (
    <MainLayout title="User Details">
      <LoadingWrapperComponent isLoading={!user || fetching}>
        {user ? (
          <Box className={styles.userPage}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <UserCard user={user} isEditable={true} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MapViewComponent
                  centerPoint={{
                    center: { lat: Number(user.location?.lat), lng: Number(user.location?.lng) },
                    zoom: 4,
                  }}
                  width="100%"
                  items={[
                    {
                      id: user.id,
                      header: user.firstName + '' + user.lastName,
                      lat: Number(user.location?.lat),
                      lng: Number(user.location?.lng),
                      imageUrl: user.avatarUrl ? user.avatarUrl : DEFAULT_TEAM_IMG_URL,
                      itemType: 'user',
                    },
                  ]}
                />
              </Grid>
            </Grid>

            <LinkTabsComponent tabs={tabs} />

            <LinkTabContentComponent path={tabs[0]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <EventsTableComponent
                  title="Ongoing events"
                  isLoading={fetching}
                  defaultOrderBy="startsAt"
                  defaultOrder={TableOrder.ASC}
                  rows={events.ongoing}
                  isAddingNewDisabled
                />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[1]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <EventsTableComponent
                  isLoading={fetching}
                  defaultOrderBy="startsAt"
                  defaultOrder={TableOrder.ASC}
                  rows={user.events}
                  isAddingNewDisabled
                />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[2]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <UserTeamsTableComponent isLoading={fetching} rows={user.teams} userId={id} />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[3]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <ProgressionChartComponent
                  title="Activity"
                  isLoading={!user || fetching}
                  series={[
                    {
                      id: 'teams',
                      label: 'Teams',
                      data: user.teams,
                      color: '#5A45DD',
                    },
                    {
                      id: 'events',
                      label: 'Events',
                      data: user.events,
                      color: '#2E96FF',
                    },
                  ]}
                />
              </Grid>
            </LinkTabContentComponent>
          </Box>
        ) : null}
      </LoadingWrapperComponent>
    </MainLayout>
  );
}
