import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Ensure there are no invalid start/end dates before adding a constraint
  // Set endsAt same as startsAt for events where start/end is incorrect (startsAt > endsAt)
  await db
    .updateTable('event')
    .set(({ ref }) => ({ endsAt: ref('startsAt') }))
    .where(sql`"startsAt" > "endsAt"`)
    .execute();

  await db.schema
    .alterTable('event')
    .addCheckConstraint('event_startsAt_endsAt_date_check', sql`"startsAt" <= "endsAt"`)
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.alterTable('event').dropConstraint('event_startsAt_endsAt_date_check').execute();
}
