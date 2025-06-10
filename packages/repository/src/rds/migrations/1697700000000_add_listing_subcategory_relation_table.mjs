import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Listing Subcategories (many to many)
  await db.schema
    .createTable('listing_subcategory')
    .addColumn('listingId', 'varchar(26)', col =>
      col.references('listing.id').onDelete('cascade').onUpdate('cascade').notNull(),
    )
    .addColumn('subcategoryId', 'varchar(26)', col =>
      col.references('subcategory.id').onDelete('cascade').onUpdate('cascade').notNull(),
    )
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('listing_subcategory_listingId_subcategoryId_key', ['listingId', 'subcategoryId'])
    .execute();

  // To speed up selection
  await db.schema
    .createIndex('listing_subcategory_listingId_key')
    .on('listing_subcategory')
    .column('listingId')
    .execute();

  // Move subcategoryId from listing table to listing_subcategory table
  await db
    .insertInto('listing_subcategory')
    .columns(['listingId', 'subcategoryId', 'createdAt', 'updatedAt'])
    .expression(({ selectFrom }) =>
      selectFrom('listing').select(() => [
        'listing.id',
        'listing.subcategoryId',
        'listing.createdAt',
        'listing.updatedAt',
      ]),
    )
    .execute();

  // Remove subcategoryId from listing table
  await db.schema.alterTable('listing').dropColumn('subcategoryId').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  // Restore subcategoryId filed in listing table
  await db.schema
    .alterTable('listing')
    .addColumn('subcategoryId', 'varchar(26)', col =>
      col.references('subcategory.id').onDelete('restrict').onUpdate('cascade').notNull(),
    )
    .execute();

  // Restore subcategoryId in listing if possible
  await db
    .updateTable('listing')
    .set(({ selectFrom }) => ({
      subcategoryId: selectFrom('listing_subcategory')
        .select('subcategoryId')
        .whereRef('listing.id', '=', 'listing_subcategory.listingId')
        .limit(1),
    }))
    .execute();

  await db.schema.dropTable('listing_subcategory').execute();
}
