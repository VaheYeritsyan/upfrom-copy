import { GraphQLHandler } from 'sst/node/graphql';

import { Loader } from '@up-from/repository/dataloader';

import { schema } from './schema.js';

export const handler = GraphQLHandler({
  schema,
  context: ctx => {
    return { isDataloaderCacheClearedOnInit: Loader.clearAllLoaders(ctx.context.awsRequestId) }; // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)
  },
});
