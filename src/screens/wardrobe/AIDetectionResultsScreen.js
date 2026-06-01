import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ref, push, set } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const AIDetectionResultsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { imageUrl, editedData } = route.params;
  const [isSaving, setIsSaving] = useState(false);

  // Default detected data
  const [itemData, setItemData] = useState({
    name: 'New Wardrobe Item',
    category: 'Top Wear',
    colorName: 'Beige',
    colorHex: '#F5EFEB',
    pattern: 'Solid',
    season: 'Summer',
    occasion: 'Casual',
    imageUrl,
  });

  // Update item data if returned from EditDetailsScreen
  useEffect(() => {
    if (editedData) {
      setItemData((prev) => ({ ...prev, ...editedData }));
    }
  }, [editedData]);

  const handleSaveItem = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Reference to database path: users/{uid}/wardrobe
      const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
      const newItemRef = push(wardrobeRef);
      
      await set(newItemRef, {
        ...itemData,
        createdAt: Date.now(),
      });

      Alert.alert('Success', 'Item successfully added to your digital wardrobe!', [
        {
          text: 'Ok',
          onPress: () => {
            // Navigate back to the main Wardrobe Grid
            navigation.navigate('WardrobeGrid');
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Save Failed', 'Failed to save item details to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const attributeLabels = [
    { key: 'category', label: 'Category', icon: 'layers' },
    { key: 'colorName', label: 'Color', icon: 'eye' },
    { key: 'pattern', label: 'Pattern', icon: 'grid' },
    { key: 'season', label: 'Season', icon: 'sun' },
    { key: 'occasion', label: 'Occasion', icon: 'award' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Detection Results</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('WardrobeGrid')}
          style={styles.cancelBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Upper Preview Card */}
        <View style={styles.previewCard}>
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          <View style={styles.nameSection}>
            <Text style={styles.itemName}>{itemData.name}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditDetails', { item: itemData })}
              style={styles.editNameBtn}
              activeOpacity={0.7}
            >
              <Feather name="edit-2" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Scan Tag Label */}
        <View style={styles.aiTagBadge}>
          <Feather name="cpu" size={14} color={colors.primary} style={styles.cpuIcon} />
          <Text style={styles.aiTagText}>Auto-detected with LookSy AI</Text>
        </View>

        {/* Detected Attribute Cards */}
        <View style={styles.attributesCard}>
          {attributeLabels.map((attr, index) => {
            const val = itemData[attr.key];
            const isColor = attr.key === 'colorName';
            return (
              <View key={attr.key} style={[styles.attrRow, index === attributeLabels.length - 1 && styles.noBorder]}>
                <View style={styles.attrTitleCol}>
                  <Feather name={attr.icon} size={18} color={colors.textSecondary} />
                  <Text style={styles.attrLabel}>{attr.label}</Text>
                </View>
                <View style={styles.attrValCol}>
                  {isColor && (
                    <View style={[styles.colorBadgeCircle, { backgroundColor: itemData.colorHex }]} />
                  )}
                  <Text style={styles.attrValText}>{val}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actions}>
          <Button
            title="Save to Wardrobe"
            variant="primary"
            onPress={handleSaveItem}
            loading={isSaving}
            style={styles.saveBtn}
          />
          <Button
            title="Edit Attributes Manually"
            variant="outline"
            onPress={() => navigation.navigate('EditDetails', { item: itemData })}
            style={styles.editBtn}
          />
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  previewImage: {
    height: 300,
    width: '100%',
    backgroundColor: colors.surface,
    resizeMode: 'cover',
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  editNameBtn: {
    padding: 8,
  },
  aiTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 90, 91, 0.06)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 90, 91, 0.1)',
  },
  cpuIcon: {
    marginRight: 6,
  },
  aiTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  attributesCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 32,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  attrTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attrLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 12,
  },
  attrValCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBadgeCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attrValText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  actions: {
    width: '100%',
  },
  saveBtn: {
    marginBottom: 14,
  },
  editBtn: {
    // outline styled
  },
});
