import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid } from '@mui/material';
import { Pages } from '~/constants/pages';
import { LinkTabContentComponent } from '~/components/Tabs/LinkTabContentComponent';
import { LinkTabsComponent } from '~/components/Tabs/LinkTabsComponent';
import { LoadingWrapperComponent } from '~/components/Loading/LoadingWrapperComponent';
import { MainLayout } from '~/layouts/MainLayout';
import { ProgressionChartComponent } from '~/components/Chart/ProgressionChartComponent';
import { useOrganizationQuery } from '~/api/useOrganizationQuery';
import { TeamsTableComponent } from '~/components/EntityTable/TeamsTable';
import { OrganizationCard } from '~/components/OrganizationCard';
import styles from './organization-page.module.scss';
import { TeamMember, TeamMembersTableComponent } from '~/components/EntityTable/TeamMembersTable';

export default function Organization() {
  const { query } = useRouter();
  const id: string = query.id as string;

  const { organization, fetching } = useOrganizationQuery(id);

  const teamsMembers = organization?.teams.map(team => team.members).flat() || [];

  const members = useMemo((): TeamMember[] => {
    if (!teamsMembers.length) return [];

    return teamsMembers
      .filter(member => !!member.user?.isSignupCompleted)
      .map(member => ({ ...member.user!, role: member.role }));
  }, [teamsMembers]);

  const invitedMembers = useMemo((): TeamMember[] => {
    if (!teamsMembers.length) return [];

    return teamsMembers
      .filter(member => member.user && !member.user.isSignupCompleted)
      .map(member => ({ ...member.user!, role: member.role }));
  }, [teamsMembers]);

  const tabs = useMemo(() => {
    if (!id) return [];

    return [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      {
        path: Pages.getOrganizationPageLink(id, Pages.INVITED_MEMBERS)!,
        label: `Invited Team Members (${invitedMembers.length})`,
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getOrganizationPageLink(id, Pages.MEMBERS)!, label: `Team Members (${members.length})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getOrganizationPageLink(id)!, label: `Teams (${organization?.teams.length})` },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { path: Pages.getOrganizationPageLink(id, Pages.CHARTS)!, label: `Charts` },
    ];
  }, [id, organization?.teams, members, invitedMembers]);

  return (
    <MainLayout title="Organization Details">
      <LoadingWrapperComponent isLoading={!organization || fetching}>
        {organization ? (
          <Box className={styles.organizationPage}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <OrganizationCard organization={organization} isEditable />
              </Grid>
            </Grid>

            <LinkTabsComponent tabs={tabs} />

            <LinkTabContentComponent path={tabs[0]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <TeamMembersTableComponent title="Invited Team Members" rows={members} isLoading={fetching} />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[1]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <TeamMembersTableComponent title="Team Members" rows={members} isLoading={fetching} />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[2]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <TeamsTableComponent title="Teams" rows={organization.teams} isLoading={fetching} organizationId={id} />
              </Grid>
            </LinkTabContentComponent>

            <LinkTabContentComponent path={tabs[3]?.path}>
              <Grid size={{ xs: 12, md: 12 }}>
                <ProgressionChartComponent
                  title="Activity"
                  isLoading={!organization || fetching}
                  series={[
                    {
                      id: 'teams',
                      label: 'Teams',
                      data: organization.teams,
                      color: '#2E96FF',
                    },
                    {
                      id: 'members',
                      label: 'Members',
                      data: teamsMembers,
                      color: '#02B2AF',
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
