import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { optimizeImage, uploadToCloudinary } from '../../utils/imageHelper';
import { Feather } from '@expo/vector-icons';

export const UploadOptionsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const processImageAndNavigate = async (localUri) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Optimizing image...');
      
      // Optimize image
      const optimized = await optimizeImage(localUri);
      
      setLoadingMessage('Uploading to cloud...');
      
      // Upload to Cloudinary
      const secureUrl = await uploadToCloudinary(optimized.uri);
      
      setIsLoading(false);
      
      // Navigate to AI scanning with the uploaded image URL
      navigation.navigate('AIScanning', { imageUrl: secureUrl });
    } catch (error) {
      console.error('Error processing upload:', error);
      Alert.alert('Upload Error', 'Failed to process and upload image. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant camera access to photograph your wardrobe items.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processImageAndNavigate(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      Alert.alert('Camera Error', 'Could not open the system camera.');
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant photo library access to upload a wardrobe photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processImageAndNavigate(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Gallery Error', 'Could not access the system photo library.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Wardrobe Item</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>{loadingMessage}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Digitize Your Clothes</Text>
          <Text style={styles.subtitle}>
            Upload a clear photo of an individual clothing item. AI will analyze the category, color, and recommend styling rules.
          </Text>

          {/* Camera Option Card */}
          <TouchableOpacity
            onPress={handleLaunchCamera}
            activeOpacity={0.8}
            style={styles.optionCard}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="camera" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Take a Photo</Text>
              <Text style={styles.cardDesc}>Use your camera to snap a photo of an item against a neutral background.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Gallery Option Card */}
          <TouchableOpacity
            onPress={handleLaunchGallery}
            activeOpacity={0.8}
            style={[styles.optionCard, styles.galleryCard]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="image" size={32} color={colors.text} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Choose from Gallery</Text>
              <Text style={styles.cardDesc}>Select a pre-existing clean photo from your device's photo library.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  galleryCard: {
    // Styling alt
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
