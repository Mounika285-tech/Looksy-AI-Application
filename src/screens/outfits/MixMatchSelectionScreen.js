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
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const MixMatchSelectionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const filters = ['All', 'Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];

  // No fallbacks, user must upload real items

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubscribe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedItems = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(parsedItems.reverse());
      } else {
        setItems([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching wardrobe in mixmatch:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Use actual items
  const displayItems = items;

  const filteredItems = activeFilter === 'All'
    ? displayItems
    : displayItems.filter((item) => item.category === activeFilter);

  const toggleSelect = (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleGenerate = () => {
    if (!selectedItem) return;
    navigation.navigate('MixMatchResult', { baseItem: selectedItem });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItem?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        activeOpacity={0.8}
        style={[
          styles.itemCard,
          isSelected && styles.itemCardSelected,
        ]}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        {isSelected && (
          <View style={styles.selectCheck}>
            <Feather name="check" size={12} color={colors.white} />
          </View>
        )}
        <View style={styles.itemMeta}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Base Item</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Chips */}
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

      {/* Notice for Fallbacks */}
      {items.length === 0 && !isLoading && (
        <View style={styles.fallbackNotice}>
          <Feather name="info" size={16} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.fallbackNoticeText}>
            Your wardrobe is empty. Please upload clothing items in the Wardrobe tab to start curating matching looks!
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading Wardrobe...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found in this category.</Text>
            </View>
          }
        />
      )}

      {/* Selection floating action bar */}
      <View style={styles.floatingDock}>
        <View style={styles.dockInner}>
          <View style={styles.dockMeta}>
            <Text style={styles.dockCount}>
              {selectedItem ? '1 Item Selected' : '0 Items Selected'}
            </Text>
            <Text style={styles.dockLabel}>
              {selectedItem ? selectedItem.name : 'Choose a piece...'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={!selectedItem}
            style={[
              styles.generateBtn,
              !selectedItem && styles.generateBtnDisabled,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.generateBtnText}>Mix & Match</Text>
            <Feather name="zap" size={16} color={colors.white} style={styles.btnZapIcon} />
          </TouchableOpacity>
        </View>
      </View>
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
  fallbackNotice: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentDark,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  fallbackNoticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 15,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
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
  itemCardSelected: {
    borderColor: colors.primary,
  },
  itemImage: {
    height: 140,
    width: '100%',
    backgroundColor: colors.surface,
  },
  selectCheck: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMeta: {
    padding: 10,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 10,
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
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  floatingDock: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  dockInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 180, 184, 0.3)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dockMeta: {
    flex: 1,
    marginRight: 12,
  },
  dockCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dockLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  generateBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  btnZapIcon: {
    marginLeft: 6,
  },
});
