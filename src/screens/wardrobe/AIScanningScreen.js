import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { analyzeGarmentImage } from '../../utils/geminiService';

const { width, height } = Dimensions.get('window');

export const AIScanningScreen = ({ navigation, route }) => {
  const { imageUrl } = route.params;
  
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Laser Line Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Run real-time Gemini Multimodal scanning
    const runScan = async () => {
      try {
        const result = await analyzeGarmentImage(imageUrl);
        navigation.replace('AIDetectionResults', { imageUrl, editedData: result });
      } catch (err) {
        console.error("AI scanning error:", err);
        Alert.alert(
          "AI Scanning Notification", 
          `Looksy encountered a connection or endpoint challenge: ${err.message || err}. Reverting to standard high-fidelity fallbacks for custom review.`,
          [{ text: "Continue", onPress: () => navigation.replace('AIDetectionResults', { imageUrl }) }]
        );
      }
    };
    
    // Add small visual delay so scanning animation shows premium micro-interactions
    const timer = setTimeout(runScan, 1800);
    return () => clearTimeout(timer);
  }, []);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Height of image container
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.title, { opacity: pulseAnim }]}>
          Scanning Wardrobe Item...
        </Animated.Text>
        <Text style={styles.subtitle}>
          LookSy AI is analyzing fabric texture, item category, color values, and patterns.
        </Text>

        {/* Scan Area Frame */}
        <View style={styles.scanFrame}>
          <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
          {/* Pulsing overlay */}
          <View style={styles.overlay} />
          {/* Animated Scanning Laser */}
          <Animated.View style={[styles.laser, { transform: [{ translateY }] }]} />
        </View>

        <Text style={styles.percentageText}>Running computer vision classifiers...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  scanFrame: {
    width: 240,
    height: 300,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 32,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240, 90, 91, 0.05)',
  },
  laser: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
