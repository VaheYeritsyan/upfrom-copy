import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createIndex('listing_description_gin')
    .on('listing')
    .using('gin')
    .expression(sql`to_tsvector('english', description)`)
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropIndex('listing_description_gin').execute();
}
