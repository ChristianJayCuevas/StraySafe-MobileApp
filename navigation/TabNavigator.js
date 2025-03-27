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
            <Image
              source={require('../assets/LOGO.png')}
              style={styles.logoImage}
            />
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
        name="Feed"
        component={FeedScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="ReportPet"
        component={ReportPetScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="RegisterPet"
        component={RegisterPetScreen}
        options={{
          title: 'Register Your Pet',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#FFF',
        }}
      />
      <Stack.Screen
        name="MapPickerScreen"
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
        name="Notifications"
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
        name="Map"
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
        name="Dashboard"
        component={DashboardScreen}
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

export default function DrawerNavigator() {
  return (
    <NetworkProvider>
      <NetworkAwareApp />
    </NetworkProvider>
  );
}

function NetworkAwareApp() {
  const { isConnected } = useNetwork();

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
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            drawerLabel: 'Profile',
            header: () => <CustomHeader />,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: 40,
    resizeMode: 'contain',
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
});
