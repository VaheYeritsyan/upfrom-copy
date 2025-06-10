import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const causes = await db.selectFrom('cause').selectAll().execute();
  for (const { id, name } of causes) {
    const nameDuplicates = await db
      .selectFrom('cause')
      .selectAll()
      .where(sql`LOWER(name)`, '=', name.toLowerCase())
      .where('id', '!=', id)
      .execute();

    for (const { id, name } of nameDuplicates) {
      await db
        .updateTable('cause')
        .set({ name: `${name}-${id}` })
        .where('id', '=', id)
        .execute();
    }
  }

  await db.schema.alterTable('cause').dropConstraint('cause_name_key').execute();

  await db.schema
    .createIndex('cause_name_key')
    .unique()
    .on('cause')
    .expression(sql`LOWER(name)`)
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropIndex('cause_name_key').execute();
  await db.schema.alterTable('cause').addUniqueConstraint('cause_name_key', ['name']).execute();
}
