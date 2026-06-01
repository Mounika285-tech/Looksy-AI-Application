import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';

export const SetupCompleteScreen = ({ navigation, route }) => {
  const { personalizationData } = route.params;
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinishSetup = async () => {
    setIsLoading(true);
    try {
      // Save style preferences and set setupCompleted to true in Firebase Database
      await updateProfile({
        ...personalizationData,
        setupCompleted: true,
      });
      // The context change will automatically trigger navigation update to HomeTabs
    } catch (error) {
      console.error('Error saving personalization setup:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration / Success Icon */}
        <View style={styles.illustrationContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="check" size={50} color={colors.white} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.description}>
          Your personalization profile is complete. LookSy is ready to help you digitize your wardrobe and recommend smart outfits tailored specifically to you.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue to Home"
          variant="primary"
          onPress={handleFinishSetup}
          loading={isLoading}
          style={styles.btn}
        />
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
  illustrationContainer: {
    marginBottom: 40,
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
  },
});
