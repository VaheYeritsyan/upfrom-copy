import { Summary } from '@up-from/core/admin';
import { authorizeAdmin } from '@up-from/util';

import { handleVisibleError } from '#util/graphql-error';
import { builder } from '../builder.js';

const SummaryCountersType = builder.objectRef<Summary.SummaryCountersShape>('SummaryCountersType').implement({
  fields: t => ({
    admins: t.exposeInt('admins'),
    organizations: t.exposeInt('organizations'),
    teams: t.exposeInt('teams'),
    users: t.exposeInt('users'),
    invitedUsers: t.exposeInt('invitedUsers'),
    signupCompletedUsers: t.exposeInt('signupCompletedUsers'),
    events: t.exposeInt('events'),
    pastEvents: t.exposeInt('pastEvents'),
    upcomingEvents: t.exposeInt('upcomingEvents'),
    ongoingEvents: t.exposeInt('ongoingEvents'),
  }),
});

builder.queryFields(t => ({
  allCounters: t.field({
    description: 'Retrieve all counters',
    type: SummaryCountersType,
    resolve: () =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Summary.getAllCounters();
      }),
  }),
  allOrganizationCounters: t.field({
    description: 'Retrieve all organization counters',
    type: SummaryCountersType,
    args: {
      organizationId: t.arg.string({ required: true }),
    },
    resolve: (_, { organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Summary.getAllOrganizationCounters(organizationId);
      }),
  }),
}));
