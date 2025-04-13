import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Dimensions, View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import FeedScreen from '../screens/FeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RegisterPetScreen from '../screens/RegisterPet';
import SettingsScreen from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { NetworkProvider, useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomHeader() {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerContent}>
        {/* Left menu icon */}
        <TouchableOpacity onPress={openDrawer} style={styles.iconContainer}>
          <Ionicons name="menu" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        {/* Centered logo with text */}
        <View style={styles.centerContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../assets/NEWLOGO.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.logoText, {color: theme.colors.highlight, marginLeft: -60}]}>Stray</Text>
            <Text style={[styles.logoText, {color: '#506643', marginLeft: 0}]}>Safe</Text>
          </View>
        </View>

        {/* Right theme toggle button */}
        <TouchableOpacity onPress={toggleTheme} style={styles.iconContainer}>
          <Ionicons 
            name={themeMode === 'dark' ? 'sunny' : 'moon'} 
            size={24} 
            color={theme.colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeedStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedRegisterPet"
        component={RegisterPetScreen}
        options={{ header: () => <CustomHeader /> }}
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
        options={{ header: () => <CustomHeader /> }}
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
        options={{ header: () => <CustomHeader /> }}
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
        options={{ header: () => <CustomHeader /> }}
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
        options={{ header: () => <CustomHeader /> }}
      />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ header: () => <CustomHeader /> }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { theme } = useTheme();
  
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
          } else if (route.name === 'RegisterPet') {
            iconName = 'paw';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.activeTab,
        tabBarInactiveTintColor: theme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: theme.colors.primary,
          borderTopWidth: 0,
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
        name="Map"
        component={MapStackNavigator}
        options={{ tabBarLabel: 'Map', headerShown: false }}
      />
      <Tab.Screen
        name="RegisterPet"
        component={FeedStackNavigator}
        options={{ tabBarLabel: 'Register', headerShown: false }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
        options={{ tabBarLabel: 'Notifications', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ 
          tabBarLabel: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          )
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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
          name="Settings"
          component={SettingsScreen}
          options={{
            drawerLabel: 'Settings',
            header: () => <CustomHeader />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Logout"
          component={FeedScreen}
          options={{
            drawerLabel: () => (
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            ),
            drawerIcon: ({ color, size }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.primary,
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 16,
    height: 80,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 60,
    marginLeft: -60,
    margin: 0,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  networkBanner: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  networkBannerText: {
    color: '#FFF',
    marginLeft: 6,
    fontSize: 14,
  },
});