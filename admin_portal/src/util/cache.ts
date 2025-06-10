import { gql } from '@urql/core';

export const queries = {
  allEvents: gql`
    query ($from: Timestamp, $order: Order) {
      allEvents(from: $from, order: $order) {
        edges {
          node {
            createdAt
            updatedAt
            id
            title
            description
            endsAt
            startsAt
            imageUrl
            address
            isCancelled
            location {
              locationID
              locationName
              lat
              lng
            }
            isIndividual
            teamId
            owner {
              createdAt
              updatedAt
              id
              email
              phone
              avatarUrl
              firstName
              lastName
              about
              teamId
              birthday
              isDisabled
              gender
              isSignupCompleted
            }
            team {
              createdAt
              updatedAt
              id
              imageUrl
              name
              description
            }
            guests {
              createdAt
              updatedAt
              eventId
              userId
              isAttending
              user {
                createdAt
                updatedAt
                id
                email
                phone
                avatarUrl
                firstName
                lastName
                about
                teamId
                birthday
                isDisabled
                gender
                isSignupCompleted
              }
            }
          }
        }
      }
    }
  `,
};
