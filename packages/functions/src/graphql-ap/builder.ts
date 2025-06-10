import SchemaBuilder, { ArgBuilder } from '@pothos/core';
import RelayPlugin from '@pothos/plugin-relay';
import { DateResolver, NonNegativeIntResolver, TimestampResolver } from 'graphql-scalars';

type TypesWithDefaults = PothosSchemaTypes.ExtendDefaultTypes<SchemaTypes>;
type Order = 'asc' | 'desc';
type TransactionFilter = 'incoming' | 'outgoing';

export interface SchemaTypes {
  Scalars: {
    Date: { Input: Date; Output: Date };
    PositiveInt: { Input: number; Output: number };
    Timestamp: { Input: Date; Output: Date };
    Order: { Input: Order; Output: Order };
    TransactionFilter: { Input: TransactionFilter; Output: TransactionFilter };
  };
}

export const builder = new SchemaBuilder<SchemaTypes>({
  plugins: [RelayPlugin],
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'ID',
    idFieldName: 'globalId',
  },
});

builder.addScalarType('Date', DateResolver, {});
builder.addScalarType('PositiveInt', NonNegativeIntResolver, {});
builder.addScalarType('Timestamp', TimestampResolver, {});
builder.enumType('Order', { values: ['asc', 'desc'] as const });
builder.queryType({ description: 'UpFrom Admin queries' }); // Additional queries should be added with queryFields
builder.mutationType({ description: 'UpFrom Admin mutations' }); // Additional mutations should be added with mutationFields

export function createDateRangeArgs(arg: ArgBuilder<TypesWithDefaults>) {
  return {
    from: arg({ type: 'Timestamp' }),
    to: arg({ type: 'Timestamp' }),
  };
}

export const LocationInput = builder.inputType('LocationInput', {
  fields: t => ({
    locationID: t.string({ required: true }),
    locationName: t.string({ required: true }),
    lat: t.string({ required: true }),
    lng: t.string({ required: true }),
  }),
});

export type Location = {
  locationID: string;
  locationName: string;
  lat: string;
  lng: string;
};

export const LocationType = builder.objectRef<Location>('LocationType').implement({
  fields: t => ({
    locationID: t.exposeString('locationID'),
    locationName: t.exposeString('locationName'),
    lat: t.exposeString('lat'),
    lng: t.exposeString('lng'),
  }),
});

export const StateInput = builder.inputType('StateInput', {
  fields: t => ({
    abbreviation: t.string({ required: true }),
    name: t.string({ required: false }),
  }),
});

export const MinMaxInput = builder.inputType('MinMaxInput', {
  fields: t => ({
    min: t.float(),
    max: t.float(),
  }),
});
