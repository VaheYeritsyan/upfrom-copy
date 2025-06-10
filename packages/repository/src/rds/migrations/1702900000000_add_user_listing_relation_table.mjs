import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // User Listings (Favorites) (many to many)
  await db.schema
    .createTable('user_listing')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('listingId', 'varchar(26)', col =>
      col.references('listing.id').onDelete('cascade').onUpdate('cascade').notNull(),
    )
    .addColumn('userId', 'varchar(26)', col =>
      col.references('user.id').onDelete('cascade').onUpdate('cascade').notNull(),
    )
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('user_listing_listingId_userId_key', ['listingId', 'userId'])
    .execute();

  // To speed up selection
  await db.schema.createIndex('user_listing_userId_key').on('user_listing').column('userId').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('user_listing').execute();
}
