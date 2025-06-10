import { Team, Organization } from '@up-from/core';
import { getAuthorizedUserProperties } from '@up-from/util/session';

import { handleVisibleError } from '#util/graphql-error';
import { builder } from '../builder.js';
import { TeamType } from './team.js';

export const OrganizationType = builder.objectRef<Organization.OrganizationShape>('Organization');

OrganizationType.implement({
  fields: t => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    details: t.exposeString('details'),
    imageUrl: t.exposeString('imageUrl', { nullable: true }),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: team => handleVisibleError(() => team.createdAt),
    }),
    teams: t.field({
      type: [TeamType],
      resolve: org =>
        handleVisibleError(() => {
          const { id: userId } = getAuthorizedUserProperties();
          return Team.findUserTeamsByOrgId(userId, org.id);
        }),
    }),
  }),
});

builder.queryFields(t => ({
  organization: t.field({
    description: 'Get single organization',
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: orgId }) =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return Organization.getOneOrganizationForUser(orgId, userId);
      }),
  }),
  myOrganizations: t.field({
    description: 'Retrieve all organizations that are visible to this user',
    type: [OrganizationType],
    nullable: true,
    resolve: () =>
      handleVisibleError(() => {
        const { id: userId } = getAuthorizedUserProperties();
        return Organization.findAllUserOrganizations(userId);
      }),
  }),
}));

// builder.mutationFields(t => ({}));
