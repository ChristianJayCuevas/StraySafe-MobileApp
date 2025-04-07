import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePostContext } from '../context/PostContext';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const { posts } = usePostContext(); // Access posts from the context
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('missing');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visibleComments, setVisibleComments] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Filter posts based on the selected tab
  const filteredPosts = posts.filter(
    (post) => post.type.toLowerCase() === selectedTab.toLowerCase()
  );

  const handleCommentToggle = (index) => {
    setVisibleComments(visibleComments === index ? null : index);
  };

  const handleAddComment = (index) => {
    if (newComment.trim()) {
      posts[index].comments.push(newComment);
      setNewComment('');
    }
  };

  const handleReportPetPress = () => {
    setIsModalVisible(true);
  };

  const handleOptionSelect = (type) => {
    setIsModalVisible(false);
    navigation.navigate('FeedReportPet', { type });
  };

  return (
    <View style={styles.container}>
      {/* Tabs for selecting categories */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('missing')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'missing' && styles.activeTabText,
            ]}
          >
            Missing
          </Text>
          {selectedTab === 'missing' && <View style={styles.activeTabLine} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('found')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'found' && styles.activeTabText,
            ]}
          >
            Found
          </Text>
          {selectedTab === 'found' && <View style={styles.activeTabLine} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('forAdoption')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'forAdoption' && styles.activeTabText,
            ]}
          >
            For Adoption
          </Text>
          {selectedTab === 'forAdoption' && (
            <View style={styles.activeTabLine} />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal for selecting post type */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Post Type</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleOptionSelect('missing')}
            >
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.modalButtonText}>Missing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleOptionSelect('found')}
            >
              <Ionicons
                name="paw-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.modalButtonText}>Found</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleOptionSelect('forAdoption')}
            >
              <Ionicons
                name="heart-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.modalButtonText}>For Adoption</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LinearGradient
        colors={[theme.colors.background, theme.colors.lightBlueAccent]}
        style={styles.gradientBackground}
      >
        {/* List of posts based on the selected tab */}
        <FlatList
          data={filteredPosts}
          renderItem={({ item, index }) => (
            <View style={styles.postContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('FeedDetails', {
                    image: item.image,
                    location: item.location?.address || 'No location provided',
                    likes: item.likes,
                    comments: item.comments,
                    shares: item.shares,
                    type: item.type,
                    contactNumber:
                      item.contactNumber || 'No contact number provided',
                    postContent: item.postContent || 'No content provided.',
                  })
                }
              >
                <View style={styles.petItem}>
                  {item.image && (
                    <Image source={item.image} style={styles.petImage} />
                  )}
                  <Text style={styles.locationBadge}>
                    {item.location?.address || 'No location provided'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.interactionContainer}>
                <TouchableOpacity
                  style={styles.interactionButton}
                  onPress={() => alert('Liked!')}
                >
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.interactionText}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.interactionButton}
                  onPress={() => handleCommentToggle(index)}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.interactionText}>
                    {item.comments.length}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.interactionButton}>
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.interactionText}>{item.shares}</Text>
                </TouchableOpacity>
              </View>

              {visibleComments === index && (
                <View style={styles.commentsSection}>
                  {item.comments.map((comment, commentIndex) => (
                    <Text key={commentIndex} style={styles.commentText}>
                      • {comment}
                    </Text>
                  ))}
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      placeholderTextColor={theme.colors.textSecondary}
                      value={newComment}
                      onChangeText={setNewComment}
                    />
                    <TouchableOpacity onPress={() => handleAddComment(index)}>
                      <Ionicons
                        name="send"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.petListVertical}
        />

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportPetPress}
          >
            <Ionicons
              name="location"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.reportButtonText}>Pin On Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('FeedRegisterPet')}
          >
            <Ionicons
              name="paw"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.registerButtonText}>Register Pet</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    color: '#FFF',
    fontSize: 16,
    paddingBottom: 5,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  activeTabLine: {
    height: 4,
    backgroundColor: '#FFF',
    width: '100%',
    position: 'absolute',
    bottom: -10,
    borderRadius: 10,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  petListVertical: {
    paddingVertical: 10,
  },
  postContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    elevation: 3,
  },
  petItem: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: width * 0.5,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: theme.colors.orangeAccent,
    padding: 5,
    borderRadius: 10,
    color: '#FFF',
    fontSize: 12,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    marginLeft: 5,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  commentsSection: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    color: theme.colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
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
});
