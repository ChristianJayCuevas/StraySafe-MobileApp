import React, { createContext, useContext, useState } from 'react';

// Create the PostContext
const PostContext = createContext();

// Initial posts data
const initialPosts = [
  {
    id: '1',
    image: require('../assets/missing1.png'),
    location: 'Scout Limbaga St.',
    likes: 12,
    comments: ['I saw this one too!'],
    shares: 1,
    type: 'missing',
    postContent: 'A missing dog reported near Scout Limbaga St.',
    contactNumber: '+63 912 345 6789',
  },
  {
    id: '2',
    image: require('../assets/stray4.jpg'),
    location: 'K-1st St.',
    likes: 5,
    comments: ['Looks well-fed!'],
    shares: 0,
    type: 'found',
    postContent: 'Found this cat wandering around K-1st St.',
    contactNumber: '+63 912 987 6543',
  },
  {
    id: '3',
    image: require('../assets/adopt1.png'),
    location: 'Adoption Center, City',
    likes: 8,
    comments: ['Hope it finds a home!'],
    shares: 3,
    type: 'forAdoption',
    postContent: 'This dog is available for adoption at the center.',
    contactNumber: '+63 912 456 7890',
  },
];

// Function to get the appropriate notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case 'missing':
      return require('../assets/missing.png'); // Replace with your missing icon
    case 'found':
      return require('../assets/found.png'); // Replace with your found icon
    case 'forAdoption':
      return require('../assets/adoption.png'); // Replace with your adoption icon
    default:
      return require('../assets/adoption.png'); // Fallback icon
  }
};

// PostProvider component to manage posts and notifications
export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [notifications, setNotifications] = useState([]); // Notifications state

  // Function to add a new post
  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);

    // Create a notification referencing the post
    const notification = {
      id: Date.now().toString(),
      title: `${newPost.type.charAt(0).toUpperCase() + newPost.type.slice(1)} Post Created`,
      description: `${newPost.location}: ${newPost.postContent || 'New post created!'}`,
      timestamp: new Date().toLocaleString(),
      icon: getNotificationIcon(newPost.type), // Use the specific icon based on the post type
      post: newPost, // Add a reference to the post
    };

    setNotifications((prevNotifications) => [notification, ...prevNotifications]);
  };

  // Provide the posts, notifications, and the addPost function to the context
  return (
    <PostContext.Provider value={{ posts, notifications, addPost }}>
      {children}
    </PostContext.Provider>
  );
};

// Custom hook to use the PostContext
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};
