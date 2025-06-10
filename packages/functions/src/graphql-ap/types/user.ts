import { Event, Team, TeamUser, User } from '@up-from/core/admin';
import { authorizeAdmin, VisibleError } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { builder, LocationType, LocationInput, Location } from '../builder.js';
import { TeamType } from './team.js';
import { EventType } from './event.js';

export const UserType = builder.objectRef<User.UserShape>('User');

UserType.implement({
  fields: t => ({
    id: t.exposeID('id'),
    firstName: t.exposeString('firstName', { nullable: true }),
    lastName: t.exposeString('lastName', { nullable: true }),
    email: t.exposeString('email'),
    phone: t.exposeString('phone', { nullable: true }),
    birthday: t.field({
      type: 'Date',
      nullable: true,
      resolve: user => handleVisibleError(() => user?.birthday),
    }),
    gender: t.exposeString('gender', { nullable: true }),
    about: t.exposeString('about', { nullable: true }),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    isDisabled: t.exposeBoolean('isDisabled', { nullable: false }),
    isSignupCompleted: t.exposeBoolean('isSignupCompleted', { nullable: false }),
    location: t.field({
      type: LocationType,
      nullable: true,
      resolve: user =>
        handleVisibleError(() => {
          let location = null;
          if (user.location) {
            try {
              location = JSON.parse(user.location);
            } catch (err) {
              new VisibleError('Failed to parse location', {
                isExposable: true,
                cause: err,
                extraInput: { userId: user.id, location: user.location },
              });
            }
          }
          return location as Location | null;
        }),
    }),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: user => handleVisibleError(() => user.createdAt),
    }),
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: user => handleVisibleError(() => user.updatedAt),
    }),
    teams: t.field({
      type: [TeamType],
      resolve: user => handleVisibleError(() => Team.findUserTeams(user.id)),
    }),
    events: t.field({
      type: [EventType],
      resolve: user => handleVisibleError(() => Event.findAllUserEventsByUserId(user.id)),
    }),
  }),
});

builder.queryFields(t => ({
  user: t.field({
    type: UserType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.findOneById(id);
      }),
  }),
  allUsers: t.field({
    description: 'Retrieve all users',
    type: [UserType],
    nullable: true,
    resolve: () =>
      handleVisibleError(() => {
        authorizeAdmin();
        return User.getAll();
      }),
  }),
  allOrganizationUsers: t.field({
    description: 'Retrieve all organization users',
    type: [UserType],
    nullable: true,
    args: {
      organizationId: t.arg.string({ required: true }),
    },
    resolve: (_, { organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.findAllByOrganizationId(organizationId);
      }),
  }),
}));

builder.mutationFields(t => ({
  createUser: t.field({
    description: 'Create a new user',
    type: UserType,
    args: {
      phone: t.arg.string(),
      email: t.arg.string({ required: true }),
      gender: t.arg.string(),
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      about: t.arg.string(),
      birthday: t.arg({ type: 'Date' }),
      avatarUrl: t.arg.string(),
      isSignupCompleted: t.arg.boolean({ required: true }),
      location: t.arg({ type: LocationInput, required: false }),
    },
    resolve: (_, args) =>
      handleVisibleError(() => {
        authorizeAdmin();
        const location = JSON.stringify(args.location);
        return User.create({ ...args, location });
      }),
  }),
  createTeamUser: t.field({
    description: 'Create a new user and add them to a team',
    type: UserType,
    args: {
      phone: t.arg.string(),
      email: t.arg.string({ required: true }),
      gender: t.arg.string(),
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      about: t.arg.string(),
      birthday: t.arg({ type: 'Date' }),
      avatarUrl: t.arg.string(),
      location: t.arg({ type: LocationInput, required: false }),
      teamId: t.arg.string({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        const location = JSON.stringify(args.location);

        const user = await User.create({ ...args, location, isSignupCompleted: false });
        await TeamUser.add(args.teamId, user.id, 'member');
        return user;
      }),
  }),
  disableUser: t.field({
    description: 'Disable user account',
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: userId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.disable(userId);
      }),
  }),
  enableUser: t.field({
    description: 'Enable user account',
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: userId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.enable(userId);
      }),
  }),
  updateUser: t.field({
    description: 'Update user profile',
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
      firstName: t.arg.string({ required: true }),
      lastName: t.arg.string({ required: true }),
      phone: t.arg.string({ required: true }),
      email: t.arg.string({ required: true }),
      birthday: t.arg({ type: 'Date', required: true }),
      gender: t.arg.string({ required: true }),
      about: t.arg.string({ required: true }),
      avatarUrl: t.arg.string(),
      location: t.arg({ type: LocationInput, required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        const location = JSON.stringify(args.location);

        return User.update(args.id, { ...args, location });
      }),
  }),
  generateAvatarUploadUrl: t.field({
    description: 'Generates an avatar upload URL for a user',
    type: 'String',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.generateAvatarUploadUrl(id);
      }),
  }),
  removeAvatar: t.field({
    description: 'Removes avatar for a user',
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.removeAvatar(id);
      }),
  }),
  completeAvatarUpload: t.field({
    description: 'Completes avatar upload process (converts uploaded avatar and moves to public storage)',
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(() => {
        authorizeAdmin();

        return User.completeAvatarUpload(id);
      }),
  }),
  sendInvitationEmail: t.field({
    description: 'Sends an invitation email with registration instructions',
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return User.sendInvitationEmail(id);
      }),
  }),
}));
