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
import { ref, get } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { curateOutfit } from '../../utils/geminiService';

export const OccasionStylingResultScreen = ({ navigation, route }) => {
  const { occasion, desc } = route.params;
  const { user } = useAuth();
  const [curatedOutfit, setCuratedOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fallback preset options
  const fallbacks = {
    top: {
      id: 'fb_occ_top',
      name: occasion === 'business' ? 'Tailored Cotton Blazer' : occasion === 'gala' ? 'Plunge Neck Silk Cami' : 'Ivory Silk Button-Down',
      category: 'Top Wear',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4',
    },
    bottom: {
      id: 'fb_occ_bottom',
      name: occasion === 'vacation' ? 'Flowing Pleated Skirt' : 'Tailored Wide-Leg Trousers',
      category: 'Bottom Wear',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE',
    },
    foot: {
      id: 'fb_occ_foot',
      name: occasion === 'vacation' ? 'Woven Leather Espadrilles' : 'Pointed Leather Pumps',
      category: 'Footwear',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY',
    },
    accessory: {
      id: 'fb_occ_acc',
      name: 'Classic Camel Trench Coat',
      category: 'Accessories',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tw2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM',
    },
  };

  useEffect(() => {
    curateOccasionOutfit();
  }, [occasion]);

  const curateOccasionOutfit = async () => {
    try {
      setIsLoading(true);
      
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

      const activeTops = closetItems.filter((i) => i.category === 'Top Wear');
      const baseGarment = activeTops.length > 0 ? activeTops[0] : fallbacks.top;

      // Query real Gemini AI styling curate engine
      const outputOutfit = await curateOutfit(
        closetItems,
        baseGarment,
        `Occasion Label: ${getOccasionLabel(occasion)}, Context: ${desc}`,
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
    const outfit = {
      name: getOccasionLabel(occasion),
      type: 'Occasion Styling',
      items: {},
    };

    outfit.items.top = fallbacks.top;
    outfit.items.bottom = fallbacks.bottom;
    outfit.items.footwear = fallbacks.foot;
    outfit.items.accessory = fallbacks.accessory;

    return outfit;
  };

  if (isLoading || !curatedOutfit) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>LookSy AI is scanning styling rules for this event...</Text>
      </View>
    );
  }

  const isFallbackOutfit = Object.values(curatedOutfit.items).some(item => item && item.isFallback);

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
              <Text style={styles.badgeText}>{getOccasionLabel(occasion)}</Text>
            </View>
            <Text style={styles.heroTitleText}>{curatedOutfit.name}</Text>
            <Text style={styles.heroDesc} numberOfLines={3}>
              {desc || 'Styling rules computed for formal balanced fabrics, structured layouts, and intentional aesthetic presentation.'}
            </Text>
          </View>
        </View>

        {isFallbackOutfit && (
          <View style={styles.fallbackAlert}>
            <Feather name="info" size={16} color={colors.textSecondary} style={styles.infoIcon} />
            <Text style={styles.fallbackAlertText}>
              Blending user wardrobe pieces with Fallback Essentials to complete this curated look.
            </Text>
          </View>
        )}

        {/* Composition list */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Curated Combination</Text>

          {/* Top */}
          {curatedOutfit.items.top && (
            <View style={styles.itemRow}>
              <Image source={{ uri: curatedOutfit.items.top.imageUrl }} style={styles.rowThumbnail} />
              <View style={styles.rowMeta}>
                <Text style={styles.rowCategory}>Top Wear</Text>
                <Text style={styles.rowName}>{curatedOutfit.items.top.name}</Text>
              </View>
              <Feather name="check-circle" size={20} color={colors.primary} />
            </View>
          )}

          {/* Bottom */}
          {curatedOutfit.items.bottom && (
            <View style={styles.itemRow}>
              <Image source={{ uri: curatedOutfit.items.bottom.imageUrl }} style={styles.rowThumbnail} />
              <View style={styles.rowMeta}>
                <Text style={styles.rowCategory}>Bottom Wear</Text>
                <Text style={styles.rowName}>{curatedOutfit.items.bottom.name}</Text>
              </View>
              <Feather name="check-circle" size={20} color={colors.primary} />
            </View>
          )}

          {/* Shoes */}
          {curatedOutfit.items.footwear && (
            <View style={styles.itemRow}>
              <Image source={{ uri: curatedOutfit.items.footwear.imageUrl }} style={styles.rowThumbnail} />
              <View style={styles.rowMeta}>
                <Text style={styles.rowCategory}>Footwear</Text>
                <Text style={styles.rowName}>{curatedOutfit.items.footwear.name}</Text>
              </View>
              <Feather name="check-circle" size={20} color={colors.primary} />
            </View>
          )}

          {/* Accessories */}
          {curatedOutfit.items.accessory && (
            <View style={styles.itemRow}>
              <Image source={{ uri: curatedOutfit.items.accessory.imageUrl }} style={styles.rowThumbnail} />
              <View style={styles.rowMeta}>
                <Text style={styles.rowCategory}>Accessory & Outerwear</Text>
                <Text style={styles.rowName}>{curatedOutfit.items.accessory.name}</Text>
              </View>
              <Feather name="check-circle" size={20} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('OutfitDetails', { outfit: curatedOutfit })}
          style={styles.actionBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Wear This Look</Text>
          <Feather name="chevron-right" size={18} color={colors.white} style={styles.btnIcon} />
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
  refreshBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 380,
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
  fallbackAlert: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  infoIcon: {
    marginRight: 8,
  },
  fallbackAlertText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
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
  actionBtn: {
    marginHorizontal: 24,
    marginTop: 24,
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
});
