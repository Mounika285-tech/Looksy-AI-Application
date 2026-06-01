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
import { Feather } from '@expo/vector-icons';

export const AIPlannerSetupScreen = ({ navigation }) => {
  const [selectedVibe, setSelectedVibe] = useState('Minimalist');
  const [syncWeather, setSyncWeather] = useState(true);
  const [includeAccessories, setIncludeAccessories] = useState(true);

  const vibes = ['Minimalist', 'Streetwear', 'Formal', 'Casual'];

  const handleGenerate = () => {
    navigation.navigate('AIPlannerResults', {
      vibe: selectedVibe,
      weatherSync: syncWeather,
      accessories: includeAccessories,
    });
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
        <Text style={styles.headerTitle}>AI Planner Setup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>AI Weekly Stylist</Text>
          <Text style={styles.heroSubtitle}>
            Our styling algorithm will auto-generate a custom 7-day lookbook matching your preferred styles and forecast climate conditions.
          </Text>
        </View>

        {/* Option 1: Style Focus Vibe */}
        <View style={styles.optionSection}>
          <Text style={styles.sectionLabel}>Select Vibe Focus</Text>
          <View style={styles.vibesContainer}>
            {vibes.map((vibe) => {
              const isActive = selectedVibe === vibe;
              return (
                <TouchableOpacity
                  key={vibe}
                  onPress={() => setSelectedVibe(vibe)}
                  style={[
                    styles.vibeChip,
                    isActive && styles.vibeChipActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.vibeText,
                      isActive && styles.vibeTextActive,
                    ]}
                  >
                    {vibe}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Option 2: Weather & Preferences Switches */}
        <View style={styles.optionSection}>
          <Text style={styles.sectionLabel}>Styling Preferences</Text>

          {/* Switch 1: Sync local forecast */}
          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchTitle}>Sync Weather Forecast</Text>
              <Text style={styles.switchDesc}>Adjust layer recommendations based on forecast temperature shifts.</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSyncWeather(!syncWeather)}
              style={[styles.toggleBtn, syncWeather && styles.toggleBtnActive]}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleBall, syncWeather && styles.toggleBallActive]} />
            </TouchableOpacity>
          </View>

          {/* Switch 2: Include accessories */}
          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchTitle}>Coordinated Accessories</Text>
              <Text style={styles.switchDesc}>Automatically recommend matching trench coats, belts, or bags.</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIncludeAccessories(!includeAccessories)}
              style={[styles.toggleBtn, includeAccessories && styles.toggleBtnActive]}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleBall, includeAccessories && styles.toggleBallActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleGenerate}
          style={styles.actionBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Generate Weekly Style</Text>
          <Feather name="cpu" size={16} color={colors.white} style={styles.btnIcon} />
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
  placeholder: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  optionSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vibeChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginRight: 10,
    marginBottom: 10,
  },
  vibeChipActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  vibeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  vibeTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  switchMeta: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    fontWeight: '600',
  },
  toggleBtn: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBallActive: {
    alignSelf: 'flex-end',
  },
  actionBtn: {
    marginHorizontal: 24,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  btnIcon: {
    marginLeft: 6,
  },
});
