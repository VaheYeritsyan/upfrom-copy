import { APIGatewayProxyStructuredResultV2, APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ApiHandler } from 'sst/node/api';

import { logger } from '@up-from/util/logger';

import { ApiResponse } from '#util/api-response';

type LambdaHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyStructuredResultV2>;

// Wraps lambda function to catch unhandled errors
function wrapLambdaHandler(handler: LambdaHandler) {
  const wrappedHandler = async (evt: APIGatewayProxyEventV2, ctx: Context) => {
    logger.addContext(ctx);

    try {
      return await handler(evt, ctx);
    } catch (err) {
      logger.error('Unhandled lambda error!', { err });
      return ApiResponse.internalError();
    }
  };

  return ApiHandler(wrappedHandler);
}

export { wrapLambdaHandler as ApiHandler };
