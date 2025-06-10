import { Team, TeamUser } from '@up-from/graphql/genql';
import { TeamUser as TeamUserAP } from '@up-from/graphql-ap/genql';

export const getOrganizationFromTeam = (team: Team) => {
  return team.organization;
};

export const getOrganizationsFromTeams = (teams: Team[]) => {
  const organizationsMap = new Map<Team['organization']['id'], Team['organization']>();

  for (const { organization } of teams) {
    organizationsMap.set(organization.id, organization);
  }

  return Array.from(organizationsMap.values());
};

export const getOrganizationsMembersFromTeams = (teams: Team[]) => {
  const members = teams
    .map(team => (team.members as Required<TeamUser>[]).map(member => ({ ...member, organization: team.organization })))
    .flat();

  const membersMap = new Map(members.map(member => [member.user?.id ?? '', member]));

  return Array.from(membersMap.values()).sort((a, b) => a.user?.createdAt - b.user?.createdAt);
};

export const getUserTeamRole = (members?: (TeamUser | TeamUserAP)[], userId?: string) => {
  if (!members?.length || !userId) return 'Unknown';

  return members.find(member => member?.user?.id === userId)?.role || 'Unknown';
};
