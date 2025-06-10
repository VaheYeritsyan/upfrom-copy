import { gql } from '@urql/core';
import { Cache, Variables } from '@urql/exchange-graphcache';
import { Event } from '@up-from/graphql/genql';

// TODO: Find a way how to interpolate the "gql" string
export const queries = {
  yourEvents: gql`
    query (
      $from: Timestamp
      $to: Timestamp
      $first: Int
      $last: Int
      $before: String
      $after: String
      $order: Order
      $includeOngoing: Boolean
    ) {
      yourEvents(
        from: $from
        to: $to
        first: $first
        last: $last
        before: $before
        after: $after
        order: $order
        includeOngoing: $includeOngoing
      ) {
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            startsAt
            imageUrl
            address
            description
            isIndividual
            title
            endsAt
            ownerId
            teamId
            id
            location {
              locationID
              locationName
              lat
              lng
            }
            team {
              id
              name
              imageUrl
            }
            guests {
              user {
                id
                avatarUrl
                firstName
                lastName
                isDisabled
              }
              isAttending
            }
          }
        }
      }
    }
  `,
  pendingEvents: gql`
    query (
      $from: Timestamp
      $to: Timestamp
      $first: Int
      $last: Int
      $before: String
      $after: String
      $order: Order
      $includeOngoing: Boolean
    ) {
      pendingEvents(
        from: $from
        to: $to
        first: $first
        last: $last
        before: $before
        after: $after
        order: $order
        includeOngoing: $includeOngoing
      ) {
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            startsAt
            imageUrl
            address
            description
            isIndividual
            title
            endsAt
            ownerId
            teamId
            id
            location {
              locationID
              locationName
              lat
              lng
            }
            team {
              id
              name
              imageUrl
            }
            guests {
              user {
                id
                avatarUrl
                firstName
                lastName
                isDisabled
              }
              isAttending
            }
          }
        }
      }
    }
  `,
  declinedEvents: gql`
    query (
      $from: Timestamp
      $to: Timestamp
      $first: Int
      $last: Int
      $before: String
      $after: String
      $order: Order
      $includeOngoing: Boolean
    ) {
      declinedEvents(
        from: $from
        to: $to
        first: $first
        last: $last
        before: $before
        after: $after
        order: $order
        includeOngoing: $includeOngoing
      ) {
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            startsAt
            imageUrl
            address
            description
            isIndividual
            title
            endsAt
            ownerId
            teamId
            id
            location {
              locationID
              locationName
              lat
              lng
            }
            team {
              id
              name
              imageUrl
            }
            guests {
              user {
                id
                avatarUrl
                firstName
                lastName
                isDisabled
              }
              isAttending
            }
          }
        }
      }
    }
  `,
  allTeamEvents: gql`
    query (
      $from: Timestamp
      $to: Timestamp
      $first: Int
      $last: Int
      $before: String
      $after: String
      $order: Order
      $includeOngoing: Boolean
    ) {
      allTeamEvents(
        from: $from
        to: $to
        first: $first
        last: $last
        before: $before
        after: $after
        order: $order
        includeOngoing: $includeOngoing
      ) {
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            startsAt
            imageUrl
            address
            description
            isIndividual
            title
            endsAt
            ownerId
            teamId
            id
            location {
              locationID
              locationName
              lat
              lng
            }
            team {
              id
              name
              imageUrl
            }
            guests {
              user {
                id
                avatarUrl
                firstName
                lastName
                isDisabled
              }
              isAttending
            }
          }
        }
      }
    }
  `,
  teamEvents: gql`
    query (
      $from: Timestamp
      $to: Timestamp
      $first: Int
      $last: Int
      $before: String
      $after: String
      $order: Order
      $includeOngoing: Boolean
    ) {
      teamEvents(
        from: $from
        to: $to
        first: $first
        last: $last
        before: $before
        after: $after
        order: $order
        includeOngoing: $includeOngoing
      ) {
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            startsAt
            imageUrl
            address
            description
            isIndividual
            title
            endsAt
            ownerId
            teamId
            id
            location {
              locationID
              locationName
              lat
              lng
            }
            team {
              id
              name
              imageUrl
            }
            guests {
              user {
                id
                avatarUrl
                firstName
                lastName
                isDisabled
              }
              isAttending
            }
          }
        }
      }
    }
  `,
  searchEvent: gql`
    query ($searchString: String!, $first: Int, $last: Int, $before: String, $after: String) {
      searchEvent(searchString: $searchString, first: $first, last: $last, before: $before, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            startsAt
            endsAt
            imageUrl
            title
            teamId
            id
            team {
              id
              name
              imageUrl
            }
          }
        }
      }
    }
  `,
};

const paginationTypes: { [K in keyof typeof queries]: string } = {
  pendingEvents: 'QueryPendingConnection',
  declinedEvents: 'QueryDeclinedEventsConnection',
  yourEvents: 'QueryYourEventsConnection',
  teamEvents: 'QueryTeamEventsConnection',
  allTeamEvents: 'QueryAllTeamEventsConnection',
  searchEvent: 'QuerySearchEventConnection',
};

export const addEventToQueries = (cache: Cache, fieldName: keyof typeof queries, value: Event) => {
  cache
    .inspectFields('Query')
    .filter(field => field.fieldName === fieldName)
    .forEach(field => {
      cache.updateQuery({ query: queries[fieldName], variables: field.arguments as Variables }, data => {
        if (!data?.[fieldName]?.edges || (!Array.isArray(data?.[fieldName]?.edges) && fieldName)) return data;

        const typename = paginationTypes[fieldName];
        const cachedEventEdges = data?.[fieldName].edges;
        if (!cachedEventEdges.length) {
          data[fieldName].__typename = typename;
          data[fieldName].edges = [{ __typename: `${typename}Edge`, node: value }];

          return data;
        }

        // @ts-ignore
        const cachedEvents = cachedEventEdges.map(({ node }) => node);
        const lastCachedEdge = cachedEventEdges[cachedEventEdges.length - 1];

        // Adding in a list only if user has scrolled to this date.
        const isOutOfTheList = value.startsAt > lastCachedEdge?.node.startsAt && cachedEventEdges.length % 5 === 0;
        if (isOutOfTheList) {
          data[fieldName].pageInfo.hasNextPage = true;
          return data;
        }

        const eventsMap = new Map(
          // @ts-ignore
          ([...cachedEvents, value] as Event[]).map(({ id, ...restEvent }) => [id, { id, ...restEvent }]),
        );
        const events = [...eventsMap.values()].sort((prev, curr) => prev.startsAt - curr.startsAt);
        data[fieldName].edges = events.map(node => ({ ...lastCachedEdge, node }));
        data[fieldName].pageInfo.endCursor = events[events.length - 1]?.id;

        return data;
      });
    });
};

export const removeEventFromQueries = (cache: Cache, fieldName: keyof typeof queries, id: string) => {
  cache
    .inspectFields('Query')
    .filter(field => field.fieldName === fieldName)
    .forEach(field => {
      cache.updateQuery({ query: queries[fieldName], variables: field.arguments as Variables }, data => {
        if (!data?.[fieldName]?.edges.length || !Array.isArray(data?.[fieldName]?.edges)) return data;

        // @ts-ignore
        data[fieldName].edges = data[fieldName].edges.filter(({ node }, idx) => {
          if (node.id === id) {
            if (data[fieldName].pageInfo.endCursor === id) {
              data[fieldName].pageInfo.endCursor = data[fieldName].edges[idx - 1]?.id || null;
            }
          }

          return node.id !== id;
        });

        return data;
      });
    });
};
