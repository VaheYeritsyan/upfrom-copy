/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('listing')
    .addColumn('cityId', 'varchar(26)', col => col.references('city.id').onDelete('restrict').onUpdate('cascade'))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('listing').dropColumn('cityId').execute();
}
