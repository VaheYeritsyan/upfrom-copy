import { Team, Organization } from '@up-from/core/admin';
import { authorizeAdmin } from '@up-from/util/session';

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
      resolve: ({ createdAt }) => handleVisibleError(() => createdAt),
    }),
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: ({ updatedAt }) => handleVisibleError(() => updatedAt),
    }),
    teams: t.field({
      type: [TeamType],
      resolve: org => handleVisibleError(() => Team.findOrganizationTeams(org.id)),
    }),
  }),
});

builder.queryFields(t => ({
  organization: t.field({
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Organization.findOneById(organizationId);
      }),
  }),
  allOrganizations: t.field({
    description: 'Retrieve all organizations',
    type: [OrganizationType],
    nullable: true,
    resolve: () =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Organization.getAll();
      }),
  }),
  searchOrganizations: t.field({
    description: 'Find organizations by name pattern',
    type: [OrganizationType],
    args: {
      order: t.arg({
        type: 'Order',
        required: true,
        defaultValue: 'asc',
        description: 'Sort order of organizations. Could be "asc" or "desc"',
      }),
      namePattern: t.arg.string(),
    },
    resolve: (_, { namePattern }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Organization.findAllByNamePattern(namePattern ?? undefined);
      }),
  }),
  organizationTotalAmount: t.field({
    description: 'Get total amount of organizations',
    type: 'Int',
    resolve: () =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Organization.getTotalAmount();
      }),
  }),
}));

builder.mutationFields(t => ({
  createOrganization: t.field({
    description: 'Create a new organization',
    type: OrganizationType,
    args: {
      name: t.arg.string({ required: true }),
      details: t.arg.string({ required: true }),
    },
    resolve: (_, { name, details }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Organization.create({ name, details });
      }),
  }),
  updateOrganization: t.field({
    description: 'Update an organization',
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      details: t.arg.string({ required: true }),
    },
    resolve: (_, { id: organizationId, name, details }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Organization.update(organizationId, { name, details });
      }),
  }),
  removeOrganization: t.field({
    description: 'Remove an organization',
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: organizationId }) =>
      handleVisibleError(() => {
        authorizeAdmin();

        return Organization.remove(organizationId);
      }),
  }),
  generateOrganizationImageUploadUrl: t.field({
    description: 'Generates an image upload URL for organization',
    type: 'String',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Organization.generateImageUploadUrl(organizationId);
      }),
  }),
  completeOrganizationImageUpload: t.field({
    description:
      'Completes organization image upload process (converts uploaded image and moves it to a public storage)',
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Organization.completeImageUpload(organizationId);
      }),
  }),
  removeOrganizationImage: t.field({
    description: 'Removes organization image',
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id: organizationId }) =>
      handleVisibleError(async () => {
        authorizeAdmin();

        return Organization.removeImage(organizationId);
      }),
  }),
}));
