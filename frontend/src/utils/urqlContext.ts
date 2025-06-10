import { OperationContext } from 'urql';
import { validateAppMinVersion } from '~utils/appVersion';

type FetchParams = {
  timeout: number;
  timeoutCallback: () => void;
  updateCallback: (isUpdateNeeded: boolean) => void;
};

const customFetch =
  ({ timeout, timeoutCallback, updateCallback }: FetchParams) =>
  (url: RequestInfo, opts: RequestInit) => {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
      timeoutCallback();
    }, timeout);

    return new Promise(resolve => {
      fetch(url, { ...opts, signal: controller.signal })
        .then(resp => {
          updateCallback(validateAppMinVersion(resp.headers));
          resolve(resp);
        })
        .catch(resolve)
        .finally(() => {
          clearTimeout(timeoutId);
        });
    });
  };

export const getUrqlContext = (params: FetchParams) =>
  ({
    fetch: customFetch(params),
  } as Partial<OperationContext>);
