import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme'; // Import your theme for consistent styling

export default function DetailsScreen({ route }) {
  const {
    image,
    location,
    likes,
    comments,
    shares,
    type,
    contactNumber,
    postContent,
  } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
        <Text style={styles.postType}>{type?.toUpperCase()}</Text>
      </View>

      {/* Content Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.postContent}>
          {postContent || 'No content provided.'}
        </Text>
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.detailText}>{location || 'No location provided'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="call-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.detailText}>
            {contactNumber || 'No contact number provided'}
          </Text>
        </View>
      </View>

      {/* Interactions Section */}
      <View style={styles.interactionsContainer}>
        <Text style={styles.text}>Likes: {likes}</Text>
        <Text style={styles.text}>Shares: {shares}</Text>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {comments?.length ? (
          comments.map((comment, index) => (
            <Text key={index} style={styles.comment}>
              - {comment}
            </Text>
          ))
        ) : (
          <Text style={styles.noCommentsText}>No comments yet.</Text>
        )}
      </View>

      {/* Call to Action */}
      <TouchableOpacity style={styles.contactButton}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={20}
          color="#FFF"
          style={styles.contactIcon}
        />
        <Text style={styles.contactButtonText}>Contact Poster</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  postType: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: theme.colors.primary,
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.highlight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  interactionsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.highlight,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  commentsContainer: {
    padding: 20,
  },
  comment: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  noCommentsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    margin: 20,
    borderRadius: 30,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  contactIcon: {
    marginRight: 5,
  },
});
