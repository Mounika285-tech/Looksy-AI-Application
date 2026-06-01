import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { generateSuggestions } from '../../utils/geminiService';

export const AISuggestionsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const selectedStyleTags = profile?.stylePreferences || ['casual', 'minimalist'];

  const [isLoading, setIsLoading] = useState(true);
  const [suggestedOutfits, setSuggestedOutfits] = useState([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Subscribe to wardrobe items in real-time
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsub = onValue(wardrobeRef, async (snapshot) => {
      const data = snapshot.val();
      const closetItems = data 
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];

      try {
        const results = await generateSuggestions(closetItems, selectedStyleTags);
        setSuggestedOutfits(results);
      } catch (error) {
        console.error("Failed to generate AI suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, [user, profile]);

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
        <Text style={styles.headerTitle}>AI Recommendations</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Generating personalized lookbooks...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Intro Meta Info */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Styling Insights</Text>
            <Text style={styles.heroSubtitle}>
              These outfits are generated matching your style preferences:{' '}
              <Text style={styles.boldTags}>
                {selectedStyleTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')}
              </Text>
            </Text>
          </View>

          {/* Suggestion list */}
          <View style={styles.list}>
            {suggestedOutfits.map((outfit) => (
              <View key={outfit.id} style={styles.outfitCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.styleBadge, { backgroundColor: outfit.color || colors.accent }]}>
                    <Text style={styles.styleBadgeText}>{outfit.category}</Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
                    <Feather name="heart" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.outfitName}>{outfit.name}</Text>
                
                <View style={styles.compositionDivider} />

                <View style={styles.itemsWrapper}>
                  {outfit.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemBullet} />
                      <Text style={styles.itemLabel}>{item}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('TodaysOutfit')}
                  style={styles.tryOnBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tryOnBtnText}>View Styling Details</Text>
                  <Feather name="chevron-right" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
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
    width: 36,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  heroSection: {
    marginBottom: 28,
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
  boldTags: {
    fontWeight: '700',
    color: colors.primary,
  },
  list: {
    width: '100%',
  },
  outfitCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  favoriteBtn: {
    padding: 4,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  compositionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  itemsWrapper: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentDark,
    marginRight: 10,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tryOnBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryOnBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
