import { sql } from 'kysely';

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .alterTable('city')
    .addColumn('fundsLeftToDonate', 'numeric(18,2)', col => col.notNull().defaultTo(0))
    .execute();

  // Functions and triggers that update city.fundsLeftToDonate counter on:
  // - listing insert/update/delete
  // - account update/delete
  await sql`
  --
  -- City fundsLeftToDonate counter update procedure
  -- Be cautious! This procedure is heavy and might take a long time to complete. It runs a query that uses 2 subqueries
  --
  CREATE OR REPLACE PROCEDURE update_city_funds_left_to_donate_counter(city_id text)
  LANGUAGE plpgsql
  AS $$
    BEGIN
      -- Update city fundsLeftToDonate
      UPDATE
        city
      SET
        "updatedAt" = now(), "fundsLeftToDonate" = (
          -- Calculate funds left to donate from the list of specified listing accounts
          SELECT
            COALESCE(SUM("limit" - ("points" + "credits")),0) AS "fundsLeftToDonate"
          FROM
            account
          WHERE
            "listingId" IN (
              -- Get published, active, not completed listings (listing ids) for this city
              SELECT
                id
              FROM
                listing
              WHERE
                "cityId" = city_id AND "isCompleted" = false AND "isDraft" = false AND "isDisabled" = false
            ) AND "limit" IS NOT NULL AND "type" = 'listing' AND "isDisabled" = false
        )
      WHERE
        id = city_id;
    END;
  $$;

  --
  -- Update city fundsLeftToDonate counters on listing change
  --
  CREATE OR REPLACE FUNCTION update_city_funds_left_to_donate_on_listing_change() RETURNS TRIGGER AS $$
    BEGIN
      -- Update city fundsLeftToDonate counter only on active, published, not completed listing insert.
      IF (TG_OP = 'INSERT' AND NEW."cityId" IS NOT NULL AND NEW."isDraft" = false AND NEW."isDisabled" = false AND NEW."isCompleted" = false) THEN
        CALL update_city_funds_left_to_donate_counter(NEW."cityId");

      -- Update city fundsLeftToDonate counters only when activation, publishing, completion, city of this listing is being updated.
      ELSIF (
        TG_OP = 'UPDATE' AND (
          OLD."cityId" != NEW."cityId" OR
          OLD."isDraft" != NEW."isDraft" OR
          OLD."isDisabled" != NEW."isDisabled" OR
          OLD."isCompleted" != NEW."isCompleted"
      )) THEN
        IF (OLD."cityId" IS NOT NULL) THEN
          CALL update_city_funds_left_to_donate_counter(OLD."cityId");
        END IF;

        IF (NEW."cityId" IS NOT NULL AND NEW."cityId" != OLD."cityId") THEN
          CALL update_city_funds_left_to_donate_counter(NEW."cityId");
        END IF;

      -- Update city fundsLeftToDonate counter only on active, published, not completed listing delete.
      ELSIF (TG_OP = 'DELETE' AND OLD."cityId" IS NOT NULL AND OLD."isDraft" = false AND OLD."isDisabled" = false AND OLD."isCompleted" = false) THEN
        CALL update_city_funds_left_to_donate_counter(OLD."cityId");
      END IF;

      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  --
  -- Update city fundsLeftToDonate counters on account change
  --
  CREATE OR REPLACE FUNCTION update_city_funds_left_to_donate_on_account_change() RETURNS TRIGGER AS $$
    DECLARE
      city_id varchar(26);
    BEGIN
      -- Update city fundsLeftToDonate counters only when certain fields of listing account is being updated.
      IF (
        TG_OP = 'UPDATE' AND (
          OLD."type" = 'listing' OR
          NEW."type" = 'listing'
        ) AND (
          OLD."listingId" IS NOT NULL OR
          NEW."listingId" IS NOT NULL
        ) AND (
          OLD."points" != NEW."points" OR
          OLD."credits" != NEW."credits" OR
          OLD."limit" != NEW."limit" OR
          OLD."listingId" != NEW."listingId" OR
          OLD."isDisabled" != NEW."isDisabled" OR
          OLD."type" != NEW."type"
      )) THEN
        IF (OLD."listingId" IS NOT NULL) THEN
          city_id = (SELECT "cityId" FROM "listing" WHERE "id" = OLD."listingId" LIMIT 1);
          IF (city_id IS NOT NULL) THEN
            CALL update_city_funds_left_to_donate_counter(city_id);
          END IF;
        END IF;

        IF (NEW."listingId" IS NOT NULL AND NEW."listingId" != OLD."listingId") THEN
          city_id = (SELECT "cityId" FROM "listing" WHERE "id" = NEW."listingId" LIMIT 1);
          IF (city_id IS NOT NULL) THEN
            CALL update_city_funds_left_to_donate_counter(city_id);
          END IF;
        END IF;

      -- Update city fundsLeftToDonate counters only when deleted account was a listing account.
      ELSIF (TG_OP = 'DELETE' AND OLD."type" = 'listing' AND OLD."listingId" IS NOT NULL) THEN
        city_id = (SELECT "cityId" FROM "listing" WHERE "id" = OLD."listingId" LIMIT 1);
        IF (city_id IS NOT NULL) THEN
          CALL update_city_funds_left_to_donate_counter(city_id);
        END IF;
      END IF;

      RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

  --
  -- Function triggers
  --
  CREATE TRIGGER update_city_funds_left_to_donate_on_listing_change
  AFTER INSERT OR UPDATE OR DELETE ON listing
    FOR EACH ROW EXECUTE FUNCTION update_city_funds_left_to_donate_on_listing_change();

  CREATE TRIGGER update_city_funds_left_to_donate_on_account_change
  AFTER UPDATE OR DELETE ON account
    FOR EACH ROW EXECUTE FUNCTION update_city_funds_left_to_donate_on_account_change();
  `.execute(db.withSchema(db.schema));

  // Update fundsLeftToDonate counters for all cities
  await sql`
  DO LANGUAGE plpgsql $$
    DECLARE
      city city%ROWTYPE;
    BEGIN
      FOR city IN
        SELECT id FROM city
      LOOP
        CALL update_city_funds_left_to_donate_counter(city.id);
      END LOOP;
    END;
  $$;
  `.execute(db.withSchema(db.schema));
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await sql`
  DROP TRIGGER IF EXISTS update_city_funds_left_to_donate_on_listing_change ON listing;
  DROP TRIGGER IF EXISTS update_city_funds_left_to_donate_on_account_change ON account;

  DROP FUNCTION IF EXISTS update_city_funds_left_to_donate_on_listing_change;
  DROP FUNCTION IF EXISTS update_city_funds_left_to_donate_on_account_change;

  DROP PROCEDURE IF EXISTS update_city_funds_left_to_donate_counter;
  `.execute(db.withSchema(db.schema));

  await db.schema.alterTable('city').dropColumn('fundsLeftToDonate').execute();
}
