import React, { ReactNode } from 'react';
import { Provider as UrqlProvider } from 'urql';
import { useGraphQLClient } from '~Hooks/useGraphQLClient';

export const GraphQLProvider = ({ children }: { children: ReactNode }) => {
  const graphQLClient = useGraphQLClient();

  if (!graphQLClient) {
    return null;
  }

  return <UrqlProvider value={graphQLClient}>{children}</UrqlProvider>;
};
