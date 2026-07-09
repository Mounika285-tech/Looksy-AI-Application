import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const WardrobeGridScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];

  useEffect(() => {
    if (!user) return;

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubscribe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedItems = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(parsedItems.reverse()); // Newest uploads first
      } else {
        setItems([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching wardrobe:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredItems = activeFilter === 'All'
    ? items
    : items.filter((item) => item.category === activeFilter);

  const handleToggleFavorite = async (item) => {
    try {
      if (!user) return;
      const itemRef = ref(database, `users/${user.uid}/wardrobe/${item.id}`);
      const nextStatus = !item.isFavorite;
      await update(itemRef, { isFavorite: nextStatus });
    } catch (e) {
      console.error('Error toggling closet item favorite status:', e);
    }
  };

  const renderItem = ({ item }) => {
    const isFav = item.isFavorite === true;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}
        activeOpacity={0.8}
        style={styles.itemCard}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        
        {/* Favorite heart overlay button */}
        <TouchableOpacity
          onPress={() => handleToggleFavorite(item)}
          style={styles.heartBtn}
          activeOpacity={0.8}
        >
          <Feather
            name="heart"
            size={16}
            color={isFav ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.itemMeta}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name || 'Unnamed Item'}
          </Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        <View style={[styles.colorIndicator, { backgroundColor: item.colorHex || '#CCCCCC' }]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('UploadOptions')}
          style={styles.addHeaderBtn}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories slider */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterSlider}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Grid Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading Wardrobe...</Text>
        </View>
      ) : filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="layers" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Your Wardrobe is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add clothing items to your digital wardrobe to start receiving smart outfit combinations.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('UploadOptions')}
            style={styles.emptyBtn}
            activeOpacity={0.8}
          >
            <Feather name="plus-circle" size={20} color={colors.white} style={styles.emptyBtnIcon} />
            <Text style={styles.emptyBtnText}>Upload First Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button (FAB) */}
      {items.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('UploadOptions')}
          style={styles.fab}
          activeOpacity={0.9}
        >
          <Feather name="plus" size={28} color={colors.white} />
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  addHeaderBtn: {
    padding: 4,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterSlider: {
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
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
  itemImage: {
    height: 150,
    width: '100%',
    backgroundColor: colors.surface,
  },
  itemMeta: {
    padding: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  colorIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyBtnIcon: {
    marginRight: 8,
  },
  emptyBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
});
