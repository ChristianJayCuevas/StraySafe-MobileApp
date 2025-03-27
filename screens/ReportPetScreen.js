import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import { usePostContext } from '../context/PostContext';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ReportPetScreen({ navigation, route }) {
  const { addPost } = usePostContext();

  const defaultLocation = {
    latitude: 14.6261,
    longitude: 121.0423,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [mapRegion, setMapRegion] = useState(defaultLocation);
  const [markerLocation, setMarkerLocation] = useState(defaultLocation);
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [postType, setPostType] = useState(
    route.params?.type
      ? route.params.type.replace(/([a-z])([A-Z])/g, '$1 $2')
          .charAt(0)
          .toUpperCase() + route.params.type.replace(/([a-z])([A-Z])/g, '$1 $2').slice(1)
      : ''
  );

  useEffect(() => {
    if (route.params?.location && route.params?.address) {
      setMarkerLocation(route.params.location);
      setAddress(route.params.address);
    }
  }, [route.params]);

  const formatPhoneNumber = (number) => {
    let sanitizedNumber = number.replace(/[^\d+]/g, '');
    if (!sanitizedNumber.startsWith('+63')) {
      sanitizedNumber = `+63${sanitizedNumber.replace(/^\+63/, '')}`;
    }
    return sanitizedNumber.slice(0, 13);
  };

  const handleContactChange = (input) => {
    setContactNumber(formatPhoneNumber(input));
  };

  const handleAddPhoto = async () => {
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets) {
        setSelectedMedia([...selectedMedia, pickerResult.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while selecting the media.');
      console.error('Media Picker Error:', error);
    }
  };

  const handleConfirmLocation = async () => {
    setLoadingLocation(true);
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: markerLocation.latitude,
        longitude: markerLocation.longitude,
      });
      const formattedAddress = `${response[0]?.street || ''}, ${response[0]?.city || ''}, ${
        response[0]?.region || ''
      }`;
      setAddress(formattedAddress.trim());
      setIsMapVisible(false);
    } catch (error) {
      console.error('Error getting address:', error);
      Alert.alert('Error', 'Unable to fetch address. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setSelectedMedia(selectedMedia.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!markerLocation) {
      Alert.alert('Missing Location', 'Please add a location for the pet.');
      return;
    }

    if (!contactNumber.trim()) {
      Alert.alert('Invalid Contact', 'Please enter a valid contact number.');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      image: selectedMedia.length > 0 ? { uri: selectedMedia[0] } : null,
      location: { ...markerLocation, address },
      postContent,
      contactNumber,
      likes: 0,
      comments: [],
      shares: 0,
      type: postType.toLowerCase().replace(/\s+/g, ''),
    };

    addPost(newPost);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.postType}>{postType}</Text>
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Image source={require('../assets/sidebar.png')} style={styles.profileImage} />
        <TextInput
          style={styles.input}
          placeholder="What's happening?"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          value={postContent}
          onChangeText={setPostContent}
        />
      </View>

      {/* Media Section */}
      {selectedMedia.length > 0 && (
        <View style={styles.mediaContainer}>
          {selectedMedia.map((uri, index) => (
            <View key={index} style={styles.mediaWrapper}>
              <Image source={{ uri }} style={styles.mediaPreview} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => handleRemoveMedia(index)}
              >
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setIsMapVisible(true)}
        disabled={loadingLocation}
      >
        <View style={styles.locationContent}>
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.locationText}>{address || 'Add Location'}</Text>
        </View>
      </TouchableOpacity>

      {/* Add Contact Number */}
      <View style={styles.contactRow}>
        <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
        <TextInput
          style={styles.contactInput}
          placeholder="Contact Number"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={handleContactChange}
        />
      </View>

      {/* Add Media Button */}
      <TouchableOpacity style={styles.addMediaButton} onPress={handleAddPhoto}>
        <Ionicons name="image-outline" size={20} color="#FFF" />
        <Text style={styles.addMediaText}>Add Media</Text>
      </TouchableOpacity>

      {/* Map Modal */}
      <Modal visible={isMapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={defaultLocation}
            onRegionChangeComplete={(region) => setMarkerLocation(region)}
          />
          {/* Paw Icon in the center of the map */}
          <View style={styles.pinContainer}>
            <Image
              source={require('../assets/paw-icon.png')}
              style={styles.pawIcon}
            />
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeMapButton}
            onPress={() => setIsMapVisible(false)}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  postType: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    flex: 1,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  postButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  input: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
    padding: 5,
    borderRadius: 10,
    marginBottom: 5,
  },
  mediaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mediaWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addMediaText: {
    marginLeft: 10,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.primary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  contactInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: theme.colors.textPrimary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    left: '10%',
    right: '10%',
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeMapButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 30,
  },
  pawIcon: {
    width: 50,
    height: 100,
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
});
