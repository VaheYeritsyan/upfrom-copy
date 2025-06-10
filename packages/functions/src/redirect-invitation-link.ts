import { VisibleError, logger } from '@up-from/util';

import { ApiHandler, ApiResponse } from '#util';

const redirectLink = 'upfrom://invite/mentor/';

export const handler = ApiHandler(async ({ pathParameters }) => {
  logger.debug('Team ID', { tid: pathParameters?.teamId });

  const teamId = pathParameters?.teamId;
  if (!teamId) {
    new VisibleError('Team ID is not provided.', { isExposable: false, extraInput: { pathParameters } });
    return ApiResponse.badRequest('Invalid request!');
  }

  return ApiResponse.found(`${redirectLink}${teamId}`);
});
