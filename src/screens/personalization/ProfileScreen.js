import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { optimizeImage, uploadToCloudinary } from '../../utils/imageHelper';
import { Feather } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation }) => {
  const { profile, updateProfile, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [gender, setGender] = useState(profile?.gender || 'Female');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age ? String(profile.age) : '');
      setGender(profile.gender || 'Female');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant photo library access to upload a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    if (!age.trim()) {
      Alert.alert('Validation Error', 'Please enter your age.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      Alert.alert('Validation Error', 'Please enter a valid age.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        age: parsedAge,
        gender,
        avatarUrl,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile details:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(profile?.name || '');
    setAge(profile?.age ? String(profile.age) : '');
    setGender(profile?.gender || 'Female');
    setAvatarUrl(profile?.avatarUrl || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of Looksy AI?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              console.error('Error logging out:', e);
              Alert.alert('Error', 'Could not complete sign out.');
            }
          },
        },
      ]
    );
  };

  const genders = ['Female', 'Male', 'Prefer not to say'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (isEditing ? handleCancelEdit() : navigation.goBack())}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name={isEditing ? 'x' : 'arrow-left'} size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'Profile'}</Text>
        {!isEditing ? (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Group */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            disabled={!isEditing}
            onPress={handlePickImage}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {name ? name[0].toUpperCase() : 'S'}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.cameraOverlay}>
                <Feather name="camera" size={18} color={colors.white} />
              </View>
            )}
            {isUploading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <View style={styles.infoWrapper}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconCell}>
                  <Feather name="user" size={18} color={colors.primary} />
                </View>
                <View style={styles.valueCell}>
                  <Text style={styles.cellLabel}>Full Name</Text>
                  <Text style={styles.cellValue}>{profile?.name || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCell}>
                  <Feather name="calendar" size={18} color={colors.primary} />
                </View>
                <View style={styles.valueCell}>
                  <Text style={styles.cellLabel}>Age</Text>
                  <Text style={styles.cellValue}>
                    {profile?.age ? `${profile.age} years old` : 'Not provided'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCell}>
                  <Feather name="smile" size={18} color={colors.primary} />
                </View>
                <View style={styles.valueCell}>
                  <Text style={styles.cellLabel}>Gender</Text>
                  <Text style={styles.cellValue}>{profile?.gender || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCell}>
                  <Feather name="mail" size={18} color={colors.primary} />
                </View>
                <View style={styles.valueCell}>
                  <Text style={styles.cellLabel}>Email Address</Text>
                  <Text style={styles.cellValue}>{profile?.email || 'user@looksy.ai'}</Text>
                </View>
                <View style={styles.lockBadge}>
                  <Feather name="lock" size={13} color={colors.textSecondary} />
                </View>
              </View>
            </View>

            {/* View Mode Action Buttons */}
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.signOutSecondaryBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutSecondaryBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ================= EDIT MODE ================= */
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>

            {/* Gender Selection */}
            <Text style={styles.inputLabel}>Gender</Text>
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

            {/* Locked Email view */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address (Read-only)</Text>
              <View style={styles.lockedEmailContainer}>
                <Text style={styles.lockedEmailText}>{profile?.email || 'user@looksy.ai'}</Text>
                <Feather name="lock" size={14} color={colors.textSecondary} />
              </View>
            </View>

            {/* Edit Mode Buttons */}
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={styles.saveBtn}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancelEdit}
              style={styles.cancelBtn}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
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
  logoutBtn: {
    padding: 8,
  },
  placeholder: {
    width: 36,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 10,
  },
  infoWrapper: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 8,
    marginBottom: 28,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  iconCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 16,
  },
  valueCell: {
    flex: 1,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  lockBadge: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72,
  },
  editBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  signOutSecondaryBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  signOutSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  lockedEmailContainer: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockedEmailText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    height: 44,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  saveBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  cancelBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
