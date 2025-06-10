import { Team, TeamUser, User, Organization } from '@up-from/core';
import { getAuthorizedUserProperties, authorizeUser } from '@up-from/util/session';

import { handleVisibleError } from '#util/graphql-error';
import { UserType } from './user.js';
import { builder } from '../builder.js';
import { OrganizationType } from './organization.js';

export const TeamType = builder.objectRef<Team.TeamShape>('Team');
const TeamMemberType = builder.objectRef<TeamUser.TeamUserShape>('TeamUser');

TeamType.implement({
  fields: t => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    imageUrl: t.exposeString('imageUrl', { nullable: true }),
    description: t.exposeString('description'),
    isDisabled: t.exposeBoolean('isDisabled'),
    organizationId: t.exposeID('organizationId'),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: team => handleVisibleError(() => team.createdAt),
    }),
    organization: t.field({
      type: OrganizationType,
      resolve: team =>
        handleVisibleError(() => {
          const { id } = getAuthorizedUserProperties();
          return Organization.getOneOrganizationForUser(team.organizationId, id);
        }),
    }),
    members: t.field({
      type: [TeamMemberType],
      resolve: team => handleVisibleError(() => TeamUser.findValidMembers([team.id])),
    }),
    myMembership: t.field({
      type: TeamMemberType,
      nullable: true,
      resolve: team =>
        handleVisibleError(() => {
          const { id: userId } = getAuthorizedUserProperties();
          return TeamUser.findOne(team.id, userId);
        }),
    }),
  }),
});

TeamMemberType.implement({
  fields: t => ({
    userId: t.exposeID('userId'),
    teamId: t.exposeID('teamId'),
    role: t.exposeString('role'),
    user: t.field({
      type: UserType,
      nullable: true,
      resolve: member => handleVisibleError(() => User.findOneById(member.userId)),
    }),
  }),
});

builder.queryFields(t => ({
  myTeams: t.field({
    type: [TeamType],
    resolve: () =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return Team.findTeamsByUserId(id);
      }),
  }),
  team: t.field({
    description: 'Retrieve a single team',
    type: TeamType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: teamId }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return Team.getValidTeamForUser(teamId, userId);
      }),
  }),
  teamTotalAmount: t.field({
    type: 'Int',
    resolve: () =>
      handleVisibleError(() => {
        authorizeUser();
        return Team.getTotalAmount();
      }),
  }),
}));
