import { builder } from './builder.js';

// * importing the types here is what triggers @genql/cli to build
// * types from the pothos schema. SST must be running
import './types/admin.js';
import './types/event-user.js';
import './types/event.js';
import './types/organization.js';
import './types/summary.js';
import './types/team.js';
import './types/user.js';

export const schema = builder.toSchema({});
