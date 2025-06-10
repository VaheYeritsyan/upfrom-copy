import { RDSData } from '@aws-sdk/client-rds-data';
import { Kysely, Selectable, Updateable, Insertable, SelectQueryBuilder } from 'kysely';
import { DataApiDialect } from 'kysely-data-api';

import { VisibleError } from '@up-from/util';

import { AutoUpdatedAtPlugin } from './autoupdate-updatedAt-plugin.js';
import { ToDatePlugin } from './string-to-date-plugin.js';
import type { Database } from './sql.generated.js';

export { NoResultError } from 'kysely';
export type { Database } from './sql.generated.js';

export const DB = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: 'postgres',
    driver: {
      secretArn: 'arn:aws:secretsmanager:us-east-1:083084509884:secret:dev-upfrom-db-credentials-7TfPsV',
      resourceArn: 'arn:aws:rds:us-east-1:083084509884:cluster:dev-upfrom',
      database: 'postgres',
      client: new RDSData({}),
    },
  }),
  // plugins: [new AutoUpdatedAtPlugin('updatedAt'), new ToDatePlugin(['updatedAt', 'createdAt', 'startsAt', 'endsAt'])],
});

export type SelectableType = {
  [Key in keyof Database]: Selectable<Database[Key]>;
};

export type UpdateableType = {
  [Key in keyof Database]: Updateable<Database[Key]>;
};

export type InsertableType = {
  [Key in keyof Database]: Insertable<Database[Key]>;
};

export type TimeRange = {
  from?: Date | null;
  to?: Date | null;
};

export type Order = 'asc' | 'desc';

export type Pagination = {
  cursor?: string | null; // Previous element ID
  limit?: number | null;
  order: Order;
};

export function addWhereArgs<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  whereArgs: Partial<SelectableType[keyof Database]>,
) {
  let key: keyof typeof whereArgs;
  for (key in whereArgs) {
    const value = whereArgs[key];
    if (value === undefined) continue;

    const operator = value === null ? 'is' : '=';
    const keyField = DB.dynamic.ref(key);
    query = query.where(keyField, operator, value);
  }

  return query;
}

export function addWhereTimeRange<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  range?: {
    timeRange?: TimeRange;
    isOngoingIncluded?: boolean;
  },
) {
  if (!range?.timeRange) return query;

  const { timeRange, isOngoingIncluded = true } = range;

  const { from, to } = timeRange;
  if (from && to && from > to) {
    throw new VisibleError(`Invalid time range: Start date should be the same or earlier than end date`, {
      isExposable: true,
      extraInput: { timeRange },
    });
  }

  const startsAtField = DB.dynamic.ref('startsAt');
  const endsAtField = DB.dynamic.ref('endsAt');
  if (isOngoingIncluded) {
    // Ongoing and regular events should end after range start and start before or at range end
    if (from) query = query.where(endsAtField, '>', from);
    if (to) query = query.where(startsAtField, '<=', to);
  } else {
    // Regular only events should start at or after range start and end before or at range end
    if (from) query = query.where(startsAtField, '>=', from);
    if (to) query = query.where(endsAtField, '<=', to);
  }

  return query;
}

export function addPagination<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  pagination?: Pagination,
) {
  if (!pagination?.cursor && !pagination?.limit) return query;

  const { cursor, limit, order } = pagination;
  if (cursor) {
    const operator = order === 'asc' ? '>' : '<';
    const idField = DB.dynamic.ref('id');
    query = query.where(idField, operator, cursor);
  }

  if (limit) {
    query = query.limit(limit);
  }

  return query;
}

export function addPaginationSortable<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  tableName: TB & string,
  pagination?: Pagination & { orderField?: string | null },
) {
  if (!pagination?.cursor && !pagination?.limit) return query;

  const { cursor, limit, order } = pagination;
  if (cursor) {
    const operator = order === 'asc' ? '>' : '<';
    const orderField = pagination?.orderField || 'id';
    // Implements SQL query:
    // WHERE (
    //   (id > ${cursor} 123 AND name = (SELECT name FROM city WHERE id = 123))
    //   OR name > (SELECT name FROM city WHERE id = 123)
    // )
    const idColumn = DB.dynamic.ref('id');
    const orderColumn = DB.dynamic.ref(orderField);
    query = query.where(({ and, or, eb, selectFrom }) =>
      or([
        and([
          eb(idColumn, operator, cursor),
          eb(orderColumn, '=', selectFrom(tableName).select(orderColumn).where(idColumn, '=', cursor)),
        ]),
        eb(orderColumn, operator, selectFrom(tableName).select(orderColumn).where(idColumn, '=', cursor)),
      ]),
    );
  }

  if (limit) {
    query = query.limit(limit);
  }

  return query;
}

export * as SQL from './sql.js';
