import { ArgBuilder } from '@pothos/core';
import { resolveCursorConnection, ResolveCursorConnectionArgs } from '@pothos/plugin-relay';

import { Event, EventUser, User } from '@up-from/core';
import { VisibleError, getAuthorizedUserProperties } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { EventUserType } from './event-user.js';
import { UserType } from './user.js';
import { TeamType } from './team.js';
import { builder, createDateRangeArgs, TypesWithDefaults, LocationInput, LocationType, Location } from '../builder.js';

type RangeArgs = {
  from?: Date | null;
  to?: Date | null;
  limit: number;
  after?: string | null;
  before?: string | null;
  inverted: boolean;
  order: 'asc' | 'desc';
  includeOngoing?: boolean | null;
};

// We're not using "before"/"last" as the plugin-relay mutates (reverse result) array when "last" is set
function makeRange(args: RangeArgs) {
  if (args?.inverted === true || args?.before) {
    throw new VisibleError(
      'Inverted pagination is not supported! Please use only "first" and "after" pagination properties.',
      {
        isExposable: true,
        extraInput: { args },
      },
    );
  }

  return {
    timeRange: {
      from: args?.from,
      to: args?.to,
    },
    pagination: {
      limit: args.limit,
      cursor: args.after,
      order: args.order,
    },
    isOngoingIncluded: args?.includeOngoing !== false, // false if false, true otherwise
  };
}

function createEventArgs(arg: ArgBuilder<TypesWithDefaults>) {
  return {
    ...createDateRangeArgs(arg),
    includeOngoing: arg({ type: 'Boolean', defaultValue: true }),
    order: arg({
      type: 'Order',
      required: true,
      defaultValue: 'asc',
      description: 'Sort order of events by event start date. Could be "asc" or "desc"',
    }),
  };
}

export const EventType = builder.objectRef<Event.EventShape>('Event');

// Implements Event as Event node
builder.node(EventType, {
  id: { resolve: ({ id }) => id },
  fields: t => ({
    id: t.exposeID('id'),
    ownerId: t.exposeID('ownerId'),
    teamId: t.exposeID('teamId', { nullable: true }),
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    startsAt: t.expose('startsAt', { type: 'Timestamp' }),
    endsAt: t.expose('endsAt', { type: 'Timestamp' }),
    isIndividual: t.exposeBoolean('isIndividual'),
    address: t.exposeString('address', { nullable: true }),
    imageUrl: t.exposeString('imageUrl', { nullable: true }),
    isCancelled: t.exposeBoolean('isCancelled'),
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
    owner: t.field({
      type: UserType,
      nullable: true,
      resolve: parent => handleVisibleError(() => User.findOneById(parent.ownerId)),
    }),
    team: t.field({
      type: TeamType,
      nullable: true,
      resolve: parent =>
        handleVisibleError(() => {
          const { id: userId } = getAuthorizedUserProperties();
          return Event.findEventTeamForUser(parent, userId);
        }),
    }),
    guests: t.field({
      type: [EventUserType],
      resolve: parent => handleVisibleError(() => EventUser.findEventUsersByEventId(parent.id)),
    }),
  }),
});

