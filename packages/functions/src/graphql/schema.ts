import { builder } from './builder.js';

// * importing the types here is what triggers @genql/cli to build
// * types from the pothos schema. SST must be running
import './types/user.js';
import './types/team.js';
import './types/event-user.js';
import './types/event.js';

export const schema = builder.toSchema({});
