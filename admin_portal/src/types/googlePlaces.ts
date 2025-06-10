import { LocationType } from '@up-from/graphql-ap/genql';

export type GQLLocationType = Omit<LocationType, '__typename'>;

export type PlaceResponse = {
  predictions: Prediction[];
};

type Prediction = {
  description: string;
  place_id: string;
  reference: string;
};

export type LocationResults = {
  results: GeocodeResult[];
};

type GeocodeResult = {
  geometry: LocationGeometry;
  formatted_address: string;
  place_id: string;
};

type LocationGeometry = {
  location: Location;
};

type Location = {
  lat: string;
  lng: string;
};

export type centerLocationPoint = {
  lat: number;
  lng: number;
};

export type MapCenter = {
  center: centerLocationPoint;
  zoom: number;
};
