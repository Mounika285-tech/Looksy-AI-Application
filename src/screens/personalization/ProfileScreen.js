import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation }) => {
  const { profile, updateProfile, logout } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [selectedStyles, setSelectedStyles] = useState(profile?.stylePreferences || []);
  const [selectedColors, setSelectedColors] = useState(profile?.preferredColors || []);
  const [isSaving, setIsSaving] = useState(false);

  const stylesList = [
    { id: 'casual', label: 'Casual', icon: 'smile' },
    { id: 'formal', label: 'Formal', icon: 'briefcase' },
    { id: 'streetwear', label: 'Streetwear', icon: 'zap' },
    { id: 'traditional', label: 'Traditional', icon: 'image' },
    { id: 'minimalist', label: 'Minimalist', icon: 'minus-circle' },
    { id: 'sporty', label: 'Sporty', icon: 'heart' },
  ];

  const colorsList = [
    { id: 'charcoal', hex: '#2C2A29', label: 'Charcoal' },
    { id: 'white', hex: '#FFFFFF', label: 'White', border: true },
    { id: 'beige', hex: '#F5EFEB', label: 'Beige' },
    { id: 'blush', hex: '#F8DCCB', label: 'Blush' },
    { id: 'coral', hex: '#F05A5B', label: 'Coral' },
    { id: 'navy', hex: '#2B4C7E', label: 'Navy' },
    { id: 'olive', hex: '#556B2F', label: 'Olive' },
    { id: 'lavender', hex: '#D8BFD8', label: 'Lavender' },
  ];

  const handleToggleStyle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleToggleColor = (colorId) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((id) => id !== colorId)
        : [...prev, colorId]
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        stylePreferences: selectedStyles,
        preferredColors: selectedColors,
      });
      Alert.alert('Success', 'Profile updated successfully in real-time!');
    } catch (error) {
      console.error('Error saving profile details:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Group */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {name ? name[0].toUpperCase() : 'S'}
            </Text>
          </View>
          <Text style={styles.userEmail}>{profile?.email || 'user@looksy.ai'}</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Style Tag Selection */}
        <Text style={styles.sectionTitle}>Style Aesthetics</Text>
        <View style={styles.styleGrid}>
          {stylesList.map((style) => {
            const isSelected = selectedStyles.includes(style.id);
            return (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleToggleStyle(style.id)}
                activeOpacity={0.8}
                style={[
                  styles.styleCard,
                  isSelected && styles.styleCardActive,
                ]}
              >
                <Feather
                  name={style.icon}
                  size={16}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={styles.styleIcon}
                />
                <Text
                  style={[
                    styles.styleLabel,
                    isSelected && styles.styleLabelActive,
                  ]}
                >
                  {style.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Feather name="check" size={8} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Color Palette Selector */}
        <Text style={styles.sectionTitle}>Preferred Colors</Text>
        <View style={styles.colorsContainer}>
          {colorsList.map((color) => {
            const isSelected = selectedColors.includes(color.id);
            return (
              <TouchableOpacity
                key={color.id}
                onPress={() => handleToggleColor(color.id)}
                activeOpacity={0.8}
                style={styles.colorBubbleWrapper}
              >
                <View
                  style={[
                    styles.colorBubble,
                    { backgroundColor: color.hex },
                    color.border && { borderWidth: 1, borderColor: colors.border },
                    isSelected && styles.colorBubbleActive,
                  ]}
                >
                  {isSelected && (
                    <Feather
                      name="check"
                      size={14}
                      color={
                        color.id === 'white' || color.id === 'beige' || color.id === 'blush'
                          ? colors.text
                          : colors.white
                      }
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.colorBubbleLabel,
                    isSelected && styles.colorBubbleLabelActive,
                  ]}
                >
                  {color.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveProfile}
          style={styles.saveBtn}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  styleCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    height: 72,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  styleCardActive: {
    borderColor: colors.accentDark,
    backgroundColor: colors.background,
  },
  styleIcon: {
    marginBottom: 4,
  },
  styleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  styleLabelActive: {
    color: colors.text,
    fontWeight: '800',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  colorBubbleWrapper: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 16,
  },
  colorBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  colorBubbleActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  colorBubbleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  colorBubbleLabelActive: {
    color: colors.text,
    fontWeight: '800',
  },
  saveBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
});
