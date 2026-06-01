import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { optimizeImage, uploadToCloudinary } from '../../utils/imageHelper';
import { Feather } from '@expo/vector-icons';

export const ProfileSetupScreen = ({ navigation }) => {
  const { profile, logout } = useAuth();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female'); // Default or none
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  
  // Pre-populate name if exists in profile
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out and return to the login screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Error signing out:', err);
            }
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant photo library access to upload a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const localUri = result.assets[0].uri;
        
        // Optimize image
        const optimized = await optimizeImage(localUri);
        
        // Upload to Cloudinary
        const secureUrl = await uploadToCloudinary(optimized.uri);
        setAvatarUrl(secureUrl);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    let isValid = true;
    setNameError('');
    setAgeError('');

    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }

    if (!age.trim()) {
      setAgeError('Age is required');
      isValid = false;
    } else {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
        setAgeError('Please enter a valid age');
        isValid = false;
      }
    }

    if (!isValid) return;

    navigation.navigate('StylePreference', {
      profileInfo: {
        name: name.trim(),
        age: parseInt(age, 10),
        gender,
        avatarUrl,
      },
    });
  };

  const genders = ['Female', 'Male', 'Prefer not to say'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1 of 3: Profile Setup</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.7}>
          <Feather name="log-out" size={18} color={colors.primary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Let's create your profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself to personalize your experience.</Text>
        </View>

        {/* Avatar Upload */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="camera" size={28} color={colors.textSecondary} />
              </View>
            )}
            {isUploading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
            <Text style={styles.avatarLabel}>{avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}</Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            error={nameError}
            autoCapitalize="words"
          />

          <Input
            label="Age"
            placeholder="Enter your age"
            value={age}
            onChangeText={(text) => {
              setAge(text);
              setAgeError('');
            }}
            error={ageError}
            keyboardType="number-pad"
          />

          {/* Gender selection */}
          <Text style={styles.genderLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {genders.map((g) => {
              const isSelected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                  style={[
                    styles.genderButton,
                    isSelected && styles.genderButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      isSelected && styles.genderButtonTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Next Step"
            variant="primary"
            onPress={handleNext}
            style={styles.nextBtn}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  form: {
    width: '100%',
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingLeft: 4,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  genderButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  nextBtn: {
    marginTop: 8,
  },
});
