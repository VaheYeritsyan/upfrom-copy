import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const organizations = await db.selectFrom('organization').selectAll().execute();
  for (const { id, name } of organizations) {
    const nameDuplicates = await db
      .selectFrom('organization')
      .selectAll()
      .where(sql`LOWER(name)`, '=', name.toLowerCase())
      .where('id', '!=', id)
      .execute();

    for (const { id, name } of nameDuplicates) {
      await db
        .updateTable('organization')
        .set({ name: `${name}-${id}` })
        .where('id', '=', id)
        .execute();
    }
  }

  await db.schema.alterTable('organization').dropConstraint('organization_name_key').execute();

  await db.schema
    .createIndex('organization_name_key')
    .unique()
    .on('organization')
    .expression(sql`LOWER(name)`)
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropIndex('organization_name_key').execute();
  await db.schema.alterTable('organization').addUniqueConstraint('organization_name_key', ['name']).execute();
}
