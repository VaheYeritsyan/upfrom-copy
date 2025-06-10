import { Event, EventUser, TeamUser, Team } from '@up-from/repository';
import { EventBus } from '@up-from/services/event-bus';
import { VisibleError, logger } from '@up-from/util';

export { EventUserShape, EventUserAttendanceShape } from '@up-from/repository/event-user';

const logName = 'Core Admin: Event User:';

export async function findAllByEventId(eventId: string) {
  logger.debug(`${logName} Getting guests by event ID`, { eventId });
  return EventUser.findEventUsersByEventId(eventId);
}

export async function remove(eventId: string, userId: string) {
  logger.debug(`${logName} Removing an Event User entry (guest/invitation)`, { eventId, userId });
  const removedEventUsers = await EventUser.removeEventUsers([userId], eventId);

  const user = removedEventUsers[0];
  if (!user) {
    throw new VisibleError('Failed to remove an Event User: Event User (guest/invitations) does not exist', {
      isExposable: true,
      extraInput: { eventId, userId },
    });
  }

  return Event.findOneByIdOrThrow(eventId);
}

export async function getTeamAttendance(
  timeRange: EventUser.TimeRange,
  teamId?: string | null,
): Promise<EventUser.EventUserAttendanceShape[]> {
  logger.debug(`${logName} Getting event attendance for team members`, { timeRange, teamId });

  let memberIds: string[] | undefined;
  if (teamId) {
    const teamMembers = await TeamUser.findAllByTeamIds([teamId]);
    memberIds = teamMembers.map(member => member.userId);
  }

  let eventIds: string[] | undefined;
  if (timeRange.from || timeRange.to) {
    const events = await Event.getAll({ timeRange });
    eventIds = events.map(event => event.id);
  }

  return await EventUser.getAttendance(eventIds, memberIds);
}

export async function getOrganizationAttendance(
  timeRange: EventUser.TimeRange,
  organizationId: string,
): Promise<EventUser.EventUserAttendanceShape[]> {
  logger.debug(`${logName} Getting event attendance for organization members`, { timeRange, organizationId });

  const organizationTeams = await Team.findAllByOrganizationId(organizationId);
  const organizationTeamIds = organizationTeams.map(team => team.id);

  const members = await TeamUser.findAllByTeamIds(organizationTeamIds);
  const memberIds = [...new Set(members.map(member => member.userId))]; // Only unique IDs

  let eventIds: string[] | undefined;
  if (timeRange.from || timeRange.to) {
    const events = await Event.getAll({ timeRange });
    eventIds = events.map(event => event.id);
  }

  return await EventUser.getAttendance(eventIds, memberIds);
}

export async function create(eventId: string, userId: string, isAttending?: boolean | null) {
  logger.debug(`${logName} Adding an Event User entry (guest/invitation)`, { eventId, userId, isAttending });
  await EventUser.addEventUsers([userId], eventId, isAttending);

  return Event.findOneByIdOrThrow(eventId);
}

export async function update(eventId: string, userId: string, isAttending?: boolean | null) {
  logger.debug(`${logName} Updating an Event User entry`, { eventId, userId, isAttending });
  await EventUser.updateEventUser(userId, eventId, isAttending);

  return Event.findOneByIdOrThrow(eventId);
}

export async function setListOfInvitedUsers(newUserIds: string[], eventId: string) {
  logger.debug(`${logName} Setting list of invited users`, { guestIds: newUserIds, eventId });

  const event = await Event.findOneByIdOrThrow(eventId);
  if (!event.teamId) {
    throw new VisibleError('Failed to set list of invited users: All Team Events are public and visible by default', {
      isExposable: true,
      extraInput: { eventId: event.id, eventTeamId: event.teamId },
    });
  }

  const currentEventUsers = await EventUser.findEventUsersByEventId(event.id);
  const currentUserIds = currentEventUsers.map(({ userId }) => userId);
  const removeUserIds = currentUserIds.filter(currentUserId => {
    return !newUserIds.some(newUserId => newUserId === currentUserId);
  });
  const addUserIds = newUserIds.filter(newUserId => {
    return !currentUserIds.some(currentUserId => currentUserId === newUserId);
  });

  await EventUser.setEventUsers(addUserIds, removeUserIds, event.id, null);

  const isOwnerIncluded = true;
  try {
    await EventBus.publishOnEventGuestListUpdated(event.id, addUserIds, removeUserIds, isOwnerIncluded);
  } catch (err) {
    // No rethrowing (just log the error)
    new VisibleError('Failed to publish bus event on event guest list update!', {
      cause: err,
      extraInput: { eventId: event.id, addUserIds, removeUserIds, isOwnerIncluded },
    });
  }

  return event;
}

export * as EventUser from './event-user.js';
