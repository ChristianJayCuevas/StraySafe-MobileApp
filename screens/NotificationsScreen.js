import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { theme } from '../theme';

export default function NotificationsScreen() {
  const navigation = useNavigation();

  // Initial mock notifications including pet detection
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Dog Detection',
      description: '3 dogs detected on Camera 5.',
      timestamp: '2 hours ago',
      icon: require('../assets/Snapshot1.jpg'),
      type: 'pet_detection',
      data: {
        cameraId: 'cam-5',
        animalType: 'dog',
        count: 5,
        newCount: 3,
      }
    },
    {
      id: '2',
      title: 'Cat Detection',
      description: '2 cats detected on Static Demo camera.',
      timestamp: '3 hours ago',
      icon: require('../assets/Snapshot5.png'),
      type: 'pet_detection',
      data: {
        cameraId: 'static-demo',
        animalType: 'cat',
        count: 2,
        newCount: 2,
      }
    },
    {
      id: '3',
      title: 'Stray Dog Sighting',
      description: 'A stray dog was sighted near the Limbaga Street.',
      timestamp: '4 hours ago',
      icon: require('../assets/Snapshot5.png'),
      type: 'pet_report',
      post: {
        image: require('../assets/Snapshot5.png'),
        location: 'Limbaga Street',
        likes: 10,
        comments: 2,
        shares: 1,
        type: 'Stray Dog',
        contactNumber: 'None',
        postContent: 'This dog is found near the Limbaga Street.',
      },
    }
  ]);

  useEffect(() => {
    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const notificationData = notification.request.content.data;
      const title = notification.request.content.title;
      const body = notification.request.content.body;
      
      // Create a new notification object
      const newNotification = {
        id: Date.now().toString(),
        title: title || 'New Notification',
        description: body || '',
        timestamp: 'Just now',
        type: notificationData.type || 'unknown',
        icon: getIconForNotificationType(notificationData.type, notificationData.animalType),
        data: notificationData
      };

      // Add the new notification to the list
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    });

    // Cleanup listener on unmount
    return () => subscription.remove();
  }, []);
  
  // Get the appropriate icon based on notification type
  const getIconForNotificationType = (type, animalType) => {
    if (type === 'pet_detection') {
      if (animalType === 'dog') {
        return require('../assets/Snapshot1.jpg');
      } else if (animalType === 'cat') {
        return require('../assets/Snapshot4.png');
      }
    }
    
    // Default icon
    return require('../assets/icon.png');
  };

  const handleNotificationClick = (item) => {
    if (item.type === 'pet_detection') {
      // For pet detection, just show an alert with the details
      alert(`${item.data.animalType.charAt(0).toUpperCase() + item.data.animalType.slice(1)} Detection
Camera: ${item.data.cameraId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
New count: ${item.data.newCount}
Total count: ${item.data.count}`);
    } 
    else if (item.type === 'pet_report' && item.post) {
      // For post-related notifications, navigate to Details
      navigation.navigate('Details', {
        image: item.post.image,
        location: item.post.location,
        likes: item.post.likes,
        comments: item.post.comments,
        shares: item.post.shares,
        type: item.post.type,
        contactNumber: item.post.contactNumber || 'No contact number provided',
        postContent: item.post.postContent || 'No content provided.',
      });
    }
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
    </View>
  );
}

const styles = StyleSheet.create({
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
