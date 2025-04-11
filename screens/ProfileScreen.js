import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Image,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useUserContext } from '../context/UserContext';
const { width } = Dimensions.get('window');
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dmpgutlof/image/upload';
const CLOUDINARY_PRESET = 'profile_images_upload';
export default function ProfileScreen() {
  const { user } = useUserContext();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [registeredPets, setRegisteredPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.userData?.profile_image_link || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const token = 'StraySafeTeam3';

  const handleProfileImageUpload = async () => {
    try {
      console.log('Starting profile image upload process');
  
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!pickerResult.canceled) {
        console.log('Image selected:', pickerResult.assets[0]);
  
        setIsProcessing(true);
        const imageUri = pickerResult.assets[0].uri;
  
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile_image.jpg',
        });
        formData.append('upload_preset', CLOUDINARY_PRESET);
  
        console.log('Uploading image to Cloudinary');
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
        console.log('Cloudinary response:', data);
  
        if (response.ok) {
          const imageUrl = data.secure_url;
  
          // Update local state and context directly
          setProfilePicture(imageUrl);
          // Update context by mutating the userData object
          if (user?.userData) {
            user.userData.profile_image_link = imageUrl;
          }
  
          console.log('Image uploaded to Cloudinary. URL:', imageUrl);
  
          // Update backend with profile image link and email
          console.log('Sending profile image link to backend');
          const updateResponse = await fetch('https://straysafe.me/api/user/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              profile_image_link: imageUrl,
              email: user?.userData?.email, // Pass email from UserContext
            }),
          });
  
          const updateData = await updateResponse.json();
          console.log('Backend response:', updateData);
  
          if (updateData.status === 'success') {
            Alert.alert('Success', 'Profile image updated successfully!');
          } else {
            Alert.alert('Error', updateData.message || 'Failed to update profile image.');
          }
        } else {
          throw new Error(data.error?.message || 'Image upload failed.');
        }
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture.');
    } finally {
      setIsProcessing(false);
      console.log('Profile image upload process completed');
    }
  };
  
  
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to allow access to your photos.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!pickerResult.canceled) {
        await handleProfilePictureUpload(pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to allow access to your camera.');
        return;
      }

      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!cameraResult.canceled) {
        await handleProfilePictureUpload(cameraResult.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera Error:', error);
    }
  };

  const handleProfilePictureChange = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handleProfileImageUpload },
    ]);
  };

  const handleReportPetPress = () => {
    setIsModalVisible(true);
  };
  const handleOptionSelect = (type) => {
    setIsModalVisible(false);
    navigation.navigate('FeedReportPet', { type });
  };

  const fetchRegisteredPets = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://straysafe.me/api/mobileregisteredanimals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Filter pets to only show those owned by the current user
        const currentUsername = user?.userData?.name;
        if (currentUsername) {
          const filteredPets = data.data.filter(pet => pet.owner === currentUsername);
          setRegisteredPets(filteredPets);
          console.log(`Filtered ${data.data.length} pets to ${filteredPets.length} owned by ${currentUsername}`);
        } else {
          setRegisteredPets([]);
          console.log('No user logged in, showing no pets');
        }
      } else {
        console.error('Failed to fetch pets:', data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRegisteredPets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRegisteredPets();
    
    // Add a listener to refresh the pets list when the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRegisteredPets();
    });
    
    // Clean up the listener when the component is unmounted
    return unsubscribe;
  }, [navigation]);

  const renderPetCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.picture }} style={styles.petImage} />
      <View style={styles.cardContent}>
        <Text style={styles.petName}>{item.pet_name}</Text>
        <Text style={styles.petDetail}>
          <Text style={styles.label}>Type:</Text> {item.animal_type}
        </Text>
        <Text style={styles.petDetail}>
          <Text style={styles.label}>Breed:</Text> {item.breed || 'Unknown'}
        </Text>
        <Text style={styles.petDetail}>
          <Text style={styles.label}>Status:</Text> {item.status}
        </Text>
      </View>
    </View>
  );


  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* User Info Section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleProfilePictureChange}>
            {profilePicture || user?.userData?.profile_image_link ? (
              <Image
                source={{ uri: profilePicture || user?.userData?.profile_image_link }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.addPhotoContainer}>
                <Ionicons name="camera" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.addPhotoText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cameraIconContainer}
            onPress={handleProfilePictureChange}
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {isProcessing && <ActivityIndicator size="small" color={theme.colors.primary} />}
        <Text style={styles.userName}>
          {user?.userData?.name || 'Your Name'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.userData?.email || 'your.email@gmail.com'}
        </Text>
        <Text style={styles.userContact}>
          {user?.userData?.contact_number || 'No contact number provided'}
        </Text>
      </View>

      {/* Registered Pets Section */}
      <Text style={styles.sectionTitle}>My Registered Pets</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading your pets...</Text>
      ) : registeredPets.length > 0 ? (
        <FlatList
          data={registeredPets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.petList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.noPetsText}>You don't have any registered pets yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 175,
    height: 175,
    borderRadius: 87.5,
    borderWidth: 5,
    borderColor: theme.colors.primary,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addPhotoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: theme.colors.primaryLight,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  addPhotoText: {
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  userContact: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  noPetsText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    position: 'absolute', // Make the container float
    bottom: 20, // Place it at the bottom of the screen
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 5,
    elevation: 5,
  },
  reportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  registerButton: {
    flex: 1,
    backgroundColor: theme.colors.orangeAccent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.textPrimary,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: theme.colors.textPrimary,
  },
  cancelButton: {
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  petList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  petImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 5,
  },
  petDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  label: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
});
