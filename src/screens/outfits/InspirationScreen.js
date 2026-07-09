import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { inspirationCategories } from '../../data/inspirationData';

export const InspirationScreen = ({ navigation }) => {
  const renderCategoryCard = ({ item }) => {
    // Generate soft, dynamic visual styles for cards
    const pastelColors = [
      '#F5EFEB', // Beige
      '#F8DCCB', // Blush
      '#EFE5DD', // Sand
      '#EAE6E1', // Taupe
      '#F3EFF5', // Lavender haze
      '#E8EFF5', // Blue haze
    ];
    // Map category to a soft color based on its string length or index
    const index = inspirationCategories.indexOf(item);
    const cardBg = pastelColors[index % pastelColors.length];

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('InspirationGallery', {
            categoryId: item.id,
            categoryName: item.name,
          })
        }
        activeOpacity={0.8}
        style={[styles.categoryCard, { backgroundColor: cardBg }]}
      >
        <View style={styles.iconWrapper}>
          <Feather name={item.icon} size={24} color={colors.primary} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.exploreText}>Explore Style</Text>
          <Feather name="arrow-right" size={12} color={colors.primary} />
        </View>
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
        <Text style={styles.headerTitle}>Inspiration Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Discover Your Look</Text>
          <Text style={styles.heroSubtitle}>
            Browse expert-curated style lookbooks to inspire your daily outfit choices.
          </Text>
        </View>

        <FlatList
          data={inspirationCategories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContent}
        />
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'space-between',
    minHeight: 140,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  exploreText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
