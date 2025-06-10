import { sql } from 'kysely';
import ulidPackage from './ulid/index.mjs';
const { ulid } = ulidPackage;

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Subcategory to Cause
  await db.schema.alterTable('subcategory').renameTo('cause').execute();
  await db.schema.alterTable('cause').dropConstraint('subcategory_name_key').execute();

  await db.schema
    .alterTable('cause')
    .dropColumn('emoji')
    .dropColumn('categoryId')
    .addColumn('imageUrl', 'varchar(1024)')
    .execute();

  await db.schema.alterTable('cause').addUniqueConstraint('cause_name_key', ['name']).execute();

  // Listing/Cause from Listing/Subcategory
  await db.schema.dropIndex('listing_subcategory_listingId_key').execute();
  await db.schema.alterTable('listing_subcategory').renameTo('listing_cause').execute();
  await db.schema
    .alterTable('listing_cause')
    .dropConstraint('listing_subcategory_listingId_subcategoryId_key')
    .execute();

  await db.schema.alterTable('listing_cause').renameColumn('subcategoryId', 'causeId').execute();

  await db.schema
    .alterTable('listing_cause')
    .addUniqueConstraint('listing_cause_listingId_causeId_key', ['listingId', 'causeId'])
    .execute();
  await db.schema.createIndex('listing_cause_listingId_key').on('listing_cause').column('listingId').execute();

  // Listing
  await db.schema.dropIndex('listing_categoryId_key').execute();
  await db.schema.alterTable('listing').dropColumn('categoryId').execute();

  // Category
  await db.schema.dropTable('category').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  // Category
  await db.schema
    .createTable('category')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('name', 'varchar(128)', col => col.notNull())
    .addColumn('emoji', 'varchar(128)', col => col.notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('activeListingAmount', 'integer', col => col.notNull().defaultTo(0))
    .addUniqueConstraint('category_name_key', ['name'])
    .execute();

  // Add default category
  const defaultCategory = await db
    .insertInto('category')
    .values({ id: ulid(), name: 'Default category', emoji: '', activeListingAmount: 0 })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Listing
  await db.schema
    .alterTable('listing')
    .addColumn('categoryId', 'varchar(26)', col =>
      col.references('category.id').onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
  await db.schema.createIndex('listing_categoryId_key').on('listing').column('categoryId').execute();

  // Listing/Subcategory from Listing/Cause
  await db.schema.dropIndex('listing_cause_listingId_key').execute();
  await db.schema.alterTable('listing_cause').renameTo('listing_subcategory').execute();
  await db.schema.alterTable('listing_subcategory').dropConstraint('listing_cause_listingId_causeId_key').execute();

  await db.schema.alterTable('listing_subcategory').renameColumn('causeId', 'subcategoryId').execute();

  await db.schema
    .alterTable('listing_subcategory')
    .addUniqueConstraint('listing_subcategory_listingId_subcategoryId_key', ['listingId', 'subcategoryId'])
    .execute();
  await db.schema
    .createIndex('listing_subcategory_listingId_key')
    .on('listing_subcategory')
    .column('listingId')
    .execute();

  // Cause to Subcategory
  await db.schema.alterTable('cause').renameTo('subcategory').execute();
  await db.schema.alterTable('subcategory').dropConstraint('cause_name_key').execute();

  await db.schema
    .alterTable('subcategory')
    .dropColumn('imageUrl')
    .addColumn('emoji', 'varchar(128)')
    .addColumn('categoryId', 'varchar(26)', col =>
      col.references('category.id').onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema.alterTable('subcategory').addUniqueConstraint('subcategory_name_key', ['name']).execute();

  // Add default values for existing entries
  await db.updateTable('subcategory').set({ categoryId: defaultCategory.id, emoji: '' }).execute();

  await db.schema
    .alterTable('subcategory')
    .alterColumn('categoryId', col => col.setNotNull())
    .alterColumn('emoji', col => col.setNotNull())
    .execute();
}
