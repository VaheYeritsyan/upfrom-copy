import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Config } from 'sst/node/config';

import { VisibleError } from '@up-from/util';

type Headers = Record<string, string>;

const defaultHeaders: Headers = { 'Content-Type': 'application/json' };

/**
 * Get error message from errorOrMessage if it's a VisibleError instance or return errorOrMessage string
 * Returns defaultMessage when errorOrMessage is not provided
 * @param defaultMessage - default error message
 * @param errorOrMessage - Error or custom error message
 * @returns error message
 */
function getErrorMessage(defaultMessage: string, errorOrMessage?: string | VisibleError) {
  if (errorOrMessage instanceof VisibleError && errorOrMessage.isExposable) {
    return errorOrMessage.message;
  }
  if (typeof errorOrMessage === 'string') {
    return errorOrMessage;
  }
  return defaultMessage;
}

export function response(statusCode: number, body?: object | string, headers?: Headers) {
  let responseBody: string | undefined;
  if (typeof body === 'string') responseBody = body;
  if (typeof body === 'object') responseBody = JSON.stringify(body);

  return {
    statusCode,
    body: responseBody,
    headers: { ...defaultHeaders, ...headers },
  } as APIGatewayProxyStructuredResultV2;
}

export function error(statusCode: number, message: string) {
  return response(statusCode, { message });
}

export function ok(body?: object | string) {
  const status = body ? 200 : 204;
  return response(status, body);
}

export function accepted(body?: object | string) {
  return response(202, body);
}

export function found(link: string) {
  return response(302, undefined, { location: link });
}

export function badRequest(errorMessage?: string | VisibleError) {
  const message = getErrorMessage('Bad Request', errorMessage);
  return error(400, message);
}

export function unauthorized(errorMessage?: string | VisibleError) {
  const message = getErrorMessage('Unauthorized', errorMessage);
  return error(401, message);
}

export function forbidden(errorMessage?: string | VisibleError) {
  const message = getErrorMessage('Forbidden', errorMessage);
  return error(403, message);
}

export function notFound(errorMessage?: string | VisibleError) {
  const message = getErrorMessage('Not Found', errorMessage);
  return error(404, message);
}

export function internalError(errorMessage?: string | VisibleError) {
  const message = getErrorMessage('Internal Server Error', errorMessage);
  return error(500, message);
}

export function addAppVersionHeaders(response: APIGatewayProxyStructuredResultV2) {
  // Adding minimum compatible app version headers (compatible with current Back-end API version)
  const { APP_ANDROID_MIN_VERSION: androidVersion, APP_IOS_MIN_VERSION: iosVersion } = Config;
  return {
    ...response,
    headers: {
      ...response.headers,
      'x-app-android-min-version': String(androidVersion),
      'x-app-ios-min-version': String(iosVersion),
    },
  };
}

export * as ApiResponse from './api-response.js';
