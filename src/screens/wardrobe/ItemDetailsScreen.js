import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ref, get, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const ItemDetailsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { itemId } = route.params;

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || !itemId) return;

    const itemRef = ref(database, `users/${user.uid}/wardrobe/${itemId}`);
    get(itemRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setItem(snapshot.val());
        } else {
          Alert.alert('Error', 'Item not found in your wardrobe.');
          navigation.goBack();
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching item details:', error);
        Alert.alert('Error', 'Failed to retrieve item details.');
        navigation.goBack();
      });
  }, [user, itemId]);

  const handleDeleteItem = () => {
    Alert.alert(
      'Delete Wardrobe Item',
      'Are you sure you want to permanently delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const itemRef = ref(database, `users/${user.uid}/wardrobe/${itemId}`);
              await remove(itemRef);
              
              Alert.alert('Success', 'Item deleted from your wardrobe.', [
                {
                  text: 'Ok',
                  onPress: () => {
                    navigation.navigate('WardrobeGrid');
                  },
                },
              ]);
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Delete Failed', 'Failed to delete the item. Please try again.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const attributeLabels = [
    { key: 'category', label: 'Category', icon: 'layers' },
    { key: 'colorName', label: 'Color', icon: 'eye' },
    { key: 'pattern', label: 'Pattern', icon: 'grid' },
    { key: 'season', label: 'Suitable Season', icon: 'sun' },
    { key: 'occasion', label: 'Occasion', icon: 'award' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading Item Details...</Text>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Item Details</Text>
        <TouchableOpacity
          onPress={handleDeleteItem}
          style={styles.deleteHeaderBtn}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          <Feather name="trash-2" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Visual Item Card */}
        <View style={styles.previewCard}>
          <Image source={{ uri: item.imageUrl }} style={styles.previewImage} />
          <View style={styles.nameSection}>
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
        </View>

        {/* Attribute List */}
        <Text style={styles.sectionTitle}>Item Specifications</Text>
        <View style={styles.attributesCard}>
          {attributeLabels.map((attr, index) => {
            const val = item[attr.key];
            const isColor = attr.key === 'colorName';
            return (
              <View key={attr.key} style={[styles.attrRow, index === attributeLabels.length - 1 && styles.noBorder]}>
                <View style={styles.attrTitleCol}>
                  <Feather name={attr.icon} size={18} color={colors.textSecondary} />
                  <Text style={styles.attrLabel}>{attr.label}</Text>
                </View>
                <View style={styles.attrValCol}>
                  {isColor && (
                    <View style={[styles.colorBadgeCircle, { backgroundColor: item.colorHex }]} />
                  )}
                  <Text style={styles.attrValText}>{val}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delete CTA */}
        <Button
          title="Delete Item"
          variant="outline"
          onPress={handleDeleteItem}
          loading={isDeleting}
          style={styles.deleteBtn}
          textStyle={{ color: colors.primary }}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
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
  deleteHeaderBtn: {
    padding: 8,
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
    marginBottom: 28,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  previewImage: {
    height: 320,
    width: '100%',
    backgroundColor: colors.surface,
    resizeMode: 'cover',
  },
  nameSection: {
    padding: 16,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
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
  deleteBtn: {
    borderColor: colors.primary,
  },
});
