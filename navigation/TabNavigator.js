import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Dimensions } from 'react-native';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import FeedScreen from '../screens/FeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ReportPetScreen from '../screens/ReportPetScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import RegisterPetScreen from '../screens/RegisterPet'; // New RegisterPet screen
import SettingsScreen from '../screens/SettingsScreen'; // New Settings screen
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { NetworkProvider, useNetwork } from '../context/NetworkContext'; // Import the network provider
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomHeader() {
  const navigation = useNavigation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearchToggle = () => {
    setIsSearching(!isSearching);
    setSearchText('');
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Dog Icon (Drawer Trigger) */}
        <TouchableOpacity onPress={openDrawer} style={styles.iconContainer}>
        <Ionicons name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Logo or Search Bar */}
        <View style={styles.logoContainer}>
          {isSearching ? (
            <View style={styles.searchBarContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.textPrimary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              <TouchableOpacity onPress={handleSearchToggle} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/StraySafeLogo.png')}
                style={styles.logoImage}
              />
              <View style={styles.logoTextContainer}>
                <Text style={styles.customText}>Stray</Text>
                <Text style={[styles.customColor]}>Safe</Text>
              </View>
            </View>
          )}
        </View>

        {/* Search Icon */}
        {!isSearching && (
          <TouchableOpacity style={styles.iconContainer} onPress={handleSearchToggle}>
            <Ionicons name="search-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function FeedStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedMain"
        component={FeedScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="FeedDetails"
        component={DetailsScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="FeedReportPet"
        component={ReportPetScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="FeedRegisterPet"
        component={RegisterPetScreen}
        options={{
          title: 'Register Your Pet',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#FFF',
        }}
      />
      <Stack.Screen
        name="FeedMapPicker"
        component={MapPickerScreen}
        options={{
          title: 'Pick a Location',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#FFF',
        }}
      />
    </Stack.Navigator>
  );
}

function NotificationsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotificationsMain"
        component={NotificationsScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapMain"
        component={MapScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
}

function DashboardStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Feed') {
            iconName = 'paw';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Dashboard') {
            iconName = 'analytics';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.highlight,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedStackNavigator}
        options={{
          tabBarLabel: 'Feed',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{
          tabBarLabel: 'Map',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
        options={{
          tabBarLabel: 'Notifications',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default function DrawerNavigator({ onLogout }) {
  return (
    <NetworkProvider>
      <NetworkAwareApp onLogout={onLogout} />
    </NetworkProvider>
  );
}

function NetworkAwareApp({ onLogout }) {
  const { isConnected } = useNetwork();
  const navigation = useNavigation();

  // Function to handle logout
  const handleLogout = () => {
    if (onLogout) {
      // Just call the onLogout function from App.js
      // The App.js component will handle changing the auth state
      // which will automatically switch to the login stack
      onLogout();
      
      // No need to navigate manually
      // Use DrawerActions to close the drawer
      navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Network Banner */}
      {/* {!isConnected && (
        <View style={styles.networkBanner}>
          <Ionicons name="alert-circle-outline" size={20} color="#FFF" />
          <Text style={styles.networkBannerText}>No Internet Connection</Text>
        </View>
      )} */}
      {/* Drawer Navigation */}
      <Drawer.Navigator
        screenOptions={{
          drawerPosition: 'left',
          drawerType: 'slide',
          drawerStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Drawer.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{
            drawerLabel: 'Home',
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            drawerLabel: 'Profile',
            header: () => <CustomHeader />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="SettingsStack"
          component={SettingsStackNavigator}
          options={{
            drawerLabel: 'Settings',
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
        {/* Add Logout option at the bottom of the drawer */}
        <Drawer.Screen
          name="Logout"
          component={() => <View />} // Empty component as we'll handle logout via an event
          listeners={{
            drawerItemPress: (e) => {
              // Prevent default action (navigation)
              e.preventDefault();
              // Call logout function
              handleLogout();
            }
          }}
          options={{
            drawerLabel: () => (
              <View style={styles.logoutSection}>
                <View style={styles.separator} />
                <Text style={styles.logoutText}>Logout</Text>
              </View>
            ),
            drawerIcon: ({ size }) => (
              <Ionicons name="log-out-outline" size={size} color="#FF4D4F" />
            ),
          }}
        />
      </Drawer.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  networkBanner: {
    position: 'absolute',
    bottom: Dimensions.get('window').height - 80, // Adjust this value to position the banner
    left: 0,
    right: 0,
    zIndex: 999, // Ensure it appears above all other components
    backgroundColor: 'red',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkBannerText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'column',
    height: 100,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  iconContainer: {
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: 40,
    resizeMode: 'contain',
  },
  logoTextContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  customText: {
    color: '#2C2C2C',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
  },
  customColor: {
    color: '#4f6642',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: theme.colors.textPrimary,
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  logoutSection: {
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 15,
    marginTop: 5,
    width: '100%',
  },
  logoutText: {
    color: '#FF4D4F',
    fontSize: 16,
  },
});
