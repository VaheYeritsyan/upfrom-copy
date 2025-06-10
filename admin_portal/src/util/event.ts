import { Event, QueryAllEventsConnection } from '@up-from/graphql-ap/genql';

export const getEdgesAsEvents = (data?: QueryAllEventsConnection) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (data?.edges.map(({ node }) => node) || []) as Event[];
};

export const splitOngoingAndOtherEvents = (events?: Event[]) => {
  const ongoing: Event[] = [];
  const other: Event[] = [];

  if (!events || !events.length) return { ongoing, other };

  const currentTime = Date.now();

  for (const event of events) {
    if (event.startsAt <= currentTime && event.endsAt >= currentTime) {
      ongoing.push(event);
    } else {
      other.push(event);
    }
  }

  return { ongoing, other };
};
