import { sql } from 'kysely';
import ulidPackage from './ulid/index.mjs';
const { ulid } = ulidPackage;

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('account')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('ownerId', 'varchar(26)', col => col.references('user.id').onDelete('restrict').onUpdate('cascade'))
    .addColumn('listingId', 'varchar(26)', col => col.references('listing.id').onDelete('restrict').onUpdate('cascade'))
    .addColumn('type', 'varchar(128)', col => col.notNull().defaultTo('user'))
    .addColumn('points', 'numeric(18,2)', col => col.notNull().defaultTo(0))
    .addColumn('credits', 'numeric(18,2)', col => col.notNull().defaultTo(0))
    .addColumn('limit', 'numeric(18,2)')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('account_owner_key', ['listingId'])
    .addUniqueConstraint('account_listing_key', ['ownerId'])
    .addCheckConstraint('account_type_name_check', sql`type in ('user', 'listing', 'stripe')`)
    .addCheckConstraint('account_points_is_positive_number_check', sql`points >= 0`)
    .addCheckConstraint('account_credits_is_positive_number_check', sql`credits >= 0`)
    .addCheckConstraint(
      'account_type_reference_check',
      sql`(("type" = 'user' AND "ownerId" IS NOT NULL AND "listingId" IS NULL) OR ("type" = 'listing' AND "ownerId" IS NULL AND "listingId" IS NOT NULL) OR ("type" != 'user' AND "type" != 'listing' AND "ownerId" IS NULL AND "listingId" IS NULL))`,
    )
    .addCheckConstraint(
      'account_limit_is_null_or_more_than_points_and_credits_check',
      sql`("limit" IS NOT NULL AND "credits" + "points" <= "limit") OR "limit" IS NULL`,
    )
    .execute();

  await db.schema.createIndex('account_ownerId_index').on('account').columns(['ownerId']).execute();
  await db.schema.createIndex('account_listingId_index').on('account').columns(['listingId']).execute();

  await db.schema
    .createTable('transaction')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('senderId', 'varchar(26)', col =>
      col.notNull().references('account.id').onDelete('restrict').onUpdate('cascade'),
    )
    .addColumn('recipientId', 'varchar(26)', col =>
      col.notNull().references('account.id').onDelete('restrict').onUpdate('cascade'),
    )
    .addColumn('amount', 'numeric(18,2)', col => col.notNull().check(sql`amount >= 1`))
    .addColumn('type', 'varchar(26)', col =>
      col
        .notNull()
        .defaultTo('points')
        .check(sql`type in ('points', 'credits')`),
    )
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Create accounts for all users
  const users = await db.selectFrom('user').select(['id']).execute();
  for (const user of users) {
    await db
      .insertInto('account')
      .values({
        id: ulid(),
        ownerId: user.id,
      })
      .execute();
  }

  // Create accounts for all listings
  const listings = await db.selectFrom('listing').select(['id', 'cost']).execute();
  for (const listing of listings) {
    let limit = Number.parseFloat(listing.cost);
    if (Number.isNaN(limit) || limit <= 0) {
      limit = null;
    }

    await db
      .insertInto('account')
      .values({
        id: ulid(),
        listingId: listing.id,
        type: 'listing',
        limit,
      })
      .execute();
  }

  // Create Stripe account to track deposits and withdrawals
  await db
    .insertInto('account')
    .values({
      id: ulid(),
      type: 'stripe',
    })
    .execute();

  // Change listing cost type
  await db.schema.alterTable('listing').dropColumn('cost').execute();
  await db.schema
    .alterTable('listing')
    .addColumn('cost', 'numeric(18,2)', col => col.defaultTo(0))
    .execute();

  for (const listing of listings) {
    let cost = Number.parseFloat(listing.cost);
    if (Number.isNaN(cost) || cost <= 0) {
      cost = 0;
    }

    await db.updateTable('listing').where('id', '=', listing.id).set({ cost }).execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('transaction').execute();
  await db.schema.dropTable('account').execute();

  // Revert listing cost type
  const listings = await db.selectFrom('listing').select(['id', 'cost']).execute();
  await db.schema.alterTable('listing').dropColumn('cost').execute();
  await db.schema
    .alterTable('listing')
    .addColumn('cost', 'numeric(32,16)', col => col.defaultTo(0))
    .execute();

  for (const listing of listings) {
    let cost = Number.parseFloat(listing.cost);
    if (Number.isNaN(cost) || cost <= 0) {
      cost = 0;
    }

    await db.updateTable('listing').where('id', '=', listing.id).set({ cost }).execute();
  }
}
