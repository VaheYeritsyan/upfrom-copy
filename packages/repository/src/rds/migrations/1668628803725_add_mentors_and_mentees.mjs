import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('mentor')
    .addColumn('id', 'varchar(64)', col => col.primaryKey().notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('teamId', 'text', col => col.references('team.id').onDelete('restrict').notNull())
    .addColumn('userId', 'text', col => col.references('user.id').onDelete('restrict').notNull())
    .execute();
  await db.schema.createIndex('mentorTeamIdIndex').on('mentor').column('teamId').execute();
  await db.schema.createIndex('mentorUserIdIndex').on('mentor').column('userId').execute();

  await db.schema
    .createTable('mentee')
    .addColumn('id', 'varchar(64)', col => col.primaryKey().notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('teamId', 'text', col => col.references('team.id').onDelete('restrict').notNull())
    .addColumn('firstName', 'text', col => col.notNull())
    .addColumn('lastName', 'text', col => col.notNull())
    .addColumn('birthday', 'date', col => col.notNull())
    .addColumn('gender', 'text', col => col.check(sql`gender = 'male' OR gender = 'female'`).notNull())
    .execute();
  await db.schema.createIndex('menteeTeamIdIndex').on('mentee').column('teamId').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('mentor').execute();
  await db.schema.dropTable('mentee').execute();
}
