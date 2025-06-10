import { Admin } from '@up-from/core/admin';
import { authorizeAdmin } from '@up-from/util/session';

import { handleVisibleError } from '#util/graphql-error';
import { builder } from '../builder.js';

const AdminType = builder.objectRef<Admin.AdminShape>('Admin');

AdminType.implement({
  fields: t => ({
    id: t.exposeID('id'),
    email: t.exposeString('email', { nullable: false }),
    name: t.exposeString('name', { nullable: true }),
    isDisabled: t.exposeBoolean('isDisabled', { nullable: false }),
    createdAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: user => handleVisibleError(() => user.createdAt),
    }),
    updatedAt: t.field({
      type: 'Timestamp',
      nullable: false,
      resolve: user => handleVisibleError(() => user.updatedAt),
    }),
  }),
});

builder.queryFields(t => ({
  allAdmins: t.field({
    description: 'Retrieve all admins',
    type: [AdminType],
    nullable: true,
    resolve: () =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Admin.getAll();
      }),
  }),
}));

builder.mutationFields(t => ({
  createAdmin: t.field({
    description: 'Create new admin account',
    type: AdminType,
    args: {
      email: t.arg.string({ required: true }),
      name: t.arg.string({ required: false }),
    },
    resolve: (_, { email, name }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Admin.create(email, name);
      }),
  }),
  disableAdmin: t.field({
    description: 'Disable admin account',
    type: AdminType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Admin.disable(id);
      }),
  }),
  enableAdmin: t.field({
    description: 'Enable admin account',
    type: AdminType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, { id }) =>
      handleVisibleError(() => {
        authorizeAdmin();
        return Admin.enable(id);
      }),
  }),
}));
