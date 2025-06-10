import { authorizeUser, getAuthorizedUserProperties, VisibleError } from '@up-from/util';
import { Chat, Team, User, UserDevice } from '@up-from/core';

import { handleVisibleError } from '#util/graphql-error';
import { TeamType } from './team.js';
import { builder, LocationInput, LocationType, Location } from '../builder.js';

type UserProfile = Pick<
  User.UserShape,
  'id' | 'birthday' | 'email' | 'phone' | 'gender' | 'isSignupCompleted' | 'location'
>;

export const UserType = builder.objectRef<User.UserShape>('User');

const ChatUserProfileType = builder.objectRef<Chat.ChatUserProfile>('ChatUserData').implement({
  fields: t => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    image: t.exposeString('image', { nullable: true }),
  }),
});

const UserDeviceType = builder.objectRef<UserDevice.UserDeviceShape>('UserDevice').implement({
  fields: t => ({
    userId: t.exposeID('userId'),
    deviceId: t.exposeID('deviceId'),
  }),
});

const UserNotificationPreferencesType = builder
  .objectRef<User.UserNotificationPrefShape>('UserNotificationPreferences')
  .implement({
    fields: t => ({
      userId: t.exposeID('userId'),
      pushChatNewMessage: t.exposeBoolean('pushChatNewMessage'),
      pushEventNewInvitation: t.exposeBoolean('pushEventNewInvitation'),
      pushEventNewAllTeam: t.exposeBoolean('pushEventNewAllTeam'),
      pushEventUpdatedDateTime: t.exposeBoolean('pushEventUpdatedDateTime'),
      pushEventUpdatedLocation: t.exposeBoolean('pushEventUpdatedLocation'),
      pushEventCancelled: t.exposeBoolean('pushEventCancelled'),
      pushEventRemovedIndividual: t.exposeBoolean('pushEventRemovedIndividual'),
      pushTeamNewMember: t.exposeBoolean('pushTeamNewMember'),
      emailChatNewMessage: t.exposeBoolean('emailChatNewMessage'),
      emailEventPendingInvitation: t.exposeBoolean('emailEventPendingInvitation'),
    }),
  });

const UserProfileType = builder.objectRef<UserProfile>('UserProfile').implement({
  fields: t => ({
    birthday: t.field({
      type: 'Date',
      nullable: true,
      resolve: user => handleVisibleError(() => user?.birthday),
    }),
    email: t.exposeString('email'),
    phone: t.exposeString('phone', { nullable: true }),
    gender: t.exposeString('gender', { nullable: true }),
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
  }),
});

UserType.implement({
  fields: t => ({
    id: t.exposeID('id'),
    firstName: t.exposeString('firstName', { nullable: true }),
    lastName: t.exposeString('lastName', { nullable: true }),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    about: t.exposeString('about', { nullable: true }),
    isDisabled: t.exposeBoolean('isDisabled', { nullable: false }),
    profile: t.field({
      type: UserProfileType,
      nullable: true,
      resolve: user =>
        handleVisibleError(() => {
          const { id } = getAuthorizedUserProperties();
          if (user.id === id) return user;
        }),
    }),
    notificationPreferences: t.field({
      type: UserNotificationPreferencesType,
      nullable: true,
      resolve: user =>
        handleVisibleError(() => {
          const { id } = getAuthorizedUserProperties();
          if (user.id === id) return User.findUserNotificationPreferences(user.id);
        }),
    }),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: user => handleVisibleError(() => user.createdAt),
    }),
    teams: t.field({
      type: [TeamType],
      resolve: user =>
        handleVisibleError(() => {
          if (user.isDisabled) return [];

          const { id } = getAuthorizedUserProperties();
          return Team.findMutualTeamsByUserId(user.id, id);
        }),
    }),
    chatData: t.field({
      type: ChatUserProfileType,
      resolve: parent => handleVisibleError(() => Chat.getChatUserProfile(parent)),
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
      handleVisibleError(() => {
        authorizeUser();
        return User.findOneById(id);
      }),
  }),
  currentUser: t.field({
    type: UserType,
    nullable: true,
    resolve: () =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return User.findOneById(id);
      }),
  }),
}));

builder.mutationFields(t => ({
  updateMyUser: t.field({
    description: 'Update profile of current user',
    type: UserType,
    nullable: true,
    args: {
      gender: t.arg.string(),
      firstName: t.arg.string({ required: true }),
      lastName: t.arg.string({ required: true }),
      about: t.arg.string({ required: true }),
      birthday: t.arg({ type: 'Date', required: true }),
      location: t.arg({ type: LocationInput, required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        const { id } = getAuthorizedUserProperties();
        const location = JSON.stringify(args.location);
        return User.update(id, { ...args, location });
      }),
  }),
  completeSignUp: t.field({
    description: 'Complete sign up by providing additional profile info',
    type: UserType,
    args: {
      gender: t.arg.string(),
      firstName: t.arg.string({ required: true }),
      lastName: t.arg.string({ required: true }),
      about: t.arg.string({ required: true }),
      birthday: t.arg({ type: 'Date', required: true }),
      location: t.arg({ type: LocationInput, required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        const location = JSON.stringify(args.location);
        return User.completeSignUp(id, { ...args, location });
      }),
  }),
  generateAvatarUploadUrl: t.field({
    description: 'Generates an avatar upload URL for current user',
    type: 'String',
    resolve: () =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return User.generateAvatarUploadUrl(id);
      }),
  }),
  removeAvatar: t.field({
    description: 'Removes avatar for current user',
    type: UserType,
    resolve: () =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return User.removeAvatar(id);
      }),
  }),
  completeAvatarUpload: t.field({
    description: 'Completes avatar upload process (converts uploaded avatar and moves to public storage)',
    type: UserType,
    resolve: () =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return User.completeAvatarUpload(id);
      }),
  }),
  addDeviceId: t.field({
    description: 'Add a device ID to receive push notifications',
    type: UserDeviceType,
    nullable: false,
    args: {
      deviceId: t.arg.string({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return UserDevice.create({ userId: id, deviceId: args.deviceId });
      }),
  }),
  removeDeviceId: t.field({
    description: 'Remove a device ID to stop receiving push notifications',
    type: UserDeviceType,
    nullable: true,
    args: {
      deviceId: t.arg.string({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(() => {
        const { id } = getAuthorizedUserProperties();
        return UserDevice.removeOne(id, args.deviceId);
      }),
  }),
  updateMyNotificationPreferences: t.field({
    description: 'Update notification preferences for current user',
    type: UserType,
    args: {
      pushChatNewMessage: t.arg.boolean({ required: true }),
      pushEventNewInvitation: t.arg.boolean({ required: true }),
      pushEventNewAllTeam: t.arg.boolean({ required: true }),
      pushEventUpdatedDateTime: t.arg.boolean({ required: true }),
      pushEventUpdatedLocation: t.arg.boolean({ required: true }),
      pushEventCancelled: t.arg.boolean({ required: true }),
      pushEventRemovedIndividual: t.arg.boolean({ required: true }),
      pushTeamNewMember: t.arg.boolean({ required: true }),
      emailChatNewMessage: t.arg.boolean({ required: true }),
      emailEventPendingInvitation: t.arg.boolean({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        const { id } = getAuthorizedUserProperties();
        return User.updateUserNotificationPreferences(id, args);
      }),
  }),
}));
