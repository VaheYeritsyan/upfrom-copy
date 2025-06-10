/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('event')
    .addColumn('isCancelled', 'boolean', col => col.notNull().defaultTo(false))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('event').dropColumn('isCancelled').execute();
}
