import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { theme } from '../theme';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [notifications, setNotifications] = useState([]);


  useEffect(() => {
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const response = await fetch('https://straysafe.me/api2/detected');
        const data = await response.json();

        // Check if data.detected_animals is an array
        if (!data.detected_animals || !Array.isArray(data.detected_animals)) {
          console.error('API response does not contain detected_animals array:', data);
          setNotifications([]);
          return;
        }

        // Map API data to notification objects
        const mappedNotifications = data.detected_animals.map((item) => {
          let icon;
          if (item.image_url) {
            icon = { uri: 'https://straysafe.me/api2/debug-img' + item.image_url.substring('/api2/detected-img'.length) };
          } else if (item.animal_type === 'dog') {
            icon = require('../assets/Snapshot1.jpg');
          } else if (item.animal_type === 'cat') {
            icon = require('../assets/Snapshot4.png');
          } else {
            icon = require('../assets/icon.png');
          }

          return {
            id: item.id ? item.id.toString() : Date.now().toString(),
            title: 'Animal Detected',
            description: `Classification: ${item.classification}`,
            timestamp: item.timestamp || '',
            type: 'pet_detection',
            icon: icon,
            data: {
              animalType: item.animal_type,
              cameraId: item.stream_id,
              newCount: null,
              count: null,
            },
            post: null,
          };
        });

        setNotifications(mappedNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000); // fetch every 10 seconds

    return () => clearInterval(intervalId);
  }, []);
  

  const handleNotificationClick = (item) => {
    setSelectedNotification(item);
  };

  const renderNotificationDetails = () => {
    if (!selectedNotification) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <Image 
          source={selectedNotification.icon} 
          style={styles.detailsIcon} 
        />
        <Text style={styles.detailsTitle}>{selectedNotification.title}</Text>
        <Text style={styles.detailsDescription}>{selectedNotification.description}</Text>
        <Text style={styles.detailsTimestamp}>{selectedNotification.timestamp}</Text>
        
        {selectedNotification.type === 'pet_detection' && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSubtitle}>Detection Details:</Text>
            <Text>Animal: {selectedNotification.data.animalType}</Text>
            <Text>Camera: {selectedNotification.data.cameraId}</Text>
            <Text>New Count: {selectedNotification.data.newCount}</Text>
            <Text>Total Count: {selectedNotification.data.count}</Text>
          </View>
        )}
        
        {selectedNotification.type === 'pet_report' && selectedNotification.post && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSubtitle}>Report Details:</Text>
            <Text>Location: {selectedNotification.post.location}</Text>
            <Text>Type: {selectedNotification.post.type}</Text>
            <Text>Contact: {selectedNotification.post.contactNumber || 'None'}</Text>
            <Text>Likes: {selectedNotification.post.likes}</Text>
            <Text>Comments: {selectedNotification.post.comments}</Text>
            <Text>Shares: {selectedNotification.post.shares}</Text>
            <Text>Content: {selectedNotification.post.postContent}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => handleNotificationClick(item)}
    >
      <Image source={item.icon} style={styles.notificationIcon} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
        <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
      </View>
      <Ionicons name="arrow-forward-outline" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <Modal
        visible={!!selectedNotification}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {renderNotificationDetails()}
            </ScrollView>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedNotification(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 10,
  },
  detailsIcon: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom: 15,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: theme.colors.textPrimary,
  },
  detailsDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: theme.colors.textSecondary,
  },
  detailsTimestamp: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: theme.colors.textSecondary,
  },
  detailsSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: theme.colors.textPrimary,
  },
  detailsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
