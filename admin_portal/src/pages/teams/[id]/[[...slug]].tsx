import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid } from '@mui/material';
import { TeamCard } from '~/components/TeamCard';
import { useTeamByIDQuery } from '~/api/useTeamByIDQuery';
import { Pages } from '~/constants/pages';
import { LinkTabContentComponent } from '~/components/Tabs/LinkTabContentComponent';
import { LinkTabsComponent } from '~/components/Tabs/LinkTabsComponent';
import { LoadingWrapperComponent } from '~/components/Loading/LoadingWrapperComponent';
import { MainLayout } from '~/layouts/MainLayout';
import { EventsTableComponent } from '~/components/EntityTable/EventsTable';
import { TeamMembersTableComponent, TeamMember } from '~/components/EntityTable/TeamMembersTable';
import { ProgressionChartComponent } from '~/components/Chart/ProgressionChartComponent';
import { splitOngoingAndOtherEvents } from '~/util/event';
import styles from './team-page.module.scss';
import { OrganizationCard } from '~/components/OrganizationCard';
import { MapViewComponent } from '~/components/MapViewComponent';
import { DEFAULT_TEAM_IMG_URL } from '~/constants/config';

export default function Team() {
  const { query } = useRouter();
  const id: string = query.id as string;

  const { team, fetching } = useTeamByIDQuery(id);

  const members = useMemo((): TeamMember[] => {
    if (!team?.members.length) return [];

    return team.members
      .filter(member => !!member.user?.isSignupCompleted)
      .map(member => ({ ...member.user!, role: member.role }));
  }, [team?.members]);

  const invitedMembers = useMemo((): TeamMember[] => {
    if (!team?.members.length) return [];

    return team.members
      .filter(member => member.user && !member.user.isSignupCompleted)
      .map(member => ({ ...member.user!, role: member.role }));
  }, [team?.members]);

  const events = useMemo(() => {
    return splitOngoingAndOtherEvents(team?.events);
  }, [team?.events]);

  const tabs = useMemo(() => {
    if (!id) return [];

    return [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getTeamPageLink(id, Pages.INVITED_MEMBERS)!, label: `Invited Users (${invitedMembers.length})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getTeamPageLink(id)!, label: `Members (${members.length})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      {
        path: Pages.getTeamPageLink(id, Pages.ONGOING_EVENTS)!,
        label: `Ongoing Events (${events.ongoing?.length || 0})`,
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getTeamPageLink(id, Pages.EVENTS)!, label: `Events (${events.other?.length || 0})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getTeamPageLink(id, Pages.CHARTS)!, label: 'Charts' },
    ];
  }, [id, invitedMembers.length, members.length, events]);

  return (
    <MainLayout title="Team Details">
      <LoadingWrapperComponent isLoading={!team || fetching}>
        {team ? (
          <Box className={styles.teamPage}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TeamCard team={team} isEditable />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {team.organization ? <OrganizationCard organization={team.organization} isEditable={false} /> : null}
              </Grid>
            </Grid>

            <LinkTabsComponent tabs={tabs} />

            <LinkTabContentComponent path={tabs[0]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <TeamMembersTableComponent
                  title="Invited Members"
                  teamId={team.id}
                  rows={invitedMembers}
                  isLoading={fetching}
                />
              </Grid>
            </LinkTabContentComponent>
            <LinkTabContentComponent path={tabs[1]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                {members.length > 0 && (
                  <MapViewComponent
                    items={members.map(item => {
                      return {
                        id: item.id,
                        header: item.firstName + ' ' + item.lastName,
                        lat: Number(item.location?.lat),
                        lng: Number(item.location?.lng),
                        imageUrl: item.avatarUrl ? item.avatarUrl : DEFAULT_TEAM_IMG_URL,
                        itemType: 'user',
                      };
                    })}
                  />
                )}
                <TeamMembersTableComponent teamId={team.id} rows={members} isLoading={fetching} />
              </Grid>
            </LinkTabContentComponent>
            <LinkTabContentComponent path={tabs[2]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                {events.ongoing.length > 0 && (
                  <MapViewComponent
                    items={events.ongoing.map(item => {
                      return {
                        id: item.id,
                        header: item.title,
                        lat: Number(item.location?.lat),
                        lng: Number(item.location?.lng),
                        imageUrl: item.imageUrl ? item.imageUrl : DEFAULT_TEAM_IMG_URL,
                        itemType: 'event',
                      };
                    })}
                  />
                )}

                <EventsTableComponent
                  title="Ongoing Events"
                  isLoading={fetching}
                  isAddingNewDisabled
                  rows={events.ongoing}
                />
              </Grid>
            </LinkTabContentComponent>
            <LinkTabContentComponent path={tabs[3]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                {events.other.length > 0 && (
                  <MapViewComponent
                    items={events.other.map(item => {
                      return {
                        id: item.id,
                        header: item.title,
                        lat: Number(item.location?.lat),
                        lng: Number(item.location?.lng),
                        imageUrl: item.imageUrl ? item.imageUrl : DEFAULT_TEAM_IMG_URL,
                        itemType: 'event',
                      };
                    })}
                  />
                )}

                <EventsTableComponent isLoading={fetching} isAddingNewDisabled rows={events.other} />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[4]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <ProgressionChartComponent
                  title="Activity"
                  isLoading={!team || fetching}
                  series={[
                    {
                      id: 'members',
                      label: 'Members',
                      data: team.members,
                      color: '#02B2AF',
                    },
                    {
                      id: 'events',
                      label: 'Events',
                      data: team.events,
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
