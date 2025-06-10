import React, { FC } from 'react';
import GoogleMapReact from 'google-map-react';

import { MapCenter } from '~/types/googlePlaces';
import { GOOGLE_PLACES_API_KEY } from '~/constants/config';
import { MapPinComponent, MapPinItem } from './MapPinComponent';

type Props = {
  items: MapPinItem[];
  width?: string;
  height?: string;
  centerPoint?: MapCenter;
};

export const MapViewComponent: FC<Props> = ({ items, width, height, centerPoint }) => {
  const defaultProps = centerPoint
    ? centerPoint
    : {
        center: {
          lat: 37.1432928,
          lng: -106.2498672,
        },
        zoom: 4,
      };

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: height ? height : '50vh', width: width ? width : '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_PLACES_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}>
        {items.length &&
          items.map(item => {
            if (item.lat && item.lng) {
              return (
                <MapPinComponent
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  lat={item.lat}
                  lng={item.lng}
                  key={item.id}
                  item={item}
                />
              );
            }
          })}
      </GoogleMapReact>
    </div>
  );
};
