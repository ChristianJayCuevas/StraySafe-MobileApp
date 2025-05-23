import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [markers, setMarkers] = useState([
    {
      id: '1',
      latitude: 14.6247,
      longitude: 121.0419,
      title: 'Stray Dog Sighting',
      description: 'A stray dog was sighted near Central Street.',
      type: 'dog',
    },
    {
      id: '2',
      latitude: 14.6255,
      longitude: 121.0443,
      title: 'Stray Dog Sighting',
      description: 'A stray dog was sighted near Limbaga Street.',
      type: 'dog',
    },
    {
      id: '3',
      latitude: 14.6281,
      longitude: 121.0428,
      title: 'Stray Cat Sighting',
      description: 'A stray cat was sighted near Scout Street.',
      type: 'cat',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [longitudeInput, setLongitudeInput] = useState('');
  const [latitudeInput, setLatitudeInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied, using default location');
          setIsLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        }).catch(err => {
          console.log('Error getting location:', err);
          return null;
        });

        if (location) {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.log('Location error:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (route.params?.location) {
      try {
        const newMarker = {
          id: `${Date.now()}`,
          latitude: route.params.location.latitude,
          longitude: route.params.location.longitude,
          title: route.params.title || 'Custom Marker',
          description: route.params.address || 'Custom Location',
          type: route.params.type || 'custom',
        };
        setMarkers(prevMarkers => [...prevMarkers, newMarker]);
      } catch (error) {
        console.log('Error adding marker:', error);
      }
    }
  }, [route.params?.location]);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const onMapReady = () => {
    setIsMapReady(true);
  };

  const renderMarker = (marker) => {
    return (
      <Marker
        key={marker.id}
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        description={marker.description}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.headerContainer}>
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
      </View> */}

      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={userLocation}
              onMapReady={onMapReady}
              showsUserLocation={true}
              showsMyLocationButton={true}
              loadingEnabled={true}
              loadingIndicatorColor={theme.colors.primary}
              loadingBackgroundColor="#f9f9f9"
            >
              {markers.map(marker => renderMarker(marker))}
            </MapView>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.plusButtonText}>+</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Marker</Text>
                <Text style={styles.modalDescription}>A stray animal is spotted here.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Longitude"
                  keyboardType="numeric"
                  value={longitudeInput}
                  onChangeText={setLongitudeInput}
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Latitude"
                  keyboardType="numeric"
                  value={latitudeInput}
                  onChangeText={setLatitudeInput}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    const lon = parseFloat(longitudeInput);
                    const lat = parseFloat(latitudeInput);
                    if (isNaN(lon) || isNaN(lat)) {
                      Alert.alert('Invalid input', 'Please enter valid numeric longitude and latitude.');
                      return;
                    }
                      const newMarker = {
                        id: `${Date.now()}`,
                        latitude: lat,
                        longitude: lon,
                        title: 'Stray detected here',
                        description: 'Location',
                        type: 'custom',
                      };
                      setMarkers(prevMarkers => [...prevMarkers, newMarker]);
                      setModalVisible(false);
                      setLongitudeInput('');
                      setLatitudeInput('');
                  }}
                >
                  <Text style={styles.addButtonText}>Add Marker</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  headerContainer: {
    flexDirection: 'column',
    height: 100,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.primary,
    zIndex: 1,
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
  profileImage: { 
    width: 40, 
    height: 40, 
    borderRadius: 20 
  },
  logoContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoImage: { 
    height: 40, 
    resizeMode: 'contain' 
  },
  map: { 
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.primary,
  },
  plusButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  plusButtonText: {
    color: '#fff',
    fontSize: 40,
    lineHeight: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#444',
  },
  input: {
    width: '90%',
    height: 45,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
