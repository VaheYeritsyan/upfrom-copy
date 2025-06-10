/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('team')
    .addColumn('isDisabled', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('disabledUserIds', 'varchar(26)[]')
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('team').dropColumn('isDisabled').execute();
  await db.schema.alterTable('team').dropColumn('disabledUserIds').execute();
}
