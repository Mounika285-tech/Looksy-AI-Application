import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Feather } from '@expo/vector-icons';

export const TodaysOutfitScreen = ({ navigation }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);

  const outfit = {
    name: 'Summer Casual Chic',
    category: 'Casual',
    desc: 'An effortless sunny day outfit styled around classic comfortable tones and premium breathing fabrics.',
    items: [
      { id: '1', name: 'Beige Cotton Tee', type: 'Top Wear', color: '#F5EFEB', icon: 'server' },
      { id: '2', name: 'Light Blue Jeans', type: 'Bottom Wear', color: '#CBD5E1', icon: 'align-justify' },
      { id: '3', name: 'Minimalist White Sneakers', type: 'Footwear', color: '#FFFFFF', icon: 'circle' },
    ],
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    Alert.alert(
      isFavorited ? 'Removed' : 'Favorited',
      isFavorited ? 'Outfit removed from your favorites.' : 'Outfit successfully added to your favorites!'
    );
  };

  const handleAddToPlanner = () => {
    setIsPlanned(!isPlanned);
    Alert.alert(
      isPlanned ? 'Cancelled' : 'Planned',
      isPlanned ? 'Outfit removed from your calendar.' : 'Outfit successfully scheduled for today in your planner!'
    );
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
        <Text style={styles.headerTitle}>Today's Outfit</Text>
        <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteIconBtn} activeOpacity={0.7}>
          <Feather
            name={isFavorited ? 'heart' : 'heart'}
            size={20}
            color={isFavorited ? colors.primary : colors.textSecondary}
            style={isFavorited && styles.filledHeart}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Visual Outfit Preview Panel */}
        <View style={styles.previewPanel}>
          <View style={styles.previewDecoration}>
            <View style={styles.previewCircle} />
          </View>
          <Text style={styles.previewTitle}>{outfit.name}</Text>
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>{outfit.category}</Text>
          </View>
        </View>

        {/* Outfit Details Description */}
        <View style={styles.detailsHeader}>
          <Text style={styles.sectionTitle}>Style Description</Text>
          <Text style={styles.descriptionText}>{outfit.desc}</Text>
        </View>

        {/* Items Breakdown list */}
        <Text style={styles.sectionTitle}>Outfit Composition</Text>
        <View style={styles.itemsList}>
          {outfit.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={[styles.itemColorIcon, { backgroundColor: item.color }]} />
              <View style={styles.itemMeta}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>{item.type}</Text>
              </View>
              <Feather name={item.icon} size={18} color={colors.textSecondary} />
            </View>
          ))}
        </View>

        {/* Action button */}
        <Button
          title={isPlanned ? 'Scheduled (Remove)' : 'Schedule Outfit in Planner'}
          variant={isPlanned ? 'outline' : 'primary'}
          onPress={handleAddToPlanner}
          style={styles.actionBtn}
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
  favoriteIconBtn: {
    padding: 8,
  },
  filledHeart: {
    // Styling if favorited
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  previewPanel: {
    height: 180,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  previewDecoration: {
    position: 'absolute',
    opacity: 0.1,
  },
  previewCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.accentDark,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    zIndex: 1,
  },
  previewBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 1,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  detailsHeader: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  itemsList: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 32,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  itemColorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionBtn: {
    marginTop: 8,
  },
});
