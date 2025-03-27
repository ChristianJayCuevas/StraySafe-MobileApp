import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { useMapContext } from '../context/MapContext';

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const defaultLocation = {
    latitude: 14.6261,
    longitude: 121.0423,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const { mapLocation, address } = useMapContext();
  const [userLocation, setUserLocation] = useState(defaultLocation);

  const [markers, setMarkers] = useState([
    {
      id: '1',
      latitude: 14.6247,
      longitude: 121.0419,
      title: 'Stray Dog Sighting',
      description: 'A stray dog was sighted near Central Street.',
      image: require('../assets/Snapshot1.jpg'),
    },
    {
      id: '2',
      latitude: 14.6255,
      longitude: 121.0443,
      title: 'Stray Dog Sighting',
      description: 'A stray dog was sighted near Limbaga Street.',
      image: require('../assets/Snapshot5.png'),
    },
    {
      id: '3',
      latitude: 14.6281,
      longitude: 121.0428,
      title: 'Stray Cat Sighting',
      description: 'A stray cat was sighted near Scout Street.',
      image: require('../assets/Snapshot4.png'),
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Permission to access location was denied. Default location will be used.'
          );
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch {
        Alert.alert('Error', 'Unable to fetch location. Default location will be used.');
      }
    })();
  }, []);

  useEffect(() => {
    if (route.params?.location) {
      const newMarker = {
        id: `${markers.length + 1}`,
        latitude: route.params.location.latitude,
        longitude: route.params.location.longitude,
        title: 'Custom Marker',
        description: route.params.address || 'Custom Location',
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    }
  }, [route.params?.location]);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={openDrawer} style={styles.iconContainer}>
            <Image
              source={require('../assets/sidebar.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/LOGO.png')}
              style={styles.logoImage}
            />
          </View>
        </View>
      </View>

      {userLocation.latitude && userLocation.longitude ? (
        <MapView
          style={styles.map}
          region={userLocation} // Use region for dynamic updates
          showsUserLocation={true}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading Map...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'column',
    height: 100,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoImage: { height: 40, resizeMode: 'contain' },
  map: { ...StyleSheet.absoluteFillObject },
});
