import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('user')
    .addColumn('id', 'text', col => col.primaryKey().notNull())
    .addColumn('email', 'text')
    .addColumn('name', 'text')
    .addColumn('phone', 'text', col =>
      col.check(sql`phone ~* '^[\+][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$'`),
    )
    .addColumn('birthday', 'date')
    .addColumn('gender', 'text', col => col.check(sql`gender = 'male' OR gender = 'female'`))
    .addColumn('created', 'timestamp', col => col.defaultTo('now()'))
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('user').execute();
}
