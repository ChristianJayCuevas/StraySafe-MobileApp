import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useUserContext } from '../context/UserContext';
export default function RegisterPet() {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [petImage, setPetImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { user } = useUserContext();

  const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dmpgutlof/image/upload';
  const CLOUDINARY_PRESET = 'pet_images_upload';
  const token = 'StraySafeTeam3';
  const handleAddPhoto = async () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handlePickPhoto },
    ]);
  };

  const handlePickPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to allow access to your photos.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!pickerResult.canceled) {
        setPetImage(pickerResult.assets[0].uri);
        analyzeImage(pickerResult.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while selecting an image.');
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

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!pickerResult.canceled) {
        setPetImage(pickerResult.assets[0].uri);
        analyzeImage(pickerResult.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while taking a photo.');
      console.error('Camera Error:', error);
    }
  };

  const analyzeImage = async (base64Image) => {
    setIsProcessing(true);
    setDetectionResult(null);
    try {
      const response = await fetch(
        'https://flaskapp2.greenwater-63e22cc8.southeastasia.azurecontainerapps.io/process_image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        }
      );
  
      const data = await response.json();
      if (data?.labeled_boxes?.length > 0) {
        let { label, confidence } = data.labeled_boxes[0];
  
        // Flip the label
        label = label === 'dog' ? 'cat' : label === 'cat' ? 'dog' : label;
  
        if (confidence < 0.8) {
          Alert.alert(
            'Low Confidence',
            'We only allow images of cats and dogs for feature matching. Please upload a clear image.'
          );
          setPetImage(null);
          setDetectionResult(null);
        } else {
          setDetectionResult({ label, confidence });
          setPetType(label); // Auto-fill Pet Type
        }
      } else {
        Alert.alert('Detection Failed', 'Could not identify the animal in the photo.');
        setPetImage(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
      console.error('Image Analysis Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // Adjust the type if needed based on your image format
      name: 'pet_image.jpg', // You can customize the file name
    });
    formData.append('upload_preset', CLOUDINARY_PRESET);
  
    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return data.secure_url; // Return the uploaded image URL
      } else {
        throw new Error(data.error?.message || 'Image upload failed.');
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw new Error('Image upload failed.');
    }
  };
  
  // Modified the handleRegisterPet function to use the raw image file instead of base64

  const handleRegisterPet = async () => {
    if (isProcessing) {
      setModalMessage('Please wait for the verification of the photo.');
      setModalVisible(true);
      return;
    }
  
    if (!petName || !petType || !petBreed || !ownerContact || !petImage) {
      setModalMessage('Please fill up all the input boxes.');
      setModalVisible(true);
      return;
    }
  
    try {
      setModalMessage('Registering your pet...');
      setModalVisible(true);
  
      // Upload raw image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(petImage);
  
      // Prepare JSON payload
      const payload = {
        owner: user?.userData?.name,
        contact: ownerContact,
        pet_name: petName,
        animal_type: petType,
        picture: imageUrl,
        breed: petBreed,
      };
  
      // Log the JSON payload for debugging
      console.log('Sending JSON Payload:', JSON.stringify(payload));
  
      // Send pet data to your web server
      const response = await fetch('https://straysafe.me/api/mobileregisteredanimals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      // Log the raw response text for debugging
      const responseText = await response.text();
      console.log('Raw Response Text:', responseText);
  
      // Check if the response is JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error('Server returned non-JSON response.'); // Re-throw as a new error
      }
  
      if (data.status === 'success') {
        Alert.alert('Success', 'Your pet has been registered successfully!');
        setPetName('');
        setPetType('');
        setPetBreed('');
        setOwnerContact('');
        setPetImage(null);
        setDetectionResult(null);
      } else {
        Alert.alert('Error', 'Failed to register pet. Please try again.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Error', 'Failed to register pet. Please try again.');
    } finally {
      setModalVisible(false);
    }
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>Register Your Pet</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={handleAddPhoto}>
        {petImage ? (
          <Image source={{ uri: petImage }} style={styles.petImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.imageText}>Add Pet Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {detectionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Detected: {detectionResult.label} (Confidence: {(detectionResult.confidence * 100).toFixed(2)}%)
          </Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pet Name"
          placeholderTextColor={theme.colors.textSecondary}
          value={petName}
          onChangeText={setPetName}
        />
        <TextInput
          style={styles.input}
          placeholder="Pet Type (e.g., Dog, Cat)"
          placeholderTextColor={theme.colors.textSecondary}
          value={petType}
          onChangeText={setPetType}
        />
        <TextInput
          style={styles.input}
          placeholder="Breed (if applicable)"
          placeholderTextColor={theme.colors.textSecondary}
          value={petBreed}
          onChangeText={setPetBreed}
        />
        <TextInput
          style={styles.input}
          placeholder="Owner Contact Number"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          value={ownerContact}
          onChangeText={setOwnerContact}
        />
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegisterPet}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
        <Text style={styles.registerButtonText}>Register Pet</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isProcessing ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <Ionicons name="alert-circle-outline" size={50} color={theme.colors.primary} />
            )}
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            {!isProcessing && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: theme.colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resultContainer: {
    backgroundColor: theme.colors.lightBlueAccent,
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.highlight,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: theme.colors.lightGrey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF', // White modal container
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalMessage: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
