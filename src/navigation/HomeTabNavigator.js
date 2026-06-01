import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStackNavigator } from './HomeStackNavigator';
import { WardrobeStackNavigator } from './WardrobeStackNavigator';
import { OutfitsStackNavigator } from './OutfitsStackNavigator';
import { PlannerStackNavigator } from './PlannerStackNavigator';
import { FavoritesStackNavigator } from './FavoritesStackNavigator';
import { colors } from '../theme/colors';
import { Feather } from '@expo/vector-icons';

// Mock Screens for future modules
const MockUploadScreen = () => (
  <View style={styles.mockContainer}>
    <View style={styles.iconCircle}>
      <Feather name="plus-circle" size={32} color={colors.primary} />
    </View>
    <Text style={styles.mockTitle}>Upload Items (Module 4)</Text>
    <Text style={styles.mockSubtitle}>Upload wardrobe items and automatically detect categories using AI.</Text>
  </View>
);

const MockOutfitsScreen = () => (
  <View style={styles.mockContainer}>
    <View style={styles.iconCircle}>
      <Feather name="layers" size={32} color={colors.primary} />
    </View>
    <Text style={styles.mockTitle}>Outfits Generator (Module 5)</Text>
    <Text style={styles.mockSubtitle}>Mix & Match items, get weather and occasion styling recommendations.</Text>
  </View>
);

const MockPlannerScreen = () => (
  <View style={styles.mockContainer}>
    <View style={styles.iconCircle}>
      <Feather name="calendar" size={32} color={colors.primary} />
    </View>
    <Text style={styles.mockTitle}>Outfit Planner (Module 6)</Text>
    <Text style={styles.mockSubtitle}>Plan your outfits ahead of time with calendar and weather assistant integration.</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const HomeTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'WardrobeTab') {
            iconName = 'plus-circle';
          } else if (route.name === 'OutfitsTab') {
            iconName = 'layers';
          } else if (route.name === 'PlannerTab') {
            iconName = 'calendar';
          } else if (route.name === 'FavoritesTab') {
            iconName = 'heart';
          }

          return <Feather name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeStackNavigator}
        options={{ tabBarLabel: 'Wardrobe' }}
      />
      <Tab.Screen
        name="OutfitsTab"
        component={OutfitsStackNavigator}
        options={{ tabBarLabel: 'Outfits' }}
      />
      <Tab.Screen
        name="PlannerTab"
        component={PlannerStackNavigator}
        options={{ tabBarLabel: 'Planner' }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStackNavigator}
        options={{ tabBarLabel: 'Favorites' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  mockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mockTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  mockSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
