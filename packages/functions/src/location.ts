import { request } from 'gaxios';
import { Config } from 'sst/node/config';

import { VisibleError, logger } from '@up-from/util';
import { authorizeAdmin } from '@up-from/util/session';

import { ApiHandler, ApiResponse } from '#util';

const logName = 'Location lambda:';

async function makeRequest(url: string, params: object) {
  try {
    const response = await request({ url, params, timeout: 8000 });
    if (!response.data || typeof response.data !== 'object') {
      throw new VisibleError(`Unexpected type of response body!`, {
        isExposable: false,
        extraInput: { responseType: typeof response.data, body: response.data },
      });
    }

    return ApiResponse.ok(response.data);
  } catch (err) {
    throw new VisibleError(`Request to Google API failed!`, {
      isExposable: false,
      cause: err,
      extraInput: { url, params: { ...params, key: '***' } },
    });
  }
}

export const autocompleteHandler = ApiHandler(async ({ queryStringParameters }) => {
  logger.debug(`${logName} Getting place autocomplete`, { queryStringParameters });

  try {
    authorizeAdmin();
  } catch (err) {
    return ApiResponse.unauthorized();
  }

  const input = queryStringParameters?.input;
  if (!input) return ApiResponse.badRequest();

  const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  const params = { input, types: 'geocode', key: Config.GOOGLE_MAPS_API_KEY };
  return makeRequest(url, params);
});

export const geocodeHandler = ApiHandler(async ({ queryStringParameters }) => {
  logger.debug(`${logName} Getting geocode`, { queryStringParameters });

  try {
    authorizeAdmin();
  } catch (err) {
    return ApiResponse.unauthorized();
  }

  const placeId = queryStringParameters?.placeId;
  if (!placeId) return ApiResponse.badRequest();

  const url = 'https://maps.googleapis.com/maps/api/geocode/json';
  const params = { place_id: placeId, key: Config.GOOGLE_MAPS_API_KEY };
  return makeRequest(url, params);
});
