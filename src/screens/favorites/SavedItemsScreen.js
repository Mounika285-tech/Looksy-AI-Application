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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const SavedItemsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic favorite closet items

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
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((item) => item.isFavorite === true);
        setItems(parsed.reverse());
      } else {
        setItems([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching wardrobe in saved items list:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const displayItems = items;

  const handleToggleFavorite = async (item) => {
    try {
      if (!user) return;
      const itemRef = ref(database, `users/${user.uid}/wardrobe/${item.id}`);
      const nextStatus = !item.isFavorite;
      await update(itemRef, { isFavorite: nextStatus });
    } catch (e) {
      console.error('Error toggling closet item favorite status:', e);
      Alert.alert('Oops!', 'Could not toggle favorite status. Try again.');
    }
  };

  const renderItem = ({ item }) => {
    const isFav = item.isFavorite;
    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        
        {/* Heart button */}
        <TouchableOpacity
          onPress={() => handleToggleFavorite(item)}
          style={styles.heartBtn}
          activeOpacity={0.8}
        >
          <Feather
            name={isFav ? 'heart' : 'heart'}
            size={18}
            color={isFav ? colors.primary : colors.textSecondary}
            style={isFav && styles.heartFilled}
          />
        </TouchableOpacity>

        <View style={styles.meta}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Saved Items</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading Closet Items...</Text>
        </View>
      ) : displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Feather name="heart" size={28} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No Saved Items</Text>
          <Text style={styles.emptyText}>Heart items in your wardrobe closet to see them displayed here in real-time.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('WardrobeTab')}
            style={styles.browseBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.browseBtnText}>Browse Wardrobe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
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
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  itemCard: {
    width: '46%',
    backgroundColor: colors.white,
    borderRadius: 24,
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
    width: '100%',
    height: 140,
    backgroundColor: colors.surface,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  },
  heartFilled: {
    // Fill color handled dynamically
  },
  meta: {
    padding: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
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
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  browseBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
