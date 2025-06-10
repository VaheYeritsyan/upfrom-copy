import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { HomeStackParamList, Screens } from '~types/navigation';

type DetailsProps = BottomTabScreenProps<HomeStackParamList, Screens.DETAILS>;

export function Details({ navigation }: DetailsProps) {
  return (
    <View style={styles.container}>
      <Text>Details Screen</Text>
      <Button title="Go to Details... again" onPress={() => navigation.navigate(Screens.DETAILS)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
