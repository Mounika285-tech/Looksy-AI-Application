import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from '../../config/firebase';

export const TodaysOutfitScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedOutfits, setPlannedOutfits] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback static outfit
  const defaultOutfit = {
    id: 'default',
    name: 'Summer Casual Chic',
    category: 'Casual',
    desc: 'An effortless sunny day outfit styled around classic comfortable tones and premium breathing fabrics.',
    items: {
      top: { id: 'fb1', name: 'Beige Cotton Tee', category: 'Top Wear', colorHex: '#F5EFEB', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4' },
      bottom: { id: 'fb2', name: 'Light Blue Jeans', category: 'Bottom Wear', colorHex: '#CBD5E1', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE' },
      footwear: { id: 'fb3', name: 'White Sneakers', category: 'Footwear', colorHex: '#FFFFFF', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY' },
    },
  };

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const plannerRef = ref(database, `users/${user.uid}/planner`);
    const unsubPlanner = onValue(plannerRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.keys(data)
          .map((k) => ({ id: k, ...data[k] }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPlannedOutfits(list);
      } else {
        setPlannedOutfits([]);
      }
      setIsLoading(false);
    });

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubWardrobe = onValue(wardrobeRef, (snap) => {
      const data = snap.val();
      if (data) {
        setWardrobeItems(Object.keys(data).map((k) => ({ id: k, ...data[k] })));
      } else {
        setWardrobeItems([]);
      }
    });

    return () => { unsubPlanner(); unsubWardrobe(); };
  }, [user]);

  // Pick the soonest scheduled outfit or the latest from the planner
  const today = plannedOutfits.find((o) => o.plannedDate === 'Today')
    || plannedOutfits.find((o) => o.plannedDate === 'Tomorrow')
    || plannedOutfits[0];

  const activeOutfit = today || defaultOutfit;
  const outfitItems = activeOutfit?.items ? Object.values(activeOutfit.items).filter(Boolean) : [];

  const handleFavoriteToggle = async () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited && user) {
      try {
        const favRef = ref(database, `users/${user.uid}/favorite_outfits`);
        const newFavRef = push(favRef);
        const itemsData = {};
        Object.keys(activeOutfit.items || {}).forEach((key) => {
          const item = activeOutfit.items[key];
          if (item) itemsData[key] = { id: item.id, name: item.name, imageUrl: item.imageUrl, category: item.category, colorHex: item.colorHex || '#CCCCCC' };
        });
        await set(newFavRef, { name: activeOutfit.name, type: activeOutfit.category || 'Outfit', createdAt: Date.now(), items: itemsData });
        Alert.alert('Favorited!', 'Outfit added to your favorites.');
      } catch (e) {
        console.error('Favorite error:', e);
      }
    }
  };

  const handleAddToPlanner = async () => {
    if (!user) { Alert.alert('Planned!', 'Outfit scheduled for today.'); return; }
    setIsPlanning(true);
    try {
      const plannerRef = ref(database, `users/${user.uid}/planner`);
      const newRef = push(plannerRef);
      const itemsData = {};
      Object.keys(activeOutfit.items || {}).forEach((key) => {
        const item = activeOutfit.items[key];
        if (item) itemsData[key] = { id: item.id, name: item.name, imageUrl: item.imageUrl, category: item.category };
      });
      await set(newRef, { name: activeOutfit.name, plannedDate: 'Today', createdAt: Date.now(), notificationEnabled: true, items: itemsData });
      Alert.alert('Scheduled!', `"${activeOutfit.name}" has been added to today's planner.`);
    } catch (e) {
      console.error('Plan error:', e);
      Alert.alert('Error', 'Failed to schedule outfit.');
    } finally {
      setIsPlanning(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading your outfit...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Outfit</Text>
        <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteIconBtn} activeOpacity={0.7}>
          <Feather
            name="heart"
            size={20}
            color={isFavorited ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        {today ? (
          <View style={styles.scheduledBadge}>
            <Feather name="calendar" size={13} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.scheduledBadgeText}>
              Scheduled for {today.plannedDate || 'Today'}
            </Text>
          </View>
        ) : (
          <View style={styles.suggestedBadge}>
            <Feather name="cpu" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.suggestedBadgeText}>AI-suggested look</Text>
          </View>
        )}

        {/* Outfit Hero Preview */}
        <View style={styles.previewPanel}>
          {outfitItems.length > 0 && outfitItems[0].imageUrl ? (
            <Image source={{ uri: outfitItems[0].imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={styles.previewDecoration}>
              <View style={styles.previewCircle} />
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroText}>
            <Text style={styles.previewTitle}>{activeOutfit.name}</Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>{activeOutfit.category || activeOutfit.type || 'Curated'}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {activeOutfit.desc && (
          <View style={styles.detailsHeader}>
            <Text style={styles.sectionTitle}>Style Description</Text>
            <Text style={styles.descriptionText}>{activeOutfit.desc}</Text>
          </View>
        )}

        {/* Items Composition */}
        <Text style={styles.sectionTitle}>Outfit Composition</Text>
        <View style={styles.itemsList}>
          {outfitItems.map((item, idx) => (
            <View key={item.id || idx} style={[styles.itemRow, idx === outfitItems.length - 1 && { borderBottomWidth: 0 }]}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemThumbnail} />
              ) : (
                <View style={[styles.itemColorIcon, { backgroundColor: item.colorHex || colors.surface }]} />
              )}
              <View style={styles.itemMeta}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>{item.category}</Text>
              </View>
              <Feather name="check-circle" size={18} color={colors.primary} />
            </View>
          ))}
          {outfitItems.length === 0 && (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsText}>No items in this outfit</Text>
            </View>
          )}
        </View>

        {/* Wardrobe stat */}
        {wardrobeItems.length > 0 && (
          <View style={styles.wardrobeStat}>
            <Feather name="layers" size={14} color={colors.textSecondary} />
            <Text style={styles.wardrobeStatText}>
              {wardrobeItems.length} items in your digital wardrobe
            </Text>
          </View>
        )}

        {/* Action */}
        <Button
          title={isPlanning ? 'Scheduling...' : 'Schedule Outfit in Planner'}
          variant="primary"
          onPress={handleAddToPlanner}
          loading={isPlanning}
          style={styles.actionBtn}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('OutfitsTab')}
          style={styles.secondaryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Generate New Outfit</Text>
          <Feather name="zap" size={14} color={colors.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loaderText: { marginTop: 12, fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border,
  },
  backBtn: { padding: 8 },
  favoriteIconBtn: { padding: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  scrollContainer: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 },
  scheduledBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(240, 90, 91, 0.08)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(240, 90, 91, 0.15)', marginBottom: 16,
  },
  scheduledBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  suggestedBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  suggestedBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  previewPanel: {
    height: 220, borderRadius: 24, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, marginBottom: 24,
    overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center',
  },
  heroImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(44, 42, 41, 0.35)' },
  heroText: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  previewDecoration: { position: 'absolute', opacity: 0.1 },
  previewCircle: { width: 260, height: 260, borderRadius: 130, backgroundColor: colors.accentDark },
  previewTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: 8, zIndex: 1 },
  previewBadge: {
    backgroundColor: colors.primary, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, zIndex: 1,
  },
  previewBadgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  detailsHeader: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  descriptionText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  itemsList: {
    backgroundColor: colors.white, borderRadius: 24,
    borderWidth: 1.5, borderColor: colors.border, padding: 4, marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderColor: colors.border,
  },
  itemThumbnail: { width: 44, height: 44, borderRadius: 10, marginRight: 14, backgroundColor: colors.surface },
  itemColorIcon: { width: 20, height: 20, borderRadius: 10, marginRight: 16, borderWidth: 1, borderColor: colors.border },
  itemMeta: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  itemType: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  emptyItems: { padding: 20, alignItems: 'center' },
  emptyItemsText: { fontSize: 13, color: colors.textSecondary },
  wardrobeStat: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20, paddingHorizontal: 4,
  },
  wardrobeStatText: { marginLeft: 6, fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  actionBtn: { marginTop: 8, marginBottom: 12 },
  secondaryBtn: {
    height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.white,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
