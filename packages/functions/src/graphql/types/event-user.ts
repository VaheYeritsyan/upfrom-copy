import { EventUser, User } from '@up-from/core';
import { getAuthorizedUserProperties } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { EventType } from './event.js';
import { UserType } from './user.js';
import { builder } from '../builder.js';

export const EventUserType = builder.objectRef<EventUser.EventUserShape>('EventUser');

EventUserType.implement({
  fields: t => ({
    eventId: t.exposeID('eventId'),
    userId: t.exposeID('userId'),
    isAttending: t.exposeBoolean('isAttending', { nullable: true }),
    user: t.field({
      type: UserType,
      nullable: true,
      resolve: parent => handleVisibleError(() => User.findOneById(parent.userId)),
    }),
  }),
});

// builder.queryFields(t => ({}));

builder.mutationFields(t => ({
  setEventGuests: t.field({
    description: 'Set list of event guests.',
    type: EventType,
    args: {
      userIds: t.arg({ type: ['String'], required: true }),
      eventId: t.arg.string({ required: true }),
    },
    resolve: (_, { userIds, eventId }) =>
      handleVisibleError(async () => {
        const { id: ownerId } = getAuthorizedUserProperties();
        return EventUser.setListOfInvitedUsers(userIds, eventId, ownerId);
      }),
  }),
  updateMyInvitation: t.field({
    description: 'Update invitation status for current user.',
    type: EventType,
    args: {
      isAttending: t.arg({
        type: 'Boolean',
        description: 'Set "null" to clear status',
        defaultValue: null,
      }),
      eventId: t.arg.string({ required: true }),
    },
    resolve: (_, { isAttending = null, eventId }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return EventUser.updateInvitationStatus(userId, eventId, isAttending);
      }),
  }),
  joinAllTeamsEvent: t.field({
    description: 'Join a public event.',
    type: EventType,
    args: {
      eventId: t.arg.string({ required: true }),
    },
    resolve: (_, { eventId }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return EventUser.joinPublicEvent(userId, eventId);
      }),
  }),
  leaveAllTeamsEvent: t.field({
    description: 'Leave a public event.',
    type: EventType,
    args: {
      eventId: t.arg.string({ required: true }),
    },
    resolve: (_, { eventId }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return EventUser.leavePublicEvent(userId, eventId);
      }),
  }),
}));
