import { OperationContext } from 'urql';

const customFetch = (timeout: number, timeoutCallback: () => void) => (url: RequestInfo, opts: RequestInit) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
    timeoutCallback();
  }, timeout);

  return new Promise(resolve => {
    fetch(url, { ...opts, signal: controller.signal })
      .then(resolve)
      .catch(resolve)
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
};

export const getUrqlContext = (timeout: number, timeoutCallback: () => void) =>
  ({
    fetch: customFetch(timeout, timeoutCallback),
  } as Partial<OperationContext>);
