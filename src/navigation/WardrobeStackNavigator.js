import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { WardrobeGridScreen } from '../screens/wardrobe/WardrobeGridScreen';
import { UploadOptionsScreen } from '../screens/wardrobe/UploadOptionsScreen';
import { AIScanningScreen } from '../screens/wardrobe/AIScanningScreen';
import { AIDetectionResultsScreen } from '../screens/wardrobe/AIDetectionResultsScreen';
import { EditDetailsScreen } from '../screens/wardrobe/EditDetailsScreen';
import { ItemDetailsScreen } from '../screens/wardrobe/ItemDetailsScreen';

const Stack = createNativeStackNavigator();

export const WardrobeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WardrobeGrid" component={WardrobeGridScreen} />
      <Stack.Screen name="UploadOptions" component={UploadOptionsScreen} />
      <Stack.Screen name="AIScanning" component={AIScanningScreen} />
      <Stack.Screen name="AIDetectionResults" component={AIDetectionResultsScreen} />
      <Stack.Screen name="EditDetails" component={EditDetailsScreen} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
    </Stack.Navigator>
  );
};
