import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const FavoritesHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [itemsCount, setItemsCount] = useState(0);
  const [outfitsCount, setOutfitsCount] = useState(0);
  const [latestItemName, setLatestItemName] = useState('Silk Midi Skirt');
  const [topCategory, setTopCategory] = useState('Outerwear');

  useEffect(() => {
    if (!user) return;

    // Sub wardrobe count
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubWardrobe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
        setItemsCount(parsed.length);
        if (parsed.length > 0) {
          setLatestItemName(parsed[0].name || 'New Garment');
          
          // Heuristic to get top category
          const cats = parsed.map(p => p.category).reduce((acc, c) => {
            acc[c] = (acc[c] || 0) + 1;
            return acc;
          }, {});
          const top = Object.keys(cats).reduce((a, b) => cats[a] > cats[b] ? a : b, 'Tops');
          setTopCategory(top);
        }
      } else {
        setItemsCount(0);
      }
    });

    // Sub favorite outfits count
    const outfitsRef = ref(database, `users/${user.uid}/favorite_outfits`);
    const unsubOutfits = onValue(outfitsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOutfitsCount(Object.keys(data).length);
      } else {
        setOutfitsCount(0);
      }
    });

    return () => {
      unsubWardrobe();
      unsubOutfits();
    };
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Premium Header */}
      <View style={styles.header}>
        <View style={styles.menuBtn}>
          <Feather name="menu" size={22} color={colors.primary} />
        </View>
        <Text style={styles.headerBrand}>LOOKSY AI</Text>
        <TouchableOpacity
          style={styles.profileBadge}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}
        >
          <Feather name="user" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>The Collection</Text>
          <Text style={styles.heroSubtitle}>
            Your curated selection of personal style and inspired looks.
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoContainer}>
          {/* Card 1: Saved Outfits */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SavedOutfits')}
            activeOpacity={0.9}
            style={styles.bentoCard}
          >
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiMzkm8L7IAq-SnRnKFXjzWRfX5OySDfbUCcm5UU-ixsNumORYUOfpCIg3dkEgv7KiMpu9d4eRMa5p2dC4YSgMqTGm51GVIlJkM5ryBBMGc7xV93r90sr-UnbmiN52nOA-z27CSaHo9i-PLHO6RB3NBYPhxu7HUIWwCsYZG9sfod9kPpYA6PGE5mc8jKnyJJ3n5smCYGsGn7ZGv5leccVNo9nQx29RvR8rhU0lx_b7y1cqURJ9ENeEJFeFC6kyQg5G77z5jxPoPPE' }}
              style={styles.cardImage}
            />
            <View style={styles.glassOverlay} />
            <View style={styles.cardContent}>
              <View style={styles.innerPanel}>
                <Text style={styles.cardTag}>Curation</Text>
                <Text style={styles.cardTitle}>Saved Outfits</Text>
                <Text style={styles.cardStats}>{outfitsCount} unique combinations</Text>
                
                <View style={styles.actionRow}>
                  <Text style={styles.actionText}>Explore Gallery</Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} style={styles.actionIcon} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Saved Items */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SavedItems')}
            activeOpacity={0.9}
            style={[styles.bentoCard, { marginTop: 20 }]}
          >
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX30er4tFB236oNpmkd4V73Sa8uBRniG_saop5C1TYE7m6RpQ1YOi6NJtexo2CesapwlffzUnZh8xfPBYILMwKysEn16083OzlX6vnvTCqyknSENElplZQYrE_5RUIMvm0En-7g5O4M_VWQBpQPSaO6d1MNyiu1H0It-FuiQpkM52HP68H1FHtt7GvtCYnaXp558P4rukeKahlxFjB7BpRvJn-qHTEop-9hTy5QdIR-0cxLnQfslDpD97z9zZ2HBLrZLGkvPN3SVU' }}
              style={styles.cardImage}
            />
            <View style={styles.glassOverlay} />
            <View style={styles.cardContent}>
              <View style={styles.innerPanel}>
                <Text style={styles.cardTag}>Closet</Text>
                <Text style={styles.cardTitle}>Saved Items</Text>
                <Text style={styles.cardStats}>{itemsCount} individual pieces</Text>
                
                <View style={styles.actionRow}>
                  <Text style={styles.actionText}>View Closet</Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} style={styles.actionIcon} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsSection}>
          {/* Stat 1 */}
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.accent }]}>
              <Feather name="clock" size={16} color={colors.primary} />
            </View>
            <View style={styles.statMeta}>
              <Text style={styles.statLabel}>Recently Added</Text>
              <Text style={styles.statValue} numberOfLines={1}>{latestItemName}</Text>
            </View>
          </View>

          {/* Stat 2 */}
          <View style={[styles.statBox, { marginTop: 12 }]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="tag" size={16} color={colors.text} />
            </View>
            <View style={styles.statMeta}>
              <Text style={styles.statLabel}>Top Category</Text>
              <Text style={styles.statValue}>{topCategory}</Text>
            </View>
          </View>

          {/* Stat 3 */}
          <View style={[styles.statBox, { marginTop: 12 }]}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.surface }]}>
              <Feather name="award" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.statMeta}>
              <Text style={styles.statLabel}>Closet Value</Text>
              <Text style={styles.statValue}>Curated Essentials</Text>
            </View>
          </View>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  menuBtn: {
    padding: 6,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
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
  bentoContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  bentoCard: {
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232, 180, 184, 0.12)', // Warm blush glass layer
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  innerPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 180, 184, 0.2)',
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardStats: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 4,
  },
  actionIcon: {
    marginTop: 1,
  },
  statsSection: {
    paddingHorizontal: 24,
  },
  statBox: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statMeta: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
});
