import { randomInt } from 'node:crypto';

import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { createAdapter } from 'sst/node/auth';
import { usePath, useQueryParam, useQueryParams } from 'sst/node/api';

interface CodeConfig {
  codeLength?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
  onCode: (code: string, claims: Record<string, string | undefined>) => Promise<APIGatewayProxyStructuredResultV2>;
  onSuccess: (code: string, claims: Record<string, string | undefined>) => Promise<APIGatewayProxyStructuredResultV2>;
  onError: (error: unknown) => Promise<APIGatewayProxyStructuredResultV2>;
}

const defaultCodeLength = 6;

export const CodeAdapter = createAdapter((config: CodeConfig) => {
  return async function () {
    const [step] = usePath().slice(-1);

    if (step === 'authorize') {
      const codeLength = config.codeLength || defaultCodeLength;
      const maxNumber = 10 ** codeLength;
      const code = randomInt(0, maxNumber).toString().padStart(codeLength, '0');
      const claims = useQueryParams();
      return config.onCode(code, claims);
    }

    if (step === 'callback') {
      const code = useQueryParam('code');
      if (!code) {
        throw new Error('Missing code parameter');
      }

      try {
        const claims = useQueryParams();
        return config.onSuccess(code, claims);
      } catch (err) {
        return config.onError(err);
      }
    }

    throw new Error('Invalid auth request');
  };
});
