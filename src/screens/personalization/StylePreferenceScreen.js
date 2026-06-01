import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Feather } from '@expo/vector-icons';

export const StylePreferenceScreen = ({ navigation, route }) => {
  const { profileInfo } = route.params;

  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

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

  const handleNext = () => {
    navigation.navigate('SetupComplete', {
      personalizationData: {
        ...profileInfo,
        stylePreferences: selectedStyles,
        preferredColors: selectedColors,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>2 of 3: Style Preference</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Define your style</Text>
          <Text style={styles.subtitle}>
            Select the style aesthetics and colors you prefer in your wardrobe.
          </Text>
        </View>

        {/* Style Tag Grid */}
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
                  size={20}
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
                    <Feather name="check" size={10} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preferred Colors Bubble Selection */}
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
                      size={16}
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

        <Button
          title="Continue"
          variant="primary"
          onPress={handleNext}
          style={styles.nextBtn}
        />
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 36,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 12,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  styleCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
    height: 90,
  },
  styleCardActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  styleIcon: {
    marginBottom: 8,
  },
  styleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  styleLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 36,
  },
  colorBubbleWrapper: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 20,
  },
  colorBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  colorBubbleActive: {
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  colorBubbleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  colorBubbleLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  nextBtn: {
    marginTop: 10,
  },
});
