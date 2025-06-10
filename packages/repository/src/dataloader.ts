import DataLoader from 'dataloader';

import { logger } from '@up-from/util/logger';

import { Event, EventUser, Organization, Team, TeamUser, User } from '@up-from/repository';

const logName = 'Repository DataLoader:';

let lastRequestId: string | undefined;

export function clearAllLoaders(requestId?: string): boolean {
  if (requestId && lastRequestId === requestId) {
    logger.debug(`${logName} Same requestId. Loaders are not cleared`, { requestId });
    return false;
  }

  logger.debug(`${logName} Clearing loaders`, { requestId });
  lastRequestId = requestId;

  Object.values(loaders).forEach(loader => loader.clearAll());

  return true;
}

async function getEventsById(ids: readonly string[]): Promise<(Event.EventShape | null)[]> {
  logger.debug(`${logName} Getting events by ID`, { ids });

  const events = await Event.loaderFindAllEventsByIds(ids);
  return ids.map(id => events.find(event => event.id === id) || null);
}

async function getEventUsersByEventIds(ids: readonly string[]): Promise<EventUser.EventUserShape[][]> {
  logger.debug(`${logName} Getting event users by event IDs`, { ids });

  const eventUsers = await EventUser.loaderFindAllEventUsersByEventIds(ids);
  return ids.map(id => eventUsers.filter(eventUser => eventUser.eventId === id));
}

async function getOrganizationById(ids: readonly string[]): Promise<(Organization.OrganizationShape | null)[]> {
  logger.debug(`${logName} Getting organizations by ID`, { ids });

  const organizations = await Organization.loaderFindAllByIds(ids);
  return ids.map(id => organizations.find(org => org.id === id) || null);
}

async function getTeamsById(ids: readonly string[]): Promise<(Team.TeamShape | null)[]> {
  logger.debug(`${logName} Getting teams by ID`, { ids });

  const teams = await Team.loaderFindAllByIds(ids);
  return ids.map(id => teams.find(team => team.id === id) || null);
}

async function getTeamUsersByTeamIds(ids: readonly string[]): Promise<TeamUser.TeamUserShape[][]> {
  logger.debug(`${logName} Getting team users by team IDs`, { ids });

  const teamUsers = await TeamUser.loaderFindAllByTeamIds(ids);
  return ids.map(id => teamUsers.filter(teamUser => teamUser.teamId === id));
}

async function getUsersById(ids: readonly string[]): Promise<(User.UserShape | null)[]> {
  logger.debug(`${logName} Getting users by ID`, { ids });

  const users = await User.loaderFindAllByIds(ids);
  return ids.map(id => users.find(user => user.id === id) || null);
}

export const loaders = {
  events: new DataLoader(getEventsById),
  eventUsersByEventId: new DataLoader(getEventUsersByEventIds),
  organizations: new DataLoader(getOrganizationById),
  teams: new DataLoader(getTeamsById),
  teamUsersByTeamId: new DataLoader(getTeamUsersByTeamIds),
  users: new DataLoader(getUsersById),
};

export * as Loader from './dataloader.js';
