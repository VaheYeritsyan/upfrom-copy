import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  // Managers
  await db.schema.dropTable('organization_manager').execute();

  // City
  await sql`
  DROP TRIGGER IF EXISTS update_city_funds_left_to_donate_on_listing_change ON listing;
  DROP TRIGGER IF EXISTS update_city_funds_left_to_donate_on_account_change ON account;

  DROP FUNCTION IF EXISTS update_city_funds_left_to_donate_on_listing_change;
  DROP FUNCTION IF EXISTS update_city_funds_left_to_donate_on_account_change;

  DROP PROCEDURE IF EXISTS update_city_funds_left_to_donate_counter;
  `.execute(db.withSchema(db.schema));

  // Transactions and Payment accounts
  await db.schema.dropTable('transaction').execute();
  await db.schema.dropTable('account').execute();

  // Listing
  await db.schema.alterTable('organization').dropColumn('activeListingAmount').execute();
  await db.schema.dropTable('user_listing').execute();
  await db.schema.dropTable('listing_cause').execute();
  await db.schema.dropTable('listing').execute();

  await db.schema.dropTable('city').execute();

  // Cause
  await db.schema.dropTable('cause').execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down() {
  throw new Error('This migration cannot be rolled back!');
}
