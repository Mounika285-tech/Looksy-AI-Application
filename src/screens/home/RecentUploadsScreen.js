import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const RecentUploadsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = ['All', 'Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];

  // Premium fallback items shown when wardrobe is empty
  const fallbackItems = [
    { id: 'fb1', name: 'Ivory Silk Blouse', category: 'Top Wear', colorHex: '#FFFDF9', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkWqkR5PT7Bavl-4ujQPl8DZuSpY6oLPErC1MjdO_PObRL9j8GaonEC-ex0j7jxdiDUFog_QkNH6Bl34sAW6ahUhT4PDTuuY4NALKF06n9sJ3AWa-HdJc2g0DZPeJOikUc70nkH1caGEcw0BCvnt2pC5klyGsoecxn9zcGbVHQOutt6BzcQ-qpYBe9gwUmqTC4ISVDtr59TArPw2lyiVP4maclE7aevSktVh7HSqwLvGm3fPZ4eYNzOU082MuDsgBNCru_JGW6aX8', isFallback: true },
    { id: 'fb2', name: 'Charcoal Wide-Leg Trousers', category: 'Bottom Wear', colorHex: '#4A4A4A', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQpB5RNTvJARmGajGuy_rwCPsFDeu5dL2yZTwNnuTYlIBuuPepLWbkPkQan3uN5qmpZ4EFklHWrW3eSVPHY8ujqGh2ThUIJ0xszj7tk4PzMRdJ1MTtxWYJhwdRHrBbIZDUpbC-qXgCdwJqprDhnuE1Ex7V5ADmiDtKp78Qe_bmRyDtgaY3aqB6Ene2tv1PRTCfb5AiudckUh07Tk-7D1-Yu1IsjbI9ltLDd71cNSygMqQw0b0xJ8tklUYDp5q_ctM9NwniNNT1gfg', isFallback: true },
    { id: 'fb3', name: 'Leather Blush Pumps', category: 'Footwear', colorHex: '#E8B4B8', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY', isFallback: true },
    { id: 'fb4', name: 'Classic Camel Trench', category: 'Accessories', colorHex: '#D2B48C', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tw2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM', isFallback: true },
  ];

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubscribe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setItems(parsed);
      } else {
        setItems([]);
      }
      setIsLoading(false);
    }, () => setIsLoading(false));

    return () => unsubscribe();
  }, [user]);

  const displayItems = items.length > 0 ? items : fallbackItems;
  const isFallback = items.length === 0;

  const filteredItems = activeFilter === 'All'
    ? displayItems
    : displayItems.filter((i) => i.category === activeFilter);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('WardrobeTab')}
      activeOpacity={0.85}
      style={styles.itemCard}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={28} color={colors.textSecondary} />
          </View>
        )}
        {item.isFallback && (
          <View style={styles.fallbackBadge}>
            <Text style={styles.fallbackBadgeText}>Sample</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      {item.colorHex && (
        <View style={[styles.colorIndicator, { backgroundColor: item.colorHex }]} />
      )}
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Recent Uploads</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('WardrobeTab')}
          style={styles.addBtn}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading your wardrobe...</Text>
        </View>
      ) : (
        <>
          {/* Fallback notice */}
          {isFallback && (
            <View style={styles.fallbackNotice}>
              <Feather name="info" size={14} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.fallbackNoticeText}>
                Showing sample items — upload garments to your wardrobe to see your collection here.
              </Text>
            </View>
          )}

          {/* Count badge */}
          {!isFallback && (
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                {activeFilter !== 'All' ? ` in ${activeFilter}` : ' in your wardrobe'}
              </Text>
            </View>
          )}

          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="folder-minus" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>No items in this category</Text>
                <Text style={styles.emptySubtitle}>Upload garments in the wardrobe to see them here.</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backBtn: { padding: 8 },
  addBtn: { padding: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.text, fontWeight: '700' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  fallbackNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentDark,
  },
  fallbackNoticeText: { flex: 1, fontSize: 11, fontWeight: '600', color: colors.textSecondary, lineHeight: 15 },
  countRow: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  countText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  gridContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 40 },
  itemCard: {
    width: '46%',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: '2%',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: { height: 140, width: '100%', backgroundColor: colors.surface },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(240, 90, 91, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fallbackBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  info: { padding: 10 },
  itemName: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 2 },
  itemCategory: { fontSize: 10, fontWeight: '600', color: colors.textSecondary },
  colorIndicator: {
    position: 'absolute', top: 10, right: 10,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 },
});
