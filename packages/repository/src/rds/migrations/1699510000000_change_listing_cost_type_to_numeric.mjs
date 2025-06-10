/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema.alterTable('listing').dropColumn('cost').execute();
  await db.schema
    .alterTable('listing')
    .addColumn('cost', 'numeric(32,16)', col => col.defaultTo(0))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').dropColumn('cost').execute();
  await db.schema.alterTable('listing').addColumn('cost', 'varchar(128)').execute();
}