builder.queryFields(t => ({
  event: t.field({
    description: 'Retrieve a single event',
    type: EventType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return Event.findOne(id, userId);
      }),
  }),
  yourEvents: t.connection({
    description: 'Retrieve all events that user is going to visit',
    type: EventType,
    args: {
      ...createEventArgs(t.arg),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection({ args, toCursor: ({ id }) => id }, (cursorArgs: ResolveCursorConnectionArgs) => {
          const { id: userId } = getAuthorizedUserProperties();
          const range = makeRange({ ...args, ...cursorArgs });
          return Event.findYourEvents(userId, range);
        }),
      ),
  }),
  teamEvents: t.connection({
    description: 'Retrieve Team events',
    type: EventType,
    args: {
      ...createEventArgs(t.arg),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection({ args, toCursor: ({ id }) => id }, (cursorArgs: ResolveCursorConnectionArgs) => {
          const { id: userId } = getAuthorizedUserProperties();
          const range = makeRange({ ...args, ...cursorArgs });
          return Event.findTeamEvents(userId, range);
        }),
      ),
  }),
  allTeamEvents: t.connection({
    description: 'Retrieve All Team events',
    type: EventType,
    args: {
      ...createEventArgs(t.arg),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection({ args, toCursor: ({ id }) => id }, (cursorArgs: ResolveCursorConnectionArgs) => {
          const { id: userId } = getAuthorizedUserProperties();
          const range = makeRange({ ...args, ...cursorArgs });
          return Event.findAllTeamEvents(userId, range);
        }),
      ),
  }),
  pendingEvents: t.connection({
    description: `Retrieve events with not responded invitations for current user (events with pending invitation)`,
    type: EventType,
    args: {
      ...createEventArgs(t.arg),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection({ args, toCursor: ({ id }) => id }, (cursorArgs: ResolveCursorConnectionArgs) => {
          const { id: userId } = getAuthorizedUserProperties();
          const range = makeRange({ ...args, ...cursorArgs });
          return Event.findPendingEvents(userId, range);
        }),
      ),
  }),
  declinedEvents: t.connection({
    description: 'Retrieve events that user has declined (with declined invitation)',
    type: EventType,
    args: {
      ...createEventArgs(t.arg),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection({ args, toCursor: ({ id }) => id }, (cursorArgs: ResolveCursorConnectionArgs) => {
          const { id: userId } = getAuthorizedUserProperties();
          const range = makeRange({ ...args, ...cursorArgs });
          return Event.findDeclinedEvents(userId, range);
        }),
      ),
  }),
  searchEvent: t.connection({
    description: 'Match event titles to search string and return matched events',
    type: EventType,
    args: {
      searchString: t.arg({ type: 'String', required: true, description: 'Should have at least 3 symbols' }),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection({ args, toCursor: ({ id }) => id }, (cursorArgs: ResolveCursorConnectionArgs) => {
          const { id: userId } = getAuthorizedUserProperties();
          const range = makeRange({ order: 'asc', ...args, ...cursorArgs });
          return Event.searchByTitle(userId, args.searchString, range.pagination);
        }),
      ),
  }),
}));

builder.mutationFields(t => ({
  createEvent: t.field({
    description: 'Create a new event.',
    type: EventType,
    args: {
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      isIndividual: t.arg.boolean({ required: true }),
      teamId: t.arg.string(),
      startsAt: t.arg({ type: 'Timestamp', required: true }),
      endsAt: t.arg({ type: 'Timestamp', required: true }),
      location: t.arg({ type: LocationInput }),
      imageUrl: t.arg.string(),
      address: t.arg.string(),
      isOwnerAttending: t.arg.boolean({
        defaultValue: true,
        description: 'Adds owner to invited users and accepts invitation',
      }),
    },
    resolve: (_, { isOwnerAttending, ...args }) =>
      handleVisibleError(() => {
        const { id: ownerId } = getAuthorizedUserProperties();

        // null also should be treated as a default value which is true
        if (isOwnerAttending !== false) {
          isOwnerAttending = true;
        }

        const location = args.location ? JSON.stringify(args.location) : null;

        return Event.create({ ...args, ownerId, location }, isOwnerAttending); // isOwnerAttending could be null so casting to bool
      }),
  }),
  updateMyEvent: t.field({
    description: 'Update own event.',
    type: EventType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      isIndividual: t.arg.boolean({ required: true }),
      teamId: t.arg.string(),
      startsAt: t.arg({ type: 'Timestamp', required: true }),
      endsAt: t.arg({ type: 'Timestamp', required: true }),
      address: t.arg.string(),
      location: t.arg({ type: LocationInput }),
      imageUrl: t.arg.string(),
    },
    resolve: (_, args) =>
      handleVisibleError(() => {
        const { id: ownerId } = getAuthorizedUserProperties();

        const location = args.location ? JSON.stringify(args.location) : null;

        return Event.update(args.id, ownerId, { ...args, location, description: args.description || undefined });
      }),
  }),
  generateEventImageUploadUrl: t.field({
    description: 'Generates an image upload URL for event',
    type: 'String',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(() => {
        const { id: ownerId } = getAuthorizedUserProperties();
        return Event.generateImageUploadUrl(eventId, ownerId);
      }),
  }),
  completeEventImageUpload: t.field({
    description: 'Completes event image upload process (converts uploaded image and moves it to a public storage)',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(() => {
        const { id: ownerId } = getAuthorizedUserProperties();
        return Event.completeImageUpload(eventId, ownerId);
      }),
  }),
  removeEventImage: t.field({
    description: 'Removes event image',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return Event.removeImage(eventId, userId);
      }),
  }),
  cancelEvent: t.field({
    description: 'Cancel an event',
    type: EventType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(() => {
        const { id: ownerId } = getAuthorizedUserProperties();
        return Event.cancelOne(eventId, ownerId);
      }),
  }),
}));
