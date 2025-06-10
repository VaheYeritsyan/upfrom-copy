import React, { useMemo } from 'react';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import MaskInput from 'react-native-mask-input';
import axios from 'axios';
import { Location } from 'iconsax-react-native';
import { colors } from '~Theme/Colors';
import { Container } from './Field/Container';
import { inputStyles } from './Field/inputStyles';
import { Typography } from './Typography';
import { PlaceResponse, LocationResults, GQLLocationType } from '~types/location';
import Config from 'react-native-config';

const apiKey = Config.GOOGLE_PLACES_API_KEY;

export type GooglePlacesInputProps = {
  onSelectLocation: (location: GQLLocationType) => void;
  closeModal: () => void;
};

export const GooglePlacesInput = ({ onSelectLocation, closeModal }: GooglePlacesInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState<string>();
  const [data, setData] = useState<PlaceResponse | null>();
  const [loading, setLoading] = useState(false);

  const lastPredictionIdx = useMemo(() => {
    return (data?.predictions.length || 0) - 1;
  }, [data?.predictions.length]);

  const onChangeText = async (text: string) => {
    setInput(text);
    if (text.length === 0) return setData(null);
    if (text.length > 2) {
      setLoading(true);
      const res = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: { input: text, types: 'geocode', key: apiKey },
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
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: { place_id: id, key: apiKey },
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

  const renderLocationItem = (text: string, id: string, idx: number) => {
    return (
      <TouchableOpacity
        key={id}
        style={[styles.itemContainer, idx === lastPredictionIdx && styles.borderRadiusBottom]}
        onPress={() => onItemPress(id)}>
        <Location key={id + 'icon'} size={28} color={colors.primaryMain} variant="Bold" />
        <Typography style={styles.locationText} key={id + 'text'} variant={'body1SemiBold'}>
          {text}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Container
        label={'Location'}
        radius={data?.predictions.length || loading ? 'top' : 'all'}
        floatLabel={!!input || isFocused}
        isDisabled={false}>
        <MaskInput
          style={inputStyles}
          placeholderTextColor={colors.grey400}
          onChangeText={onChangeText}
          value={input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Container>
      {loading && (
        <View style={[styles.itemContainer, !data?.predictions.length && styles.borderRadiusBottom]}>
          <ActivityIndicator size="small" color={colors.primaryMain} />
        </View>
      )}

      {data?.predictions.length
        ? data.predictions.map((item, idx) => renderLocationItem(item.description, item.place_id, idx))
        : null}
    </>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.grey200,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  borderRadiusBottom: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  icon: {
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
  },
});
