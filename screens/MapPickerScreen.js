import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { theme } from '../theme';

export default function MapPickerScreen({ navigation, route }) {
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 14.6297, // Default latitude for Barangay Sacred Heart
    longitude: 121.0341, // Default longitude for Barangay Sacred Heart
  });

  const handleMapPress = (event) => {
    // Update marker position when user taps on the map
    setMarkerPosition(event.nativeEvent.coordinate);
  };

  const handleConfirmLocation = () => {
    // Pass the location back to the previous screen
    if (!route.params?.returnScreen) {
      alert('No return screen specified.');
      return;
    }
    navigation.navigate(route.params.returnScreen, {
      location: markerPosition,
      address: 'Manually Selected Location', // Placeholder address
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 14.6297,
          longitude: 121.0341,
          latitudeDelta: 0.01, // Zoom level
          longitudeDelta: 0.01, // Zoom level
        }}
        onPress={handleMapPress} // Allow users to set a marker by tapping
        loadingEnabled={true}
        loadingIndicatorColor={theme.colors.primary}
        loadingBackgroundColor="#f9f9f9"
      >
        <Marker
          coordinate={markerPosition}
          draggable // Allow users to drag the marker
          onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)} // Update position when dragging ends
        />
      </MapView>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
        <Text style={styles.confirmButtonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
