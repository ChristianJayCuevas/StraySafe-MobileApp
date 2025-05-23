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
import { LinearGradient } from 'expo-linear-gradient';
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
        analyzeImage(pickerResult.assets[0].uri);
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
        analyzeImage(pickerResult.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while taking a photo.');
      console.error('Camera Error:', error);
    }
  };

  const analyzeImage = async (imageUri) => {
    setIsProcessing(true);
    setDetectionResult(null);
  
    try {
      const formData = new FormData();
      formData.append('username', user?.userData?.name); // assuming you use name as folder ID
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `pet_${Date.now()}.jpg`,
      });
  
      const response = await fetch('https://straysafe.me/api2/upload-pet-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const data = await response.json();
      console.log('Detection API response:', data);
  
      if (response.ok && data.status === 'success') {
        const { label, confidence, file_url } = data;
        setDetectionResult({ label, confidence, file_url }); // Store file_url in detectionResult
        setPetType(label); // Auto-fill Pet Type
      } else if (data.status === 'rejected') {
        Alert.alert('Low Confidence', data.message || 'Please upload a clearer image.');
        setPetImage(null);
        setDetectionResult(null);
      } else {
        Alert.alert('Error', data.message || 'Failed to classify the image.');
        setPetImage(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to classification service.');
      console.error('Image Upload Error:', error);
      setPetImage(null);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRegisterPet = async () => {
    if (isProcessing) {
      setModalMessage('Please wait for the verification of the photo.');
      setModalVisible(true);
      return;
    }
  
    if (!petName || !petType || !petBreed || !ownerContact || !petImage || !detectionResult) {
      setModalMessage('Please fill up all the input boxes and add a verified pet photo.');
      setModalVisible(true);
      return;
    }
  
    try {
      setModalMessage('Registering your pet...');
      setModalVisible(true);
  
      // Use the file_url from the detection API instead of uploading to Cloudinary
      const imageUrl = `https://straysafe.me${detectionResult.file_url}`;
  
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
<View style={styles.container}>
  <View style={styles.gradientBackground}>
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      style={styles.scrollView}
    >
      <Text style={styles.title}>Register Your Pet</Text>
      <View style={styles.imageWrapper}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleAddPhoto}>
          {petImage ? (
            <Image source={{ uri: petImage }} style={styles.petImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.imageText}>Add Pet Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {petImage && (
          <TouchableOpacity style={styles.addPhotoIcon} onPress={handleAddPhoto}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
      {detectionResult && (
        <LinearGradient
          colors={['#addfad', '#32cd32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.resultContainer}
        >
          <Text style={styles.resultText}>
            Detected: {detectionResult.label} (Confidence: 
              <Text style={{
                color: 'black',
                fontWeight: 'bold'
              }}>
                {(detectionResult.confidence * 100).toFixed(2)}%
              </Text>)
          </Text>
        </LinearGradient>
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
    </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradientBackground: {
    flex: 1,
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  imageContainer: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 5,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageWrapper: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  addPhotoIcon: {
    position: 'absolute',
    bottom: 40,
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
  resultContainer: {
    padding: 15,
    borderRadius: 10,
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  resultText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.highlight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 18,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalMessage: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  closeButton: {
    marginTop: 25,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});
