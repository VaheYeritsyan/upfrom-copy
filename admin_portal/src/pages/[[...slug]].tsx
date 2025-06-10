import React, { FC, useMemo } from 'react';
import { useAllEventsQuery } from '~/api/useAllEventsQuery';
import { Pages } from '~/constants/pages';
import { useAllPastEventsQuery } from '~/api/useAllPastEventsQuery';
import { useAllTeamsQuery } from '~/api/useAllTeamsQuery';
import { useAllUsersQuery } from '~/api/useAllUsersQuery';
import { useAllAdminsQuery } from '~/api/useAllAdminsQuery';
import { TableComponent } from '~/components/Table/TableComponent';
import { LinkTabContentComponent } from '~/components/Tabs/LinkTabContentComponent';
import { MainLayout } from '~/layouts/MainLayout';
import { EventsTableComponent } from '~/components/EntityTable/EventsTable';
import { getFormattedNumber } from '~/util/text';
import { useTopUsersQuery } from '~/api/useTopUsersQuery';
import { UsersTableComponent } from '~/components/EntityTable/UsersTable';
import { TopUsersTableComponent } from '~/components/EntityTable/TopUsersTable';
import { AdminsTableComponent } from '~/components/EntityTable/AdminsTable';
import { TeamsTableComponent } from '~/components/EntityTable/TeamsTable';
import { ProgressionChartComponent } from '~/components/Chart/ProgressionChartComponent';
import { CalendarComponent } from '~/components/Calendar/CalendarComponent';
import { InvitedUsersTableComponent } from '~/components/EntityTable/InvitedUsersTable';
import { useAllOrganizationsQuery } from '~/api/useAllOrganizationsQuery';
import { OrganizationsTableComponent } from '~/components/EntityTable/OrganizationsTable';
import { MapViewComponent } from '~/components/MapViewComponent';
import { DEFAULT_TEAM_IMG_URL } from '~/constants/config';

