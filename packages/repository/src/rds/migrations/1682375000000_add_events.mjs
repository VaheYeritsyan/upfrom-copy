import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable('event')
    .addColumn('id', 'varchar(26)', col => col.primaryKey().notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('startsAt', 'timestamp', col => col.notNull())
    .addColumn('endsAt', 'timestamp', col => col.notNull())
    .addColumn('ownerId', 'varchar(26)', col => col.references('user.id').onDelete('cascade').notNull())
    .addColumn('title', 'varchar(255)', col => col.notNull())
    .addColumn('description', 'varchar(10000)', col => col.notNull())
    .addColumn('location', 'varchar(1000)')
    .addColumn('isIndividual', 'boolean', col =>
      col
        .notNull()
        .defaultTo(false)
        .check(sql`(("isIndividual" IS TRUE AND "teamId" IS NOT NULL) OR ("isIndividual" IS NOT TRUE))`),
    )
    .addColumn('imageUrl', 'text')
    .addColumn('teamId', 'varchar(26)', col => col.references('team.id').onDelete('cascade'))
    .execute();

  // Invitations (many to many)
  await db.schema
    .createTable('event_user')
    .addColumn('eventId', 'varchar(26)', col => col.references('event.id').onDelete('cascade').notNull())
    .addColumn('userId', 'varchar(26)', col => col.references('user.id').onDelete('cascade').notNull())
    .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('isAttending', 'boolean') // accepted, rejected or null (it cannot be rejected for public events)
    .addUniqueConstraint('event_user_eventId_userId_key', ['eventId', 'userId']) // Each user can be invited only once per event
    .execute();

  // To speed up selection of all invitations by a specific event
  await db.schema.createIndex('event_user_eventId_key').on('event_user').column('eventId').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable('event_user').execute();
  await db.schema.dropTable('event').execute();
}
