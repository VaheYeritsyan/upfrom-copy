import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('user_notification_preferences')
    .addColumn('userId', 'varchar(26)', col => col.references('user.id').onDelete('cascade').notNull())
    .addColumn('pushChatNewMessage', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushEventNewInvitation', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushEventNewAllTeam', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushEventUpdatedDateTime', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushEventUpdatedLocation', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushEventCancelled', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushEventRemovedIndividual', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('pushTeamNewMember', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('emailChatNewMessage', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('emailEventPendingInvitation', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('user_notification_preferences_userId_key', ['userId'])
    .execute();

  // Add current default values for each existing user
  // The values are not set as default column values of DB schema as they are subject to change
  await db
    .insertInto('user_notification_preferences')
    .expression(({ selectFrom }) =>
      selectFrom('user').select(({ val }) => [
        'user.id as userId',
        val(true).as('pushChatNewMessage'),
        val(true).as('pushEventNewInvitation'),
        val(true).as('pushEventNewAllTeam'),
        val(true).as('pushEventUpdatedDateTime'),
        val(true).as('pushEventUpdatedLocation'),
        val(true).as('pushEventCancelled'),
        val(true).as('pushEventRemovedIndividual'),
        val(false).as('pushTeamNewMember'),
        val(false).as('emailChatNewMessage'),
        val(true).as('emailEventPendingInvitation'),
      ]),
    )
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('user_notification_preferences').execute();
}
