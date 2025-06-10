import { SSTConfig } from 'sst';
import { Api } from './stacks/Api.js';
import { Database } from './stacks/Database.js';
import { SecretsStack } from './stacks/SecretsStack.js';
import { Storage } from './stacks/Storage.js';
import { AdminStack } from './stacks/AdminPortal.js';
import { CronStack } from './stacks/Cron.js';
import { EventBusStack } from './stacks/EventBus.js';

export default {
  config({ stage = 'dev' }) {
    return {
      name: 'up-from',
      region: 'us-east-1',
      profile: stage,
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({ runtime: 'nodejs20.x' });
    app
      .stack(Database)
      .stack(SecretsStack)
      .stack(Storage)
      .stack(EventBusStack)
      .stack(Api)
      .stack(AdminStack)
      .stack(CronStack);
  },
} satisfies SSTConfig;
