import {
  useQuery,
  useClient,
  createRequest,
  RequestPolicy,
  OperationResult,
  UseMutationState,
  OperationContext,
  UseMutationResponse,
  UseQueryExecute,
  UseQueryResponse,
} from 'urql';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  QueryResult,
  QueryGenqlSelection,
  MutationResult,
  MutationGenqlSelection,
  generateQueryOp,
  generateMutationOp,
} from '@up-from/graphql/genql';
import { pipe, toPromise } from 'wonka';
import { hideToast, showAlert } from '~utils/toasts';
import { getUrqlContext } from '~utils/urqlContext';
import { useAuthContext } from '~Hooks/useAuthContext';

export function useTypedQuery<Query extends QueryGenqlSelection>({
  timeout = 10000,
  ...opts
}: {
  query: Query;
  pause?: boolean;
  requestPolicy?: RequestPolicy;
  context?: Partial<OperationContext>;
  timeout?: number;
}): UseQueryResponse<QueryResult<Query>> {
  const executeRef = useRef<UseQueryExecute>();

  const { setIsNeedToUpdate } = useAuthContext();

  // The whole context object needs to be in the "useMemo"
  // otherwise, React throws the error: Too many re-renders.
  const context = useMemo(() => {
    return getUrqlContext({
      timeout,
      timeoutCallback: () => {
        showAlert('Network error: Request timeout. Press here to retry', () => {
          executeRef.current?.({ requestPolicy: 'network-only' });
          hideToast();
        });
      },
      updateCallback: setIsNeedToUpdate,
    });
  }, [timeout]);

  const { query, variables } = generateQueryOp(opts.query);
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
}

const initialState = {
  stale: false,
  fetching: false,
  data: undefined,
  error: undefined,
  operation: undefined,
  extensions: undefined,
};

export function useTypedMutation<
  Variables extends Record<string, any>,
  Mutation extends MutationGenqlSelection,
  Data extends MutationResult<Mutation>,
>(
  builder: (vars: Variables) => Mutation,
  opts?: Partial<OperationContext>,
  onSuccess?: () => void,
): UseMutationResponse<Data, Variables> {
  const client = useClient();
  const isMounted = useRef(true);
  const [state, setState] = useState<UseMutationState<Data, Variables>>(initialState);
  const executeMutation = useCallback(
    (vars?: Variables, context?: Partial<OperationContext>): Promise<OperationResult<Data, Variables>> => {
      setState({ ...initialState, fetching: true });
      const buildArgs = vars || ({} as Variables);
      const built = builder(buildArgs);
      const { query, variables } = generateMutationOp(built);
      return pipe(
        client.executeMutation<Data, Variables>(createRequest(query, variables as Variables), { ...opts, ...context }),
        toPromise,
      ).then((result: OperationResult<Data, Variables>) => {
        if (!result.error) onSuccess?.();

        if (isMounted.current) {
          setState({
            fetching: false,
            stale: !!result.stale,
            data: result.data,
            error: result.error,
            extensions: result.extensions,
            operation: result.operation,
          });
        }
        return result;
      });
    },
    [setState, builder, client, opts, onSuccess],
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return [state, executeMutation];
}
