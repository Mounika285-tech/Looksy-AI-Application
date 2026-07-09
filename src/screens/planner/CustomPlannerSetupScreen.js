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
import { ref, onValue, push, set, update } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const CustomPlannerSetupScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [plannedDate, setPlannedDate] = useState('Tomorrow');
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  const editPlanId = route?.params?.editPlanId;
  const currentPlan = route?.params?.currentPlan;

  useEffect(() => {
    if (editPlanId && currentPlan) {
      setPlannedDate(currentPlan.plannedDate || 'Tomorrow');
      const outfits = favoriteOutfits.length > 0 ? favoriteOutfits : fallbackOutfits;
      const matching = outfits.find(o => o.name === currentPlan.name);
      if (matching) {
        setSelectedOutfit(matching);
      } else {
        setSelectedOutfit({
          id: 'edit_mock',
          name: currentPlan.name,
          items: currentPlan.items,
        });
      }
    }
  }, [editPlanId, currentPlan, favoriteOutfits]);

  const dates = ['Today', 'Tomorrow', 'This Weekend'];

  const fallbackOutfits = [
    {
      id: 'fb_outfit_1',
      name: 'Gallery Opening Night',
      type: 'Mix & Match',
      items: {
        top: { id: 'fb_top_slip', name: 'Ivory Silk slip dress', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtW5eVHJ9MX0Mc_ooTyQ_Y2dyNu8FFJqtGiOqlGxeG9bd8tST2nw1n4eDIF-QK4I03D1kV9BEsXQAboEbC5prK_GhgYyppFYp1Q0hiOp-CjFGsWg3GMA4XuMob06CIiQUQU-xlg2Zq6nzlpBut8ekgWShAmKRPddxd8DzP_AkseULzeaicuV0nWOpR4Q7Si0lsl0Be6-X3VrtBT7jfP8hxguB0iX-20iGHLmXwEl3EMRVespKpK3I9HjgVlgG3c6x6bgaYqYTmVf4' },
        accessory: { id: 'fb_acc_trench', name: 'Classic Camel Trench', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrkXfdQu_MDw4w8v01V69ErBFw12nPB7Hp1p9oA786ghJWM_5UthMzRKPn5H4HNQr78fZ_JPdSHZNdYCUVGVdbxyDyY-q4ZW4iUcXbN6z6JzMAA26KYEkVj14YJXJYzhMdv9CMwDijvnVFZGz6oSDuR7ZXX8lz0UDNDtkUisX0FtN3kNddqrWHHbYGoAKvbfjMUXwpfwxRZlkGbohNKo4dMxCdmj4aGPHM4J7Qzg-hZnY5rdWG7mfZ46tkNes9OTzqhFjgIGqOpVI' },
      },
    },
    {
      id: 'fb_outfit_2',
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
        const parsedFavs = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setFavoriteOutfits(parsedFavs);
      } else {
        setFavoriteOutfits([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching favorites for custom planner:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const displayOutfits = favoriteOutfits.length > 0 ? favoriteOutfits : fallbackOutfits;

  const handleSave = async () => {
    if (!selectedOutfit) return;

    try {
      if (!user) {
        Alert.alert('Planned!', `Outfit scheduled manually for ${plannedDate}.`);
        navigation.navigate('PlannerHome');
        return;
      }

      // Write plan to planner node
      const planRef = ref(database, `users/${user.uid}/planner`);
      const newPlanRef = push(planRef);

      const itemsData = {};
      Object.keys(selectedOutfit.items || {}).forEach((key) => {
        const item = selectedOutfit.items[key];
        if (item) {
          itemsData[key] = {
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            category: item.category || 'Wardrobe Item',
          };
        }
      });

      if (editPlanId) {
        // Update existing plan
        const planRef = ref(database, `users/${user.uid}/planner/${editPlanId}`);
        await update(planRef, {
          name: selectedOutfit.name,
          plannedDate: plannedDate,
          items: itemsData,
        });
        Alert.alert('Updated successfully!', `Look updated for ${plannedDate}.`);
      } else {
        // Write new plan to planner node
        await set(newPlanRef, {
          name: selectedOutfit.name,
          plannedDate: plannedDate,
          createdAt: Date.now(),
          notificationEnabled: true,
          items: itemsData,
        });
        Alert.alert('Scheduled successfully!', `Look planned for ${plannedDate}.`);
      }
      navigation.navigate('PlannerHome');
    } catch (e) {
      console.error('Error saving manual planned look:', e);
      Alert.alert('Oops!', 'Could not plan outfit. Please try again.');
    }
  };

  const renderOutfitItem = ({ item }) => {
    const isSelected = selectedOutfit?.id === item.id;
    const thumbnails = Object.values(item.items || {}).map((i) => i.imageUrl);

    return (
      <TouchableOpacity
        onPress={() => setSelectedOutfit(item)}
        activeOpacity={0.8}
        style={[
          styles.outfitCard,
          isSelected && styles.outfitCardSelected,
        ]}
      >
        {isSelected && (
          <View style={styles.selectCheck}>
            <Feather name="check" size={12} color={colors.white} />
          </View>
        )}
        
        {/* Row of preview thumbnails */}
        <View style={styles.previewImages}>
          {thumbnails.slice(0, 3).map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.thumbnail} />
          ))}
        </View>

        <Text style={styles.outfitName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.outfitType}>{item.type || 'Custom Curated'}</Text>
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
        <Text style={styles.headerTitle}>{editPlanId ? 'Edit Scheduled Look' : 'Custom Scheduler'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Select Date */}
        <View style={styles.stepSection}>
          <Text style={styles.stepTitle}>1. Choose Day</Text>
          <View style={styles.dateSelector}>
            {dates.map((date) => {
              const isActive = plannedDate === date;
              return (
                <TouchableOpacity
                  key={date}
                  onPress={() => setPlannedDate(date)}
                  style={[
                    styles.dateTab,
                    isActive && styles.dateTabActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dateTabText,
                      isActive && styles.dateTabTextActive,
                    ]}
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Choose look */}
        <View style={styles.stepSection}>
          <Text style={styles.stepTitle}>2. Choose Outfit Composition</Text>
          <Text style={styles.stepSubtitle}>
            Select one of your saved combinations or preset styles to schedule:
          </Text>

          {favoriteOutfits.length === 0 && !isLoading && (
            <View style={styles.noticeBox}>
              <Feather name="info" size={16} color={colors.primary} style={styles.noticeIcon} />
              <Text style={styles.noticeText}>
                No saved favorites found. Showing fallback outfits so you can plan your day!
              </Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={displayOutfits}
              renderItem={renderOutfitItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContent}
            />
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!selectedOutfit}
          style={[
            styles.actionBtn,
            !selectedOutfit && styles.actionBtnDisabled,
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>{editPlanId ? 'Update Scheduled Look' : 'Confirm Scheduled Look'}</Text>
          <Feather name="calendar" size={16} color={colors.white} style={styles.btnIcon} />
        </TouchableOpacity>
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
  stepSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dateTab: {
    width: '31%',
    height: 40,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dateTabActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  dateTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dateTabTextActive: {
    color: colors.text,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gridContent: {
    paddingBottom: 20,
  },
  outfitCard: {
    width: '46%',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: '2%',
    marginBottom: 16,
    padding: 12,
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  outfitCardSelected: {
    borderColor: colors.primary,
  },
  selectCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  previewImages: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 60,
    marginBottom: 10,
  },
  thumbnail: {
    width: 45,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: colors.surface,
    resizeMode: 'cover',
  },
  outfitName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  outfitType: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionBtn: {
    marginHorizontal: 24,
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  btnIcon: {
    marginLeft: 6,
  },
  loaderContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
