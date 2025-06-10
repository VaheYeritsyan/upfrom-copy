import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { createAdapter } from 'sst/node/auth';
import { useQueryParams, usePath } from 'sst/node/api';

interface LogoutConfig {
  onLogout: (claims: Record<string, string | undefined>) => Promise<APIGatewayProxyStructuredResultV2>;
  onError: (error: unknown) => Promise<APIGatewayProxyStructuredResultV2>;
}

export const LogoutAdapter = createAdapter((config: LogoutConfig) => {
  return async function () {
    const [step] = usePath().slice(-1);

    if (step === 'cookie') {
      try {
        const claims = useQueryParams();
        return config.onLogout(claims);
      } catch (err) {
        return config.onError(err);
      }
    }

    throw new Error('Invalid auth request');
  };
});
