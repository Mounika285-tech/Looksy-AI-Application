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

export const SavedOutfitsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const favRef = ref(database, `users/${user.uid}/favorite_outfits`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFavoriteOutfits(parsed.reverse());
      } else {
        setFavoriteOutfits([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching favorite outfits:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderOutfitItem = ({ item }) => {
    const thumbnails = Object.values(item.items || {}).map((i) => i.imageUrl).filter(Boolean);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('FavoriteOutfitDetails', { outfitId: item.id })}
        activeOpacity={0.8}
        style={styles.outfitCard}
      >
        <View style={styles.previewImages}>
          {thumbnails.length > 0 ? (
            thumbnails.slice(0, 3).map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.thumbnail} />
            ))
          ) : (
            <View style={styles.emptyPreview}>
              <Feather name="layers" size={24} color={colors.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.outfitName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.outfitType}>{item.type || 'Custom Stylist'}</Text>
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
        <Text style={styles.headerTitle}>Saved Outfits</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Grid List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading Outfits Gallery...</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteOutfits}
          renderItem={renderOutfitItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="heart" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Saved Outfits Yet</Text>
              <Text style={styles.emptySubtitle}>
                Save your curated looks from the Outfits tab to build your premium favorites gallery!
              </Text>
            </View>
          }
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
    flexGrow: 1,
  },
  outfitCard: {
    width: '46%',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: '2%',
    marginBottom: 16,
    padding: 14,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  previewImages: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 72,
    marginBottom: 12,
  },
  thumbnail: {
    width: 50,
    height: 72,
    borderRadius: 10,
    marginHorizontal: 2,
    backgroundColor: colors.surface,
    resizeMode: 'cover',
  },
  emptyPreview: {
    width: '100%',
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    alignItems: 'center',
  },
  outfitName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  outfitType: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
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
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
});
