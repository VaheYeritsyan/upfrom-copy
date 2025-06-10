import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createIndex('event_title_gin')
    .on('event')
    .using('gin')
    .expression(sql`to_tsvector('english', title)`)
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropIndex('event_title_gin').execute();
}
