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

export const RecentUploadsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];

  const items = [
    { id: '1', name: 'Linen Casual Shirt', category: 'Top Wear', color: '#FDFBF7' },
    { id: '2', name: 'Denim Shorts', category: 'Bottom Wear', color: '#94A3B8' },
    { id: '3', name: 'White Classic Sneakers', category: 'Footwear', color: '#FFFFFF' },
    { id: '4', name: 'Leather Tan Belt', category: 'Accessories', color: '#78350F' },
    { id: '5', name: 'Summer Knit Polo', category: 'Top Wear', color: '#F8DCCB' },
    { id: '6', name: 'Chino Light Pants', category: 'Bottom Wear', color: '#E2E8F0' },
  ];

  const filteredItems = activeFilter === 'All' 
    ? items 
    : items.filter(item => item.category === activeFilter);

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
        <View style={styles.placeholder} />
      </View>

      {/* Filter Row Horizontal Slider */}
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

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Wardrobe Items Grid */}
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={32} color={colors.textSecondary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
            </View>
          ))}
        </View>

        {filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="folder-minus" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>Upload items in wardrobe to customize your style suggestions.</Text>
          </View>
        )}
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
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterSlider: {
    paddingHorizontal: 16,
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
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  info: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});
