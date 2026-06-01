import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { FavoritesHomeScreen } from '../screens/favorites/FavoritesHomeScreen';
import { SavedOutfitsScreen } from '../screens/favorites/SavedOutfitsScreen';
import { SavedItemsScreen } from '../screens/favorites/SavedItemsScreen';
import { FavoriteOutfitDetailsScreen } from '../screens/favorites/FavoriteOutfitDetailsScreen';
import { ProfileScreen } from '../screens/personalization/ProfileScreen';

const Stack = createNativeStackNavigator();

export const FavoritesStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesHome" component={FavoritesHomeScreen} />
      <Stack.Screen name="SavedOutfits" component={SavedOutfitsScreen} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="FavoriteOutfitDetails" component={FavoriteOutfitDetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
