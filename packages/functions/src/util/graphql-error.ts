import { GraphQLError } from 'graphql';
import { MaybePromise } from '@pothos/core';

import { VisibleError } from '@up-from/util/error';

export async function handleVisibleError<Result>(resolver: () => MaybePromise<Result>): Promise<Result> {
  try {
    return await resolver();
  } catch (err) {
    if (err instanceof VisibleError) {
      const errorMessages = err.getExposableMessages().join('; ');
      throw new GraphQLError(errorMessages || 'Unexpected error', {
        originalError: err,
        extensions: { errorMessages },
      });
    }
    throw err;
  }
}
