import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */

export async function up(db) {
  await db.schema
    .alterTable('user')
    .addColumn('type', 'text', col => col.notNull().defaultTo('mentee'))
    .execute();

  await db.schema
    .alterTable('user')
    .addCheckConstraint('user_type_check', sql`type IN ('mentor', 'mentee')`)
    .execute();

  await db.schema
    .alterTable('user')
    .addColumn('updatedAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .alterTable('user')
    .addColumn('teamId', 'text', col => col.references('team.id').onDelete('restrict'))
    .execute();

  await db.schema
    .alterTable('user')
    // ULID is 26 symbols long
    .alterColumn('id', col => col.setDataType('varchar(26)'))
    .execute();

  await db.schema.alterTable('user').renameColumn('created', 'createdAt').execute();

  await db.schema
    .alterTable('user')
    .alterColumn('createdAt', col => col.setNotNull())
    .execute();

  await db.schema
    .alterTable('user')
    .alterColumn('createdAt', col => col.setDefault(sql`now()`))
    .execute();

  await db.schema
    .alterTable('user')
    .alterColumn('phone', col => col.setNotNull())
    .execute();

  await db.schema.alterTable('user').addUniqueConstraint('user_phone_key', ['phone']).execute();

  await db.schema.alterTable('user').addUniqueConstraint('user_email_key', ['email']).execute();

  // Improves search operations
  await db.schema.createIndex('user_type_index').on('user').column('type').execute();
  await db.schema.createIndex('user_phone_index').on('user').column('phone').execute();

  await db.schema.dropTable('mentor').execute();
  await db.schema.dropTable('mentee').execute();
  // All the indexes will be dropped automatically
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropIndex('user_type_index').execute();
  await db.schema.dropIndex('user_phone_index').execute();

  await db.schema.alterTable('user').dropConstraint('user_phone_key').execute();
  await db.schema.alterTable('user').dropConstraint('user_email_key').execute();

  await db.schema
    .alterTable('user')
    .alterColumn('phone', col => col.dropNotNull())
    .execute();

  await db.schema
    .alterTable('user')
    .alterColumn('createdAt', col => col.setDefault('now()'))
    .execute();

  await db.schema
    .alterTable('user')
    .alterColumn('createdAt', col => col.dropNotNull())
    .execute();

  await db.schema.alterTable('user').renameColumn('createdAt', 'created').execute();

  await db.schema
    .alterTable('user')
    .alterColumn('id', col => col.setDataType('text'))
    .execute();

  await db.schema.alterTable('user').dropColumn('teamId').execute();
  await db.schema.alterTable('user').dropColumn('updatedAt').execute();
  await db.schema.alterTable('user').dropConstraint('user_type_check').execute();
  await db.schema.alterTable('user').dropColumn('type').execute();

  // Next part is just a copy from add_mentors_and_mentees migration step
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
