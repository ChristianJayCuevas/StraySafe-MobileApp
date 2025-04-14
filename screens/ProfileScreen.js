import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
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
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!pickerResult.canceled) {
        setIsProcessing(true);
        const imageUri = pickerResult.assets[0].uri;

        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile_image.jpg',
        });
        formData.append('upload_preset', CLOUDINARY_PRESET);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          const imageUrl = data.secure_url;
          setProfilePicture(imageUrl);
          if (user?.userData) {
            user.userData.profile_image_link = imageUrl;
          }

          const updateResponse = await fetch('https://straysafe.me/api/user/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              profile_image_link: imageUrl,
              email: user?.userData?.email,
            }),
          });

          const updateData = await updateResponse.json();
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
      Alert.alert('Error', 'Failed to update profile picture.');
    } finally {
      setIsProcessing(false);
    }
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
        const currentUsername = user?.userData?.name;
        if (currentUsername) {
          const filteredPets = data.data.filter(pet => pet.owner === currentUsername);
          setRegisteredPets(filteredPets);
        } else {
          setRegisteredPets([]);
        }
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredPets();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRegisteredPets();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView 
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleProfileImageUpload}>
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
            onPress={handleProfileImageUpload}
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

      <Text style={styles.sectionTitle}>My Registered Pets</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading your pets...</Text>
      ) : registeredPets.length > 0 ? (
        <View style={styles.petList}>
          {registeredPets.map((pet) => (
            <View key={pet.id.toString()} style={styles.card}>
              <Image source={{ uri: pet.picture }} style={styles.petImage} />
              <View style={styles.cardContent}>
                <Text style={styles.petName}>{pet.pet_name}</Text>
                <Text style={styles.petDetail}>
                  <Text style={styles.label}>Type:</Text> {pet.animal_type}
                </Text>
                <Text style={styles.petDetail}>
                  <Text style={styles.label}>Breed:</Text> {pet.breed || 'Unknown'}
                </Text>
                <Text style={styles.petDetail}>
                  <Text style={styles.label}>Status:</Text> {pet.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noPetsText}>You don't have any registered pets yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
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
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  userContact: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
    marginTop: 10,
  },
  noPetsText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
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
