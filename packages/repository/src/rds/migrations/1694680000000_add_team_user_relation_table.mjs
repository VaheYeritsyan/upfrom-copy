import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Team Users (many to many)
  await db.schema
    .createTable('team_user')
    .addColumn('teamId', 'varchar(26)', col =>
      col.references('team.id').onDelete('cascade').onUpdate('cascade').notNull(),
    )
    .addColumn('userId', 'varchar(26)', col =>
      col.references('user.id').onDelete('cascade').onUpdate('cascade').notNull(),
    )
    .addColumn('role', 'varchar(128)', col => col.notNull().defaultTo('member'))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('team_user_teamId_userId_key', ['teamId', 'userId']) // Each user can be a team member only once per team
    .addCheckConstraint('team_user_role_check', sql`role IN ('mentor', 'member')`) // Role should be mentor or member only
    .execute();

  // To speed up selection of team members and user teams
  await db.schema.createIndex('team_user_teamId_key').on('team_user').column('teamId').execute();
  await db.schema.createIndex('team_user_userId_key').on('team_user').column('userId').execute();

  // Move teamId from user table to team_user table
  await db
    .insertInto('team_user')
    .columns(['teamId', 'userId', 'createdAt', 'updatedAt'])
    .expression(({ selectFrom }) =>
      selectFrom('user').select(() => ['user.teamId', 'user.id', 'user.createdAt', 'user.updatedAt']),
    )
    .execute();

  // Remove teamId from user table
  await db.schema.alterTable('user').dropColumn('teamId').execute();
  await db.schema.alterTable('user').dropColumn('type').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  // Restore teamId filed in user table
  await db.schema
    .alterTable('user')
    .addColumn('teamId', 'text', col => col.references('team.id').onDelete('restrict'))
    .execute();

  // Restore IDs if possible
  await db
    .updateTable('user')
    .set(({ selectFrom }) => ({
      teamId: selectFrom('team_user').select('teamId').whereRef('user.id', '=', 'team_user.userId').limit(1),
    }))
    .execute();

  // Restore type field in user
  await db.schema
    .alterTable('user')
    .addColumn('type', 'text', col => col.notNull().defaultTo('mentee'))
    .execute();

  // Restore constraint of type field
  await db.schema
    .alterTable('user')
    .addCheckConstraint('user_type_check', sql`type IN ('mentor', 'mentee')`)
    .execute();

  await db.schema.dropTable('team_user').execute();
}
