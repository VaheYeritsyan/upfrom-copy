import { EventType } from '~types/event';

export const getEventType = (teamId?: string | null, isIndividual?: boolean) => {
  if (teamId && isIndividual) {
    return EventType.INDIVIDUAL;
  }
  if (teamId && !isIndividual) {
    return EventType.MY_TEAM;
  }
  if (!teamId && !isIndividual) {
    return EventType.ALL_TEAMS;
  }
  return EventType.ALL_TEAMS;
};
