import { resolveCursorConnection, ResolveCursorConnectionArgs } from '@pothos/plugin-relay';

import { Event, EventUser, Team, User } from '@up-from/core/admin';
import { authorizeAdmin, VisibleError } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { builder, createDateRangeArgs, LocationType, LocationInput, Location } from '../builder.js';
import { UserType } from './user.js';
import { TeamType } from './team.js';
import { EventUserType } from './event-user.js';

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

export const EventType = builder.objectRef<Event.EventShape>('Event');

// Implement Event as Event node
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
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: event => handleVisibleError(() => event.createdAt),
    }),
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: event => handleVisibleError(() => event.updatedAt),
    }),
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
      resolve: event => handleVisibleError(() => User.findOneById(event.ownerId)),
    }),
    team: t.field({
      type: TeamType,
      nullable: true,
      resolve: event =>
        handleVisibleError(() => {
          return event.teamId ? Team.findOneById(event.teamId) : null;
        }),
    }),
    guests: t.field({
      type: [EventUserType],
      resolve: event => handleVisibleError(() => EventUser.findAllByEventId(event.id)),
    }),
  }),
});

builder.queryFields(t => ({
  event: t.field({
    type: EventType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Event.findOneById(id);
      }),
  }),
  allEvents: t.connection({
    description: 'Retrieve all events',
    type: EventType,
    args: {
      ...createDateRangeArgs(t.arg),
      includeOngoing: t.arg({ type: 'Boolean', defaultValue: true }),
      order: t.arg({
        type: 'Order',
        required: true,
        defaultValue: 'asc',
        description: 'Sort order of events by event start date. Could be "asc" or "desc"',
      }),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection(
          {
            args,
            defaultSize: Number.MAX_SAFE_INTEGER,
            maxSize: Number.MAX_SAFE_INTEGER,
            toCursor: ({ id }) => id,
          },
          (cursorArgs: ResolveCursorConnectionArgs) => {
            authorizeAdmin();
            const range = makeRange({ ...args, ...cursorArgs });
            return Event.getAll(range);
          },
        ),
      ),
  }),
  allOrganizationEvents: t.connection({
    description: 'Retrieve all organization events',
    type: EventType,
    args: {
      ...createDateRangeArgs(t.arg),
      includeOngoing: t.arg({ type: 'Boolean', defaultValue: true }),
      organizationId: t.arg.string({ required: true }),
      order: t.arg({
        type: 'Order',
        required: true,
        defaultValue: 'asc',
        description: 'Sort order of events by event start date. Could be "asc" or "desc"',
      }),
    },
    resolve: (_, args) =>
      handleVisibleError(() =>
        resolveCursorConnection(
          {
            args,
            defaultSize: Number.MAX_SAFE_INTEGER,
            maxSize: Number.MAX_SAFE_INTEGER,
            toCursor: ({ id }) => id,
          },
          async (cursorArgs: ResolveCursorConnectionArgs) => {
            authorizeAdmin();

            const range = makeRange({ ...args, ...cursorArgs });
            return Event.findAllByOrganizationId(args.organizationId, range);
          },
        ),
      ),
  }),
}));

builder.mutationFields(t => ({
  cancelEvent: t.field({
    description: 'Cancel an event',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Event.cancel(id);
      }),
  }),
  createEvent: t.field({
    description: 'Create a new event',
    type: EventType,
    args: {
      ownerId: t.arg.string({ required: true }),
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
      handleVisibleError(async () => {
        authorizeAdmin();
        // null also should be treated as a default value which is true
        if (isOwnerAttending !== false) {
          isOwnerAttending = true;
        }

        const location = args.location ? JSON.stringify(args.location) : null;

        return Event.create({ ...args, location }, isOwnerAttending);
      }),
  }),
  restoreEvent: t.field({
    description: 'Restore a cancelled event',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Event.restore(id);
      }),
  }),
  updateEvent: t.field({
    description: 'Update event info',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
      ownerId: t.arg.string({ required: true }),
      teamId: t.arg.string(),
      title: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      startsAt: t.arg({ type: 'Timestamp', required: true }),
      endsAt: t.arg({ type: 'Timestamp', required: true }),
      address: t.arg.string(),
      location: t.arg({ type: LocationInput }),
      imageUrl: t.arg.string(),
      isIndividual: t.arg.boolean({ required: true }),
      isCancelled: t.arg.boolean({ required: true }),
    },
    resolve: (_, args) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        const location = args.location ? JSON.stringify(args.location) : null;

        return Event.update(args.id, { ...args, location });
      }),
  }),
  generateEventImageUploadUrl: t.field({
    description: 'Generates an image upload URL for event',
    type: 'String',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Event.generateImageUploadUrl(eventId);
      }),
  }),
  completeEventImageUpload: t.field({
    description: 'Completes event image upload process (converts uploaded image and moves it to a public storage)',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Event.completeImageUpload(eventId);
      }),
  }),
  removeEventImage: t.field({
    description: 'Removes event image',
    type: EventType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: eventId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Event.removeImage(eventId);
      }),
  }),
}));
