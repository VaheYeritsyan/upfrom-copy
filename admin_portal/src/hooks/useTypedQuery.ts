import { QueryGenqlSelection, QueryResult } from '@up-from/graphql-ap/genql';
import { generateQuery } from '@up-from/graphql-ap/queryGenerator';
import { useEffect, useMemo, useRef } from 'react';
import { OperationContext, RequestPolicy, UseQueryExecute, useQuery } from 'urql';
import { useToast } from '~/hooks/useToast';
import { getUrqlContext } from '~/util/urqlContext';

type Options<Query extends QueryGenqlSelection> = {
  query: Query;
  pause?: boolean;
  requestPolicy?: RequestPolicy;
  context?: Partial<OperationContext>;
  timeout?: number;
};

export const useTypedQuery = <Query extends QueryGenqlSelection>({ timeout = 30000, ...opts }: Options<Query>) => {
  const executeRef = useRef<UseQueryExecute>();
  const toast = useToast();

  // The whole context object needs to be in the "useMemo"
  // otherwise, React throws the error: Too many re-renders.
  const context = useMemo(() => {
    return getUrqlContext(timeout, () => {
      toast.showErrorWithRetryAction('Network error: Request timeout', () => {
        executeRef.current?.({ requestPolicy: 'network-only' });
      });
    });
  }, [timeout]);

  const { query, variables } = generateQuery(opts.query);
  const data = useQuery<QueryResult<Query>>({
    ...opts,
    query,
    variables,
    context,
  });

  const [, execute] = data;
  useEffect(() => {
    executeRef.current = execute;
  }, [execute]);

  return data;
};
