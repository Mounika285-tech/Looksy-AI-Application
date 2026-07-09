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
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { generateSuggestions } from '../../utils/geminiService';

export const AISuggestionsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const selectedStyleTags = profile?.stylePreferences || ['casual', 'minimalist'];

  const [isLoading, setIsLoading] = useState(true);
  const [suggestedOutfits, setSuggestedOutfits] = useState([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Subscribe to wardrobe items in real-time
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const favRef = ref(database, `users/${user.uid}/favorite_outfits`);

    const unsubWardrobe = onValue(wardrobeRef, async (snapshot) => {
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

    const unsubFavorites = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedFavs = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFavoriteOutfits(parsedFavs);
      } else {
        setFavoriteOutfits([]);
      }
    });

    return () => {
      unsubWardrobe();
      unsubFavorites();
    };
  }, [user, profile]);

  const isOutfitFavorited = (outfitName) => {
    return favoriteOutfits.some((fav) => fav.name === outfitName);
  };

  const handleFavoriteToggle = async (outfit) => {
    if (!user) {
      Alert.alert('Authentication required', 'Please sign in to favorite outfits.');
      return;
    }

    const favorited = isOutfitFavorited(outfit.name);
    try {
      if (favorited) {
        const existing = favoriteOutfits.find((fav) => fav.name === outfit.name);
        if (existing) {
          const deleteRef = ref(database, `users/${user.uid}/favorite_outfits/${existing.id}`);
          await remove(deleteRef);
          Alert.alert('Removed!', 'Outfit removed from favorites.');
        }
      } else {
        const favRef = ref(database, `users/${user.uid}/favorite_outfits`);
        const newFavRef = push(favRef);

        const itemsData = {};
        Object.keys(outfit.items || {}).forEach((key) => {
          const item = outfit.items[key];
          if (item) {
            itemsData[key] = {
              id: item.id,
              name: item.name,
              imageUrl: item.imageUrl,
              category: item.category,
              colorHex: item.colorHex || '#CCCCCC',
            };
          }
        });

        await set(newFavRef, {
          name: outfit.name,
          type: outfit.category || 'Outfit suggestion',
          createdAt: Date.now(),
          items: itemsData,
        });

        Alert.alert('Favorited!', 'Outfit added to your saved gallery.');
      }
    } catch (e) {
      console.error('Error toggling favorite:', e);
      Alert.alert('Oops!', 'Could not update favorite. Please try again.');
    }
  };

  const handleViewDetails = (outfit) => {
    // Navigate to OutfitsTab stack navigator screen OutfitDetails
    navigation.navigate('OutfitsTab', {
      screen: 'OutfitDetails',
      params: { outfit },
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
            {suggestedOutfits.map((outfit, index) => {
              const favorited = isOutfitFavorited(outfit.name);
              const itemsList = Object.values(outfit.items || {}).filter(Boolean);

              // Check missing categories for dynamic warnings
              const missingCats = [];
              if (outfit.suggestedAdditions) {
                if (!outfit.items?.top && outfit.suggestedAdditions.top) missingCats.push(`Top (${outfit.suggestedAdditions.top})`);
                if (!outfit.items?.bottom && outfit.suggestedAdditions.bottom) missingCats.push(`Bottom (${outfit.suggestedAdditions.bottom})`);
                if (!outfit.items?.footwear && outfit.suggestedAdditions.footwear) missingCats.push(`Shoes (${outfit.suggestedAdditions.footwear})`);
                if (!outfit.items?.accessory && outfit.suggestedAdditions.accessory) missingCats.push(`Accessory (${outfit.suggestedAdditions.accessory})`);
              }

              return (
                <View key={outfit.id || index} style={styles.outfitCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.styleBadge, { backgroundColor: outfit.color || colors.accent }]}>
                      <Text style={styles.styleBadgeText}>{outfit.category}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleFavoriteToggle(outfit)}
                      style={styles.favoriteBtn}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={favorited ? 'heart' : 'heart'}
                        size={18}
                        color={favorited ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.outfitName}>{outfit.name}</Text>
                  
                  <View style={styles.compositionDivider} />

                  {/* Horizontal flatlay thumbnails */}
                  <View style={styles.thumbnailsContainer}>
                    {itemsList.map((item, idx) => (
                      <View key={item.id || idx} style={styles.thumbnailWrapper}>
                        <Text style={styles.thumbnailCategory} numberOfLines={1}>
                          {item.category?.replace(' Wear', '') || 'Garment'}
                        </Text>
                        <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
                        <Text style={styles.thumbnailLabel} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {missingCats.length > 0 && (
                    <View style={styles.warningContainer}>
                      <Feather name="info" size={11} color={colors.primary} style={styles.warningIcon} />
                      <Text style={styles.warningText}>
                        Missing: {missingCats.join(', ')}.
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => handleViewDetails(outfit)}
                    style={styles.tryOnBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tryOnBtnText}>View Styling Details</Text>
                    <Feather name="chevron-right" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              );
            })}
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
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    gap: 8,
  },
  thumbnailWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '25%',
  },
  thumbnailCategory: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.surface,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  thumbnailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accentDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
