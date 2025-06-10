import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import { Typography } from '@mui/material';
import styles from './mapViewComponent.module.scss';
import { Avatar } from '@mui/material';
import { FC } from 'react';

export type MapPinItem = {
  id: string;
  header: string;
  lat: number;
  lng: number;
  imageUrl: string;
  itemType: string;
};

type ItemProps = {
  item: MapPinItem;
};

export const MapPinComponent: FC<ItemProps> = ({ item }) => {
  return (
    <>
      {item.lat && item.lng && (
        <div
          className={styles.MapPinItem}
          onClick={() => window.open(item.itemType === 'event' ? '/events/' + item.id : '/users/' + item.id)}>
          <Avatar
            variant={item.itemType === 'event' ? 'rounded' : 'circular'}
            src={item.imageUrl}
            alt="Image"
            sx={{ height: '30px', width: '30px' }}
          />
          {item.itemType === 'event' ? <EventIcon color="primary" /> : <PersonIcon color="primary" />}
          <Typography lineHeight={1.2} color="textSecondary" variant="caption" overflow="clip">
            {item.header}
          </Typography>
        </div>
      )}
    </>
  );
};
