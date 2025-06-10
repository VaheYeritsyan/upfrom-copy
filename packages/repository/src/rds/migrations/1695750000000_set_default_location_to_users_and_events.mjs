const defaultLocation = JSON.stringify({
  locationID: 'ChIJCzYy5IS16lQRQrfeQ5K5Oxw',
  locationName: 'United States',
  lat: '37.1432928',
  lng: '-106.2498672',
});

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.updateTable('user').set({ location: defaultLocation }).execute();
  await db.updateTable('event').set({ location: defaultLocation }).execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down() {}
