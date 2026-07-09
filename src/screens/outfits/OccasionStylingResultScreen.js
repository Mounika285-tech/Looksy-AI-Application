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
import { ref, get, push, set } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { curateOutfit } from '../../utils/geminiService';

export const OccasionStylingResultScreen = ({ navigation, route }) => {
  const { desc } = route.params;
  const { user } = useAuth();
  const [curatedOutfit, setCuratedOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Occasion labels
  const getOccasionLabel = (occ) => {
    switch (occ) {
      case 'wedding': return 'Wedding Guest';
      case 'business': return 'Business Boardroom';
      case 'gala': return 'Evening Gala Luxe';
      case 'vacation': return 'Resort Vacation';
      case 'date-night': return 'Romantic Date Night';
      default: return 'Smart Casual Elegance';
    }
  };

  useEffect(() => {
    curateOccasionOutfit();
  }, [desc]);

  const curateOccasionOutfit = async () => {
    try {
      setIsLoading(true);
      setIsSaved(false);
      
      let closetItems = [];
      if (user) {
        // Fetch user's wardrobe
        const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
        const snapshot = await get(wardrobeRef);
        const data = snapshot.val();

        if (data) {
          closetItems = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
        }
      }

      if (closetItems.length === 0) {
        setCuratedOutfit({
          name: 'Empty Wardrobe',
          items: { top: null, bottom: null, footwear: null, accessory: null },
          suggestedAdditions: {
            top: 'upload top wear',
            bottom: 'upload bottom wear',
            footwear: 'upload footwear',
            accessory: 'upload accessories',
          },
          isEmpty: true,
        });
        setIsLoading(false);
        return;
      }

      const activeTops = closetItems.filter((i) => i.category === 'Top Wear');
      const baseGarment = activeTops.length > 0 ? activeTops[0] : closetItems[0];

      // Query real Gemini AI styling curate engine
      const outputOutfit = await curateOutfit(
        closetItems,
        baseGarment,
        `Occasion/Vibe Description: ${desc}`,
        'Occasion Styling'
      );

      setCuratedOutfit(outputOutfit);
      setIsLoading(false);
    } catch (e) {
      console.error('Error curating occasion outfit:', e);
      setCuratedOutfit(createFallbackOutfit());
      setIsLoading(false);
    }
  };

  const createFallbackOutfit = () => {
    return {
      name: 'Occasion Outfit',
      type: 'Occasion Styling',
      items: {
        top: null,
        bottom: null,
        footwear: null,
        accessory: null,
      },
      suggestedAdditions: {
        top: 'classic top layer',
        bottom: 'tailored bottom wear',
        footwear: 'classic black shoes',
        accessory: 'black leather belt',
      }
    };
  };

  const handleSaveOutfit = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your curated outfits.');
      return;
    }

    try {
      setIsSaving(true);
      const favRef = ref(database, `users/${user.uid}/favorite_outfits`);
      const newFavRef = push(favRef);

      const itemsData = {};
      Object.keys(curatedOutfit.items || {}).forEach((key) => {
        const item = curatedOutfit.items[key];
        if (item) {
          itemsData[key] = {
            id: item.id || '',
            name: item.name || '',
            imageUrl: item.imageUrl || '',
            category: item.category || '',
            colorHex: item.colorHex || '#CCCCCC',
          };
        }
      });

      await set(newFavRef, {
        name: curatedOutfit.name || 'AI Curated Outfit',
        type: curatedOutfit.type || 'Occasion Styling',
        createdAt: Date.now(),
        items: itemsData,
      });

      setIsSaved(true);
      setIsSaving(false);
      Alert.alert('Saved!', 'This look has been added to your Saved Favorites.');
    } catch (e) {
      console.error('Error saving curated outfit:', e);
      Alert.alert('Oops!', 'Failed to save outfit. Please try again.');
      setIsSaving(false);
    }
  };

  const renderOutfitRow = (item, label, suggestionText) => {
    if (item) {
      return (
        <View style={styles.itemRow}>
          <Image source={{ uri: item.imageUrl }} style={styles.rowThumbnail} />
          <View style={styles.rowMeta}>
            <Text style={styles.rowCategory}>{label}</Text>
            <Text style={styles.rowName}>{item.name}</Text>
          </View>
          <Feather name="check-circle" size={20} color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.unavailableRowContainer}>
        <View style={[styles.itemRow, styles.itemRowUnavailable]}>
          <View style={styles.rowThumbnailUnavailable}>
            <Feather name="alert-circle" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.rowMeta}>
            <Text style={styles.rowCategory}>{label}</Text>
            <Text style={styles.rowNameUnavailable}>Category Unavailable</Text>
          </View>
          <Text style={styles.rowStatusText}>Missing</Text>
        </View>
        {suggestionText && (
          <View style={styles.suggestionBubble}>
            <Feather name="info" size={12} color={colors.primary} style={styles.suggestionIcon} />
            <Text style={styles.suggestionText}>
              AI suggestion: Try pairing this look with {suggestionText}.
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>LookSy AI is scanning styling rules for this event...</Text>
      </View>
    );
  }

  if (curatedOutfit?.isEmpty) {
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
          <Text style={styles.headerTitle}>Occasion Styling</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="folder-plus" size={48} color={colors.primary} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Your Wardrobe is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Please upload garments in the Wardrobe tab first so LookSy AI can curate matching outfits for you!
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('WardrobeTab')}
            style={styles.uploadBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadBtnText}>Go to Wardrobe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Occasion Recommendation</Text>
        <TouchableOpacity
          onPress={curateOccasionOutfit}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Visual Hero Card */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPt1Jzafg6i4gfFYvCwQwYPb520uUuwu5D97Ld6uhWVGEOB8IJKQgKs3HvDQFTclriW_UfHNR0dYvUBWqUi0pRHjPEMUMVORo5SserAlvHOAJu-CfRksHlha_7azmnWGd6y1cUUjshtBXZtC32iU90iD7DZB9s5rCkIIb-yRj2l1t8C_KpjVIrfu521Ps0oHTqhoWu_whyOYAAKPcfsWnz7LCb-SD1ZLKcb4yevGM-vdDpvKFxAl5p7QWLTRDGmsBxaeez8z7KsNE' }}
            style={styles.heroImage}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Occasion Styling</Text>
            </View>
            <Text style={styles.heroTitleText}>{curatedOutfit.name}</Text>
            <Text style={styles.heroDesc} numberOfLines={3}>
              {desc || 'Styling rules computed for formal balanced fabrics, structured layouts, and intentional aesthetic presentation.'}
            </Text>
          </View>
        </View>

        {/* Composition list */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Curated Combination</Text>

          {/* Top */}
          {renderOutfitRow(curatedOutfit.items.top, 'Top Wear', curatedOutfit.suggestedAdditions?.top)}

          {/* Bottom */}
          {renderOutfitRow(curatedOutfit.items.bottom, 'Bottom Wear', curatedOutfit.suggestedAdditions?.bottom)}

          {/* Shoes */}
          {renderOutfitRow(curatedOutfit.items.footwear, 'Footwear', curatedOutfit.suggestedAdditions?.footwear)}

          {/* Accessories */}
          {renderOutfitRow(curatedOutfit.items.accessory, 'Accessory & Outerwear', curatedOutfit.suggestedAdditions?.accessory)}
        </View>

        {/* Action Buttons Row */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={handleSaveOutfit}
            disabled={isSaving || isSaved}
            style={[styles.saveOutfitBtn, isSaved && styles.saveOutfitBtnDisabled]}
            activeOpacity={0.8}
          >
            <Feather name="heart" size={16} color={isSaved ? colors.textSecondary : colors.primary} style={styles.saveBtnIcon} />
            <Text style={[styles.saveOutfitBtnText, isSaved && styles.saveOutfitBtnTextDisabled]}>
              {isSaved ? 'Saved to Favorites' : 'Save Outfit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OutfitDetails', { outfit: curatedOutfit })}
            style={styles.wearBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.wearBtnText}>Wear Look</Text>
            <Feather name="chevron-right" size={16} color={colors.white} style={styles.btnIcon} />
          </TouchableOpacity>
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
  refreshBtn: {
    padding: 8,
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 42, 41, 0.45)',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  heroTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  breakdownSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  rowThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  rowMeta: {
    flex: 1,
    marginLeft: 14,
  },
  rowCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  rowName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  saveOutfitBtn: {
    flex: 1.2,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  saveOutfitBtnDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  saveOutfitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  saveOutfitBtnTextDisabled: {
    color: colors.textSecondary,
  },
  saveBtnIcon: {
    marginRight: 6,
  },
  wearBtn: {
    flex: 1,
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
  wearBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  btnIcon: {
    marginLeft: 6,
  },
  unavailableRowContainer: {
    marginBottom: 12,
  },
  itemRowUnavailable: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
    marginBottom: 0,
  },
  rowThumbnailUnavailable: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowNameUnavailable: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  rowStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  suggestionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.accentDark,
    marginHorizontal: 4,
  },
  suggestionIcon: {
    marginRight: 6,
  },
  suggestionText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '600',
  },
  uploadBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
