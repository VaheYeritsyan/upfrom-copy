import { EventUser, User } from '@up-from/core/admin';
import { authorizeAdmin } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { builder, createDateRangeArgs } from '../builder.js';
import { UserType } from './user.js';
import { EventType } from './event.js';

export const EventUserType = builder.objectRef<EventUser.EventUserShape>('EventUser');
const EventUserAttendanceType = builder.objectRef<EventUser.EventUserAttendanceShape>('EventUserAttendance');

EventUserType.implement({
  fields: t => ({
    eventId: t.exposeID('eventId'),
    userId: t.exposeID('userId'),
    isAttending: t.exposeBoolean('isAttending', { nullable: true }),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: eventUser => handleVisibleError(() => eventUser.createdAt),
    }),
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: eventUser => handleVisibleError(() => eventUser.updatedAt),
    }),
    user: t.field({
      type: UserType,
      nullable: true,
      resolve: eventUser => handleVisibleError(() => User.findOneById(eventUser.userId)),
    }),
  }),
});

EventUserAttendanceType.implement({
  fields: t => ({
    userId: t.exposeID('userId'),
    accepted: t.exposeInt('accepted'),
    declined: t.exposeInt('declined'),
    pending: t.exposeInt('pending'),
    total: t.exposeInt('total'),
    user: t.field({
      type: UserType,
      nullable: true,
      resolve: parent => handleVisibleError(() => User.findOneById(parent.userId)),
    }),
  }),
});

builder.queryFields(t => ({
  getUserAttendance: t.field({
    description: 'Retrieve event attendance of all users in the app',
    type: [EventUserAttendanceType],
    args: {
      ...createDateRangeArgs(t.arg),
      teamId: t.arg.string(),
    },
    resolve: (_, { teamId, from, to }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        const timeRange = { from, to };
        return EventUser.getTeamAttendance(timeRange, teamId);
      }),
  }),
  getTeamAttendance: t.field({
    description: 'Retrieve event attendance for all team members',
    type: [EventUserAttendanceType],
    args: {
      ...createDateRangeArgs(t.arg),
      teamId: t.arg.string({ required: true }),
    },
    resolve: (_, { teamId, from, to }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        const timeRange = { from, to };

        return EventUser.getTeamAttendance(timeRange, teamId);
      }),
  }),
  getOrganizationAttendance: t.field({
    description: 'Retrieve event attendance for all members of all organization teams',
    type: [EventUserAttendanceType],
    args: {
      ...createDateRangeArgs(t.arg),
      organizationId: t.arg.string({ required: true }),
    },
    resolve: (_, { organizationId, from, to }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        const timeRange = { from, to };

        return EventUser.getOrganizationAttendance(timeRange, organizationId);
      }),
  }),
}));

builder.mutationFields(t => ({
  createEventUser: t.field({
    description: 'Add an event user (guest) to the list of event guests/invitations',
    type: EventType,
    args: {
      userId: t.arg.string({ required: true }),
      eventId: t.arg.string({ required: true }),
      isAttending: t.arg({
        type: 'Boolean',
        description: 'Set "null" to clear status',
        defaultValue: null,
      }),
    },
    resolve: (_, { userId, eventId, isAttending }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return EventUser.create(eventId, userId, isAttending);
      }),
  }),
  removeEventUser: t.field({
    description: 'Remove an event user (guest) from the list of event guests/invitations',
    type: EventType,
    args: {
      userId: t.arg.string({ required: true }),
      eventId: t.arg.string({ required: true }),
    },
    resolve: (_, { userId, eventId }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return EventUser.remove(eventId, userId);
      }),
  }),
  updateEventUser: t.field({
    description: 'Update Event User entry (Event invitation)',
    type: EventType,
    args: {
      eventId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      isAttending: t.arg({
        type: 'Boolean',
        description: 'Set "null" to clear status',
        defaultValue: null,
      }),
    },
    resolve: (_, { eventId, userId, isAttending }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return EventUser.update(eventId, userId, isAttending);
      }),
  }),
  setEventGuests: t.field({
    description: 'Set list of event guests.',
    type: EventType,
    args: {
      userIds: t.arg({ type: ['String'], required: true }),
      eventId: t.arg.string({ required: true }),
    },
    resolve: (_, { userIds, eventId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return EventUser.setListOfInvitedUsers(userIds, eventId);
      }),
  }),
}));
