import { ulid } from 'ulid';

import { VisibleError, logger } from '@up-from/util';

import { SQL, InsertableType, SelectableType, UpdateableType } from '#sql';
import { loaders } from '#dataloader';

export { Pagination } from '#sql';

export type OrganizationShape = SelectableType['organization'];

type OrganizationInsertable = InsertableType['organization'];
export type OrganizationDraft = Omit<OrganizationInsertable, 'createdAt' | 'updatedAt' | 'id'>;

export type OrganizationUpdateable = UpdateableType['organization'];

export type OrganizationSearchParameters = {
  pagination?: SQL.Pagination & { orderField: keyof OrganizationShape };
  namePattern?: string;
};

export const tableName = 'organization';

const logName = 'Repository Organization:';

export async function create(orgDraft: OrganizationDraft) {
  logger.debug(`${logName} Creating an organization`, { orgDraft });

  const id = ulid();

  try {
    const [organization] = await SQL.DB.insertInto(tableName)
      .values({ ...orgDraft, id })
      .returningAll()
      .execute();

    loaders.organizations.prime(organization.id, organization);

    return organization;
  } catch (err) {
    throw new VisibleError('Failed to create a new organization', {
      isExposable: true,
      cause: err,
      extraInput: { orgDraft },
    });
  }
}

export async function updateAsAdmin(id: string, args: OrganizationUpdateable) {
  logger.debug(`${logName} Updating an organization as Admin`, { id, args });

  if (!Object.keys(args).length) {
    throw new VisibleError('Failed to update an organization as Admin: Update arguments are not provided', {
      isExposable: true,
      extraInput: { id, args },
    });
  }

  try {
    const org = await SQL.DB.updateTable(tableName)
      .set(args)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    loaders.organizations.clear(org.id).prime(org.id, org);

    return org;
  } catch (err) {
    if (err instanceof Error && err?.message === 'no result') {
      throw new VisibleError('Failed to update an organization as Admin: Organization does not exist!', {
        cause: err,
        isExposable: true,
        extraInput: { id, args },
      });
    }

    throw new VisibleError('Failed to update an organization as Admin', {
      isExposable: true,
      cause: err,
      extraInput: { id, args },
    });
  }
}

export async function deleteOne(organizationId: string) {
  logger.debug(`${logName} Deleting an organization`, { organizationId });

  try {
    const removedOrg = await SQL.DB.deleteFrom(tableName).returningAll().where('id', '=', organizationId).execute();
    if (removedOrg.length) {
      loaders.organizations.clear(organizationId);
    }
    return removedOrg[0];
  } catch (err) {
    throw new VisibleError('Failed to delete an organization by ID', {
      cause: err,
      isExposable: true,
      extraInput: { organizationId },
    });
  }
}

export async function findOneById(organizationId: string) {
  logger.debug(`${logName} Selecting an organization`, { organizationId });
  return loaders.organizations.load(organizationId);
}

export async function findOneByIdOrThrow(organizationId: string) {
  const organization = await findOneById(organizationId);

  if (!organization) {
    throw new VisibleError('Failed to find organization: Organization does not exist', {
      isExposable: true,
      extraInput: { organizationId },
    });
  }

  return organization;
}

export async function findAllByIds(organizationIds: string[]) {
  logger.debug(`${logName} Selecting multiple organizations`, { organizationIds });

  if (!organizationIds?.length) return [];

  const organizations = await loaders.organizations.loadMany(organizationIds);
  // Throw nulls and Errors
  if (organizations.some(org => org == null || org instanceof Error)) {
    throw new VisibleError('Failed to select multiple organizations', {
      isExposable: true,
      serviceMessage: 'One or more organizations are missing or are instances of Error',
      extraInput: {
        organizationIds,
        failedOrganizations: organizations.filter(org => org == null || org instanceof Error),
      },
    });
  }

  return organizations as OrganizationShape[];
}

export async function getAll(pagination?: SQL.Pagination) {
  logger.debug(`${logName} Selecting all organizations`, { pagination });

  try {
    let query = SQL.DB.selectFrom(tableName).selectAll();

    if (pagination) {
      query = SQL.addPagination(query, pagination);
    }

    const organizations = await query.orderBy('id', pagination?.order || 'asc').execute();

    organizations.forEach(org => loaders.organizations.prime(org.id, org));

    return organizations;
  } catch (err) {
    throw new VisibleError('Failed to select all organizations', {
      isExposable: true,
      cause: err,
      extraInput: { pagination },
    });
  }
}

export async function getTotalAmount() {
  logger.debug(`${logName} Selecting total amount of organizations`);

  const { countAll } = SQL.DB.fn;
  try {
    const query = SQL.DB.selectFrom(tableName).select(countAll().as('total'));

    const result = await query.executeTakeFirstOrThrow();
    if (typeof result.total === 'number') return result.total;

    throw new VisibleError(`Failed to get number from result.total! Its type "${typeof result.total}"!`, {
      isExposable: false,
      extraInput: { result, totalType: typeof result.total },
    });
  } catch (err) {
    throw new VisibleError('Failed to count total amount of organizations', { isExposable: true, cause: err });
  }
}

export async function findAllByNamePattern(search: OrganizationSearchParameters) {
  logger.debug(`${logName} Selecting all organizations by name pattern`, { search });

  try {
    let query = SQL.DB.selectFrom(tableName).selectAll();

    if (search.namePattern) {
      query = query.where('name', 'ilike', `%${search.namePattern}%`);
    }

    if (search.pagination) {
      query = SQL.addPaginationSortable(query, tableName, search.pagination);
    }

    const orderField = search.pagination?.orderField || 'name';
    const organizations = await query.orderBy(orderField, search.pagination?.order || 'asc').execute();

    organizations.forEach(org => loaders.organizations.prime(org.id, org));

    return organizations;
  } catch (err) {
    throw new VisibleError('Failed to select organizations by name pattern', {
      isExposable: true,
      cause: err,
      extraInput: { search },
    });
  }
}

// This function should be used only by loader
export async function loaderFindAllByIds(ids: readonly string[]) {
  logger.debug(`${logName} Selecting multiple organizations for loader by IDs`, { ids });

  if (!ids.length) return [];

  try {
    return await SQL.DB.selectFrom(tableName)
      .selectAll()
      .where('id', 'in', ids)
      .orderBy('organization.id', 'asc')
      .execute();
  } catch (err) {
    throw new VisibleError('Failed to find organizations by ID', {
      cause: err,
      isExposable: true,
      extraInput: { ids },
    });
  }
}

export * as Organization from './organization.js';