const DashboardPage: FC = () => {
  const eventsData = useAllEventsQuery();
  const pastEventsData = useAllPastEventsQuery();
  const teamsData = useAllTeamsQuery();
  const usersData = useAllUsersQuery();
  const adminsData = useAllAdminsQuery();
  const topUsersData = useTopUsersQuery();
  const organizationsData = useAllOrganizationsQuery();

  const invitedUsers = useMemo(() => {
    return usersData.users.filter(user => !user.isSignupCompleted);
  }, [usersData.users]);

  const users = useMemo(() => {
    return usersData.users.filter(user => user.isSignupCompleted);
  }, [usersData.users]);

  const isStatsFetching =
    eventsData.fetching ||
    pastEventsData.fetching ||
    teamsData.fetching ||
    usersData.fetching ||
    adminsData.fetching ||
    organizationsData.fetching;
  const stats = isStatsFetching
    ? []
    : [
        {
          id: 'required field',
          admins: getFormattedNumber(adminsData.admins.length),
          invitedUsers: getFormattedNumber(invitedUsers.length),
          users: getFormattedNumber(users.length),
          totalUsers: getFormattedNumber(usersData.users.length),
          organizations: getFormattedNumber(organizationsData.organizations.length),
          teams: getFormattedNumber(teamsData.teams.length),
          ongoingEvents: getFormattedNumber(eventsData.ongoing.length),
          upcomingEvents: getFormattedNumber(eventsData.events.length),
          pastEvents: getFormattedNumber(pastEventsData.events.length),
          allEvents: getFormattedNumber(eventsData.events.length + pastEventsData.events.length),
        },
      ];

  const tabs = useMemo(() => Pages.getNavigationTabs(), []);

  const usersPins = usersData.users.map(item => {
    return {
      id: item.id,
      header: item.firstName + ' ' + item.lastName,
      lat: Number(item.location?.lat),
      lng: Number(item.location?.lng),
      imageUrl: item.avatarUrl ? item.avatarUrl : DEFAULT_TEAM_IMG_URL,
      itemType: 'user',
    };
  });

  const eventsPins = [
    ...eventsData.events.map(item => {
      return {
        id: item.id,
        header: item.title,
        lat: Number(item.location?.lat),
        lng: Number(item.location?.lng),
        imageUrl: item.imageUrl ? item.imageUrl : DEFAULT_TEAM_IMG_URL,
        itemType: 'event',
      };
    }),
    ...eventsData.ongoing.map(item => {
      return {
        id: item.id,
        header: item.title,
        lat: Number(item.location?.lat),
        lng: Number(item.location?.lng),
        imageUrl: item.imageUrl ? item.imageUrl : DEFAULT_TEAM_IMG_URL,
        itemType: 'event',
      };
    }),
    ...pastEventsData.events.map(item => {
      return {
        id: item.id,
        header: item.title,
        lat: Number(item.location?.lat),
        lng: Number(item.location?.lng),
        imageUrl: item.imageUrl ? item.imageUrl : DEFAULT_TEAM_IMG_URL,
        itemType: 'event',
      };
    }),
  ];

  const allMapPins = [...eventsPins, ...usersPins];

  return (
    <MainLayout title="Dashboard">
      <LinkTabContentComponent path={tabs[0]?.path}>
        {eventsData.events &&
          pastEventsData.events &&
          eventsData.ongoing &&
          !eventsData.fetching &&
          !pastEventsData.fetching &&
          usersData.users &&
          !usersData.fetching && <MapViewComponent items={allMapPins}></MapViewComponent>}

        <TableComponent
          title="Real-Time Dashboard"
          isActionsHidden
          isLoading={isStatsFetching}
          rows={stats}
          cells={[
            'id',
            'admins',
            'invitedUsers',
            'users',
            'totalUsers',
            'organizations',
            'teams',
            'ongoingEvents',
            'upcomingEvents',
            'pastEvents',
            'allEvents',
          ]}
        />

        <ProgressionChartComponent
          isLoading={isStatsFetching}
          series={[
            {
              id: 'users',
              label: 'Users',
              data: usersData.users,
              color: '#02B2AF',
            },
            {
              id: 'organizations',
              label: 'Organizations',
              data: organizationsData.organizations,
              color: '#FCBA03',
            },
            {
              id: 'teams',
              label: 'Teams',
              data: teamsData.teams,
              color: '#2E96FF',
            },
            {
              id: 'events',
              label: 'Events',
              data: [...pastEventsData.events, ...eventsData.events],
              color: '#B800D8',
            },
            {
              id: 'admins',
              label: 'Admins',
              data: adminsData.admins,
              color: '#60009B',
            },
          ]}
        />

        <TopUsersTableComponent rows={topUsersData.users} isLoading={topUsersData.fetching} />
      </LinkTabContentComponent>

      <LinkTabContentComponent path={tabs[1]?.path}>
        {usersData.users && !usersData.fetching && <MapViewComponent items={usersPins} />}

        <InvitedUsersTableComponent rows={invitedUsers} isLoading={usersData.fetching} />
        <UsersTableComponent rows={users} isLoading={usersData.fetching} />
      </LinkTabContentComponent>

      <LinkTabContentComponent path={tabs[2]?.path}>
        <OrganizationsTableComponent rows={organizationsData.organizations} isLoading={organizationsData.fetching} />
      </LinkTabContentComponent>

      <LinkTabContentComponent path={tabs[3]?.path}>
        <TeamsTableComponent rows={teamsData.teams} isLoading={teamsData.fetching} />
      </LinkTabContentComponent>

      <LinkTabContentComponent path={tabs[4]?.path}>
        {eventsData.events &&
          pastEventsData.events &&
          eventsData.ongoing &&
          !eventsData.fetching &&
          !pastEventsData.fetching && <MapViewComponent items={eventsPins}></MapViewComponent>}
        <EventsTableComponent
          title="Ongoing events"
          isLoading={eventsData.fetching}
          rows={eventsData.ongoing}
          isAddingNewDisabled
        />
        <EventsTableComponent isLoading={eventsData.fetching} rows={eventsData.events} />
        <EventsTableComponent
          title="Past Events"
          isAddingNewDisabled
          isLoading={pastEventsData.fetching}
          rows={pastEventsData.events}
        />
      </LinkTabContentComponent>

      <LinkTabContentComponent path={tabs[5]?.path}>
        <AdminsTableComponent rows={adminsData.admins} isLoading={adminsData.fetching} />
      </LinkTabContentComponent>

      <LinkTabContentComponent path={tabs[6]?.path}>
        <CalendarComponent
          teams={teamsData.teams}
          organizations={organizationsData.organizations}
          isTeamsLoading={teamsData.fetching}
          isOrganizationsLoading={organizationsData.fetching}
          isLoadingUpcoming={eventsData.fetching}
          isLoadingPast={pastEventsData.fetching}
          events={[...eventsData.events, ...pastEventsData.events]}
        />
      </LinkTabContentComponent>
    </MainLayout>
  );
};

export default DashboardPage;
