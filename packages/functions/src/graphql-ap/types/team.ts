import { Event, Team, TeamUser, User, Organization } from '@up-from/core/admin';
import { authorizeAdmin } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { builder } from '../builder.js';
import { UserType } from './user.js';
import { EventType } from './event.js';
import { OrganizationType } from './organization.js';

export const TeamType = builder.objectRef<Team.TeamShape>('Team');
const TeamUserType = builder.objectRef<TeamUser.TeamUserShape>('TeamUser');
const TeamUserRoles = builder.enumType('TeamUserRoles', {
  values: ['mentor', 'member'] as const,
});

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
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: team => handleVisibleError(() => team.updatedAt),
    }),
    organization: t.field({
      type: OrganizationType,
      resolve: team => handleVisibleError(() => Organization.findOneById(team.organizationId)),
    }),
    members: t.field({
      type: [TeamUserType],
      resolve: team => handleVisibleError(() => TeamUser.findMembers([team.id])),
    }),
    events: t.field({
      type: [EventType],
      resolve: team => handleVisibleError(() => Event.findAllByTeamId(team.id)),
    }),
  }),
});

TeamUserType.implement({
  fields: t => ({
    userId: t.exposeID('userId'),
    teamId: t.exposeID('teamId'),
    role: t.exposeString('role'),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: member => handleVisibleError(() => member.createdAt),
    }),
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: member => handleVisibleError(() => member.updatedAt),
    }),
    user: t.field({
      type: UserType,
      nullable: true,
      resolve: member => handleVisibleError(() => User.findOneById(member.userId)),
    }),
  }),
});

builder.queryFields(t => ({
  team: t.field({
    type: TeamType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.findOneById(id);
      }),
  }),
  allTeams: t.field({
    description: 'Retrieve all teams',
    type: [TeamType],
    nullable: true,
    resolve: () =>
      handleVisibleError(() => {
        authorizeAdmin();

        return Team.getAll();
      }),
  }),
  allOrganizationTeams: t.field({
    description: 'Retrieve all organization teams',
    type: [TeamType],
    nullable: true,
    args: {
      organizationId: t.arg.string({ required: true }),
    },
    resolve: (_, { organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.findOrganizationTeams(organizationId);
      }),
  }),
}));

builder.mutationFields(t => ({
  createTeam: t.field({
    type: TeamType,
    args: {
      name: t.arg.string({ required: true }),
      imageUrl: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      organizationId: t.arg.string({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.create(args);
      }),
  }),
  updateTeam: t.field({
    description: 'Update team info',
    type: TeamType,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      imageUrl: t.arg.string({ required: true }),
      organizationId: t.arg.string({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.update(args.id, args);
      }),
  }),
  disableTeam: t.field({
    description:
      "Disable a team and its enabled members. Users that were disabled before disabling the team are not included and won't be restored by enabling the team.",
    type: TeamType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.disable(id);
      }),
  }),
  enableTeam: t.field({
    description:
      "Enable a team and its members that were disabled by team disabling. Members that were disabled before team disabling won't be restored.",
    type: TeamType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.enable(id);
      }),
  }),
  generateTeamImageUploadUrl: t.field({
    description: 'Generates an image upload URL for team',
    type: 'String',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: teamId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.generateImageUploadUrl(teamId);
      }),
  }),
  completeTeamImageUpload: t.field({
    description: 'Completes team image upload process (converts uploaded image and moves it to a public storage)',
    type: TeamType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: teamId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.completeImageUpload(teamId);
      }),
  }),
  removeTeamImage: t.field({
    description: 'Removes team image',
    type: TeamType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: teamId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Team.removeImage(teamId);
      }),
  }),
  addTeamMember: t.field({
    description: 'Adds a new team member',
    type: TeamType,
    nullable: true,
    args: {
      teamId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      role: t.arg({ type: TeamUserRoles, required: true }),
    },
    resolve: (_, { teamId, userId, role }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        await TeamUser.add(teamId, userId, role);
        return Team.findOneById(teamId);
      }),
  }),
  removeTeamMember: t.field({
    description: 'Removes a team member',
    type: TeamType,
    nullable: true,
    args: {
      teamId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
    },
    resolve: (_, { teamId, userId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        await TeamUser.remove(teamId, userId);
        return Team.findOneById(teamId);
      }),
  }),
  updateTeamMemberRole: t.field({
    description: 'Update team member role',
    type: TeamType,
    nullable: true,
    args: {
      teamId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      role: t.arg({ type: TeamUserRoles, required: true }),
    },
    resolve: (_, { teamId, userId, role }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        await TeamUser.updateRole(teamId, userId, role);
        return Team.findOneById(teamId);
      }),
  }),
}));
