import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
        style={styles.map}
        initialRegion={{
          latitude: 14.6297,
          longitude: 121.0341,
          latitudeDelta: 0.01, // Zoom level
          longitudeDelta: 0.01, // Zoom level
        }}
        onPress={handleMapPress} // Allow users to set a marker by tapping
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
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
