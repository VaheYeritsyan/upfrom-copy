/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('listing_subcategory').dropConstraint('listing_subcategory_listingId_fkey').execute();
  await db.schema
    .alterTable('listing_subcategory')
    .addForeignKeyConstraint('listing_subcategory_listingId_fkey', ['listingId'], 'listing', ['id'])
    .onDelete('restrict')
    .onUpdate('cascade')
    .execute();

  await db.schema.alterTable('listing_subcategory').dropConstraint('listing_subcategory_subcategoryId_fkey').execute();
  await db.schema
    .alterTable('listing_subcategory')
    .addForeignKeyConstraint('listing_subcategory_subcategoryId_fkey', ['subcategoryId'], 'subcategory', ['id'])
    .onDelete('restrict')
    .onUpdate('cascade')
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing_subcategory').dropConstraint('listing_subcategory_listingId_fkey').execute();
  await db.schema
    .alterTable('listing_subcategory')
    .addForeignKeyConstraint('listing_subcategory_listingId_fkey', ['listingId'], 'listing', ['id'])
    .onDelete('cascade')
    .onUpdate('cascade')
    .execute();

  await db.schema.alterTable('listing_subcategory').dropConstraint('listing_subcategory_subcategoryId_fkey').execute();
  await db.schema
    .alterTable('listing_subcategory')
    .addForeignKeyConstraint('listing_subcategory_subcategoryId_fkey', ['subcategoryId'], 'subcategory', ['id'])
    .onDelete('cascade')
    .onUpdate('cascade')
    .execute();
}
