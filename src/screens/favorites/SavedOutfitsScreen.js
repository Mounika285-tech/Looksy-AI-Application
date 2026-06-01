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

export const SavedOutfitsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackOutfits = [
    {
      id: 'fb_fav_o1',
      name: 'Gallery Opening Night',
      type: 'Mix & Match',
      items: {
        top: { id: 'fb_top_slip', name: 'Ivory Silk slip dress', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtW5eVHJ9MX0Mc_ooTyQ_Y2dyNu8FFJqtGiOqlGxeG9bd8tST2nw1n4eDIF-QK4I03D1kV9BEsXQAboEbC5prK_GhgYyppFYp1Q0hiOp-CjFGsWg3GMA4XuMob06CIiQUQU-xlg2Zq6nzlpBut8ekgWShAmKRPddxd8DzP_AkseULzeaicuV0nWOpR4Q7Si0lsl0Be6-X3VrtBT7jfP8hxguB0iX-20iGHLmXwEl3EMRVespKpK3I9HjgVlgG3c6x6bgaYqYTmVf4' },
        accessory: { id: 'fb_acc_trench', name: 'Classic Camel Trench', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrkXfdQu_MDw4w8v01V69ErBFw12nPB7Hp1p9oA786ghJWM_5UthMzRKPn5H4HNQr78fZ_JPdSHZNdYCUVGVdbxyDyY-q4ZW4iUcXbN6z6JzMAA26KYEkVj14YJXJYzhMdv9CMwDijvnVFZGz6oSDuR7ZXX8lz0UDNDtkUisX0FtN3kNddqrWHHbYGoAKvbfjMUXwpfwxRZlkGbohNKo4dMxCdmj4aGPHM4J7Qzg-hZnY5rdWG7mfZ46tkNes9OTzqhFjgIGqOpVI' },
      },
    },
    {
      id: 'fb_fav_o2',
      name: 'Client Brunch Elegant',
      type: 'Weather Styling',
      items: {
        top: { id: 'fb_top_knit', name: 'Cashmere Knit Sweater', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-XvHWjWK07Ld-DBL_Lb312kVwDvIOVw6gQODMZNfQ4GgEacUlnNbwEdcyRPQkejbH63QMDIuDx0CBR0kV0Ki1H3MuPYmeZ0OE674RpPQDSUMr5sagXgbPDaGfUJnkdpexzEfP_yDIdPFabadIfkkGG3t2yJ9KhB5BKmUPG-IjNSvsZDJ2kUFq5gRVYVe8EEeNdnHhJay0rJj5PsmVybsTnenHQ7WZcifhN13EX8--i_8vypptRPmUraq5ZlO7D8I5wpMvd79lZXA' },
        bottom: { id: 'fb_bottom_wide', name: 'Wide-Leg White Trousers', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoh0N90yJ5MDl6c1pJQoMgj1_69saIexO5gQiJ4lsrVp-KZQCq0BrnV4-gIf9ut0WGlJsJQh5q_ySJ7NisQE1JNmBYKYG1djb1njjUCdoUaVh059CIizjauo6-mu1Epcd74XMlfb5h5KbI728vclCQuSfooidiDEf8Mt0vSu2ITNU00Dh-eOjbZMotUlmCbQEaGI6de-eJEGGsuKVFo--KbehadqfG_Hfi0dUrZqO6Xn9c1033-hNhkL5YWRvM6QthGfcHxPkgK_Y' },
      },
    },
  ];

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

  const displayOutfits = favoriteOutfits.length > 0 ? favoriteOutfits : fallbackOutfits;

  const renderOutfitItem = ({ item }) => {
    const thumbnails = Object.values(item.items || {}).map((i) => i.imageUrl);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('FavoriteOutfitDetails', { outfitId: item.id })}
        activeOpacity={0.8}
        style={styles.outfitCard}
      >
        <View style={styles.previewImages}>
          {thumbnails.slice(0, 3).map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.thumbnail} />
          ))}
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

      {favoriteOutfits.length === 0 && !isLoading && (
        <View style={styles.fallbackNotice}>
          <Feather name="info" size={16} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.fallbackNoticeText}>
            Showing Fallback Curated Combinations since you haven't favorited any outfits yet. Start styling to build your collection!
          </Text>
        </View>
      )}

      {/* Main Grid List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading Outfits Gallery...</Text>
        </View>
      ) : (
        <FlatList
          data={displayOutfits}
          renderItem={renderOutfitItem}
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
});
