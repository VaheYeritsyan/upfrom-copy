import { APIGatewayProxyEventV2, Context } from 'aws-lambda';

import { GraphQLHandler } from 'sst/node/graphql';

import { Loader } from '@up-from/repository/dataloader';

import { ApiResponse } from '#util/api-response';
import { schema } from './schema.js';

export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  const graphQLHandler = GraphQLHandler({
    schema,
    context: ctx => {
      return { isDataloaderCacheClearedOnInit: Loader.clearAllLoaders(ctx.context.awsRequestId) }; // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)
    },
  });

  const gqlResponse = await graphQLHandler(event, context);
  return ApiResponse.addAppVersionHeaders(gqlResponse);
};
