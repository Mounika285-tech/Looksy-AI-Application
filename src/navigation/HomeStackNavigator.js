import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { WeatherDetailsScreen } from '../screens/home/WeatherDetailsScreen';
import { TodaysOutfitScreen } from '../screens/home/TodaysOutfitScreen';
import { RecentUploadsScreen } from '../screens/home/RecentUploadsScreen';
import { AISuggestionsScreen } from '../screens/home/AISuggestionsScreen';
import { ProfileScreen } from '../screens/personalization/ProfileScreen';

const Stack = createNativeStackNavigator();

export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard" component={HomeScreen} />
      <Stack.Screen name="WeatherDetails" component={WeatherDetailsScreen} />
      <Stack.Screen name="TodaysOutfit" component={TodaysOutfitScreen} />
      <Stack.Screen name="RecentUploads" component={RecentUploadsScreen} />
      <Stack.Screen name="AISuggestions" component={AISuggestionsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
