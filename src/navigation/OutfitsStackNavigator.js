import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { OutfitsHomeScreen } from '../screens/outfits/OutfitsHomeScreen';
import { MixMatchSelectionScreen } from '../screens/outfits/MixMatchSelectionScreen';
import { MixMatchResultScreen } from '../screens/outfits/MixMatchResultScreen';
import { WeatherStylingScreen } from '../screens/outfits/WeatherStylingScreen';
import { WeatherStylingResultScreen } from '../screens/outfits/WeatherStylingResultScreen';
import { OccasionStylingScreen } from '../screens/outfits/OccasionStylingScreen';
import { OccasionStylingResultScreen } from '../screens/outfits/OccasionStylingResultScreen';
import { ColorMatchingSelectionScreen } from '../screens/outfits/ColorMatchingSelectionScreen';
import { ColorMatchingSuggestionsScreen } from '../screens/outfits/ColorMatchingSuggestionsScreen';
import { ColorMatchingResultScreen } from '../screens/outfits/ColorMatchingResultScreen';
import { OutfitDetailsScreen } from '../screens/outfits/OutfitDetailsScreen';
import { InspirationScreen } from '../screens/outfits/InspirationScreen';
import { InspirationGalleryScreen } from '../screens/outfits/InspirationGalleryScreen';

const Stack = createNativeStackNavigator();

export const OutfitsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OutfitsHome" component={OutfitsHomeScreen} />
      <Stack.Screen name="MixMatchSelection" component={MixMatchSelectionScreen} />
      <Stack.Screen name="MixMatchResult" component={MixMatchResultScreen} />
      <Stack.Screen name="WeatherStyling" component={WeatherStylingScreen} />
      <Stack.Screen name="WeatherStylingResult" component={WeatherStylingResultScreen} />
      <Stack.Screen name="OccasionStyling" component={OccasionStylingScreen} />
      <Stack.Screen name="OccasionStylingResult" component={OccasionStylingResultScreen} />
      <Stack.Screen name="ColorMatchingSelection" component={ColorMatchingSelectionScreen} />
      <Stack.Screen name="ColorMatchingSuggestions" component={ColorMatchingSuggestionsScreen} />
      <Stack.Screen name="ColorMatchingResult" component={ColorMatchingResultScreen} />
      <Stack.Screen name="OutfitDetails" component={OutfitDetailsScreen} />
      <Stack.Screen name="Inspiration" component={InspirationScreen} />
      <Stack.Screen name="InspirationGallery" component={InspirationGalleryScreen} />
    </Stack.Navigator>
  );
};
