import { z } from 'zod';
import { createEventBuilder, ZodValidator } from 'sst/node/event-bus';

const UserEventBuilder = createEventBuilder({ bus: 'User', validator: ZodValidator });
const NotificationEventBuilder = createEventBuilder({ bus: 'Notification', validator: ZodValidator });

const nonEmptyIdsSchema = z.string().ulid().array().nonempty();
const nonEmptyStringsSchema = z.string().array().nonempty();
const idsSchema = z.string().ulid().array();
const idSchema = z.string().ulid();
const booleanSchema = z.boolean();

export const Events = {
  // User actions
  UserDeviceTokensInvalidated: UserEventBuilder(
    'user.deviceTokensInvalidated',
    z.object({ deviceIds: nonEmptyStringsSchema }),
  ),
  // Application event (individual, all teams, etc...) actions
  AppEventAllTeamsCreated: NotificationEventBuilder(
    'event.allTeamsCreated',
    z.object({
      eventId: idSchema,
      isOwnerIncluded: booleanSchema,
    }),
  ),
  AppEventCancelled: NotificationEventBuilder(
    'event.cancelled',
    z.object({ eventId: idSchema, isOwnerIncluded: booleanSchema }),
  ),
  AppEventDateTimeUpdated: NotificationEventBuilder(
    'event.dateTimeUpdated',
    z.object({
      eventId: idSchema,
      isOwnerIncluded: booleanSchema,
    }),
  ),
  AppEventLocationUpdated: NotificationEventBuilder(
    'event.locationUpdated',
    z.object({
      eventId: idSchema,
      isOwnerIncluded: booleanSchema,
    }),
  ),
  AppEventGuestListUpdated: NotificationEventBuilder(
    'event.guestListUpdated',
    z.object({
      eventId: idSchema,
      addUserIds: idsSchema,
      removeUserIds: idsSchema,
      isOwnerIncluded: booleanSchema,
    }),
  ),
  // Team actions
  AppTeamNewMemberAdded: NotificationEventBuilder(
    'team.newMemberAdded',
    z.object({
      newMemberUserId: idSchema,
      teamIds: nonEmptyIdsSchema,
    }),
  ),
};

export async function publishOnUserDeviceTokensInvalidated(deviceIds: string[]) {
  const validDeviceIds = nonEmptyStringsSchema.parse(deviceIds);
  await Events.UserDeviceTokensInvalidated.publish({ deviceIds: validDeviceIds });
}

export async function publishOnEventAllTeamsCreated(eventId: string, isOwnerIncluded: boolean) {
  const validEventId = idSchema.parse(eventId);
  const validIsOwnerIncluded = booleanSchema.parse(isOwnerIncluded);
  await Events.AppEventAllTeamsCreated.publish({ eventId: validEventId, isOwnerIncluded: validIsOwnerIncluded });
}

export async function publishOnEventCancelled(eventId: string, isOwnerIncluded: boolean) {
  const validEventId = idSchema.parse(eventId);
  const validIsOwnerIncluded = booleanSchema.parse(isOwnerIncluded);
  await Events.AppEventCancelled.publish({ eventId: validEventId, isOwnerIncluded: validIsOwnerIncluded });
}

export async function publishOnEventDateTimeUpdated(eventId: string, isOwnerIncluded: boolean) {
  const validEventId = idSchema.parse(eventId);
  const validIsOwnerIncluded = booleanSchema.parse(isOwnerIncluded);
  await Events.AppEventDateTimeUpdated.publish({ eventId: validEventId, isOwnerIncluded: validIsOwnerIncluded });
}

export async function publishOnEventLocationUpdated(eventId: string, isOwnerIncluded: boolean) {
  const validEventId = idSchema.parse(eventId);
  const validIsOwnerIncluded = booleanSchema.parse(isOwnerIncluded);
  await Events.AppEventLocationUpdated.publish({ eventId: validEventId, isOwnerIncluded: validIsOwnerIncluded });
}

export async function publishOnEventGuestListUpdated(
  eventId: string,
  addUserIds: string[],
  removeUserIds: string[],
  isOwnerIncluded: boolean,
) {
  const validEventId = idSchema.parse(eventId);
  const validAddUserIds = idsSchema.parse(addUserIds);
  const validRemoveUserIds = idsSchema.parse(removeUserIds);
  const validIsOwnerIncluded = booleanSchema.parse(isOwnerIncluded);

  await Events.AppEventGuestListUpdated.publish({
    eventId: validEventId,
    addUserIds: validAddUserIds,
    removeUserIds: validRemoveUserIds,
    isOwnerIncluded: validIsOwnerIncluded,
  });
}

export async function publishOnTeamNewMemberAdded(newMemberUserId: string, teamIds: string[]) {
  const validUserId = idSchema.parse(newMemberUserId);
  const validTeamIds = nonEmptyIdsSchema.parse(teamIds);
  await Events.AppTeamNewMemberAdded.publish({ newMemberUserId: validUserId, teamIds: validTeamIds });
}

export * as EventBus from './event-bus.js';
