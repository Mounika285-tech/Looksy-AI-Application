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

  // Mock fallback items if closet is empty
  const fallbackItems = [
    {
      id: 'fb_item1',
      name: 'Ivory Silk Blouse',
      category: 'Top Wear',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkWqkR5PT7Bavl-4ujQPl8DZuSpY6oLPErC1MjdO_PObRL9j8GaonEC-ex0j7jxdiDUFog_QkNH6Bl34sAW6ahUhT4PDTuuY4NALKF06n9sJ3AWa-HdJc2g0DZPeJOikUc70nkH1caGEcw0BCvnt2pC5klyGsoecxn9zcGbVHQOutt6BzcQ-qpYBe9gwUmqTC4ISVDtr59TArPw2lyiVP4maclE7aevSktVh7HSqwLvGm3fPZ4eYNzOU082MuDsgBNCru_JGW6aX8',
      isFavorite: true,
    },
    {
      id: 'fb_item2',
      name: 'Wool Wide-Leg Trousers',
      category: 'Bottom Wear',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQpB5RNTvJARmGajGuy_rwCPsFDeu5dL2yZTwNnuTYlIBuuPepLWbkPkQan3uN5qmpZ4EFklHWrW3eSVPHY8ujqGh2ThUIJ0xszj7tk4PzMRdJ1MTtxWYJhwdRHrBbIZDUpbC-qXgCdwJqprDhnuE1Ex7V5ADmiDtKp78Qe_bmRyDtgaY3aqB6Ene2tv1PRTCfb5AiudckUh07Tk-7D1-Yu1IsjbI9ltLDd71cNSygMqQw0b0xJ8tklUYDp5q_ctM9NwniNNT1gfg',
      isFavorite: true,
    },
    {
      id: 'fb_item3',
      name: 'Classic Camel Trench Coat',
      category: 'Accessories',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tw2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM',
      isFavorite: false,
    },
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
        const parsed = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
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

  const displayItems = items.length > 0 ? items : fallbackItems;

  const handleToggleFavorite = async (item) => {
    if (item.id.startsWith('fb_')) {
      // Toggle local fallback states
      const nextList = displayItems.map((i) => {
        if (i.id === item.id) return { ...i, isFavorite: !i.isFavorite };
        return i;
      });
      setItems(nextList);
      return;
    }

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

      {items.length === 0 && !isLoading && (
        <View style={styles.fallbackNotice}>
          <Feather name="info" size={16} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.fallbackNoticeText}>
            Your digital closet is empty. Showing Fallback Essentials. Heart items to toggle favorites in real-time!
          </Text>
        </View>
      )}

      {/* Grid Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading Closet Items...</Text>
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
  fallbackNotice: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginTop: 16,
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
});
