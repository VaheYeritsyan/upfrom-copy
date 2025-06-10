import { useEffect, useState, useCallback, useRef } from 'react';
import {
  useClient,
  createRequest,
  OperationResult,
  UseMutationState,
  OperationContext,
  UseMutationResponse,
} from 'urql';
import { MutationResult, MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { generateMutation } from '@up-from/graphql-ap/queryGenerator';
import { pipe, toPromise } from 'wonka';

const initialState = {
  stale: false,
  fetching: false,
  data: undefined,
  error: undefined,
  operation: undefined,
  extensions: undefined,
};

export function useTypedMutation<
  Variables extends Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
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
      const { query, variables } = generateMutation(built);
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
