import React, { ChangeEvent } from 'react';
import { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { API_URL } from '~/constants/config';
import { CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { TextField } from '@mui/material';
import { useAuthContext } from '~/contexts/authContext';
import styles from './autocomplete-input-option.module.scss';
import { GQLLocationType, LocationResults, PlaceResponse } from '~/types/googlePlaces';

export type GooglePlacesAutocompleteInputProps = {
  onSelectLocation: (location: GQLLocationType) => void;
  closeModal: () => void;
};
export const GooglePlacesAutocompleteInput = ({ onSelectLocation, closeModal }: GooglePlacesAutocompleteInputProps) => {
  const [input, setInput] = useState<string>();
  const [data, setData] = useState<PlaceResponse | null>();
  const [loading, setLoading] = useState(false);
  const { token } = useAuthContext();

  const onChangeText = async (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = event.target.value;
    setInput(text);
    if (text.length === 0) return setData(null);
    if (text.length > 2) {
      setLoading(true);
      const res = await axios.get(`${API_URL}/location/autocomplete`, {
        params: { input: text },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setData(res.data);
        setLoading(false);
      } else {
        setData(null);
        setLoading(false);
      }
    }
  };

  const onItemPress = async (id: string) => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/location/geocode`, {
      params: { placeId: id },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data) {
      const locationRes = res.data as LocationResults;
      const locationData = {
        locationID: locationRes.results[0].place_id,
        locationName: locationRes.results[0].formatted_address,
        lat: locationRes.results[0].geometry.location.lat.toString(),
        lng: locationRes.results[0].geometry.location.lng.toString(),
      };
      onSelectLocation(locationData);
      closeModal();
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  const renderLocationItem = (text: string, id: string) => {
    return (
      <div key={id} onClick={() => onItemPress(id)} className={styles.itemContainer}>
        <LocationOnIcon color="primary" />
        <Typography key={id + 'text'} variant="body1">
          {text}
        </Typography>
      </div>
    );
  };

  return (
    <>
      <div>
        <TextField
          label={'Location'}
          size={'medium'}
          fullWidth
          value={input}
          onChange={e => onChangeText(e)}
          placeholder="Location"
        />
      </div>
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}

      {data?.predictions.length
        ? data.predictions.map(item => renderLocationItem(item.description, item.place_id))
        : null}
    </>
  );
};
