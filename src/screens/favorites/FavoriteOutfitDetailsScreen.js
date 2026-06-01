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
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const FavoriteOutfitDetailsScreen = ({ navigation, route }) => {
  const { outfitId } = route.params;
  const { user } = useAuth();
  const [outfit, setOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [plannedDate, setPlannedDate] = useState('Tomorrow');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const favRef = ref(database, `users/${user.uid}/favorite_outfits/${outfitId}`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOutfit(data);
      } else {
        setOutfit(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching favorite outfit details:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, outfitId]);

  const handleDeleteOutfit = () => {
    Alert.alert(
      'Remove Favorite?',
      'Are you sure you want to remove this outfit from your Saved Favorites collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) {
                navigation.goBack();
                return;
              }
              const favRef = ref(database, `users/${user.uid}/favorite_outfits/${outfitId}`);
              await remove(favRef);
              Alert.alert('Removed!', 'Outfit successfully removed from Saved Favorites.');
              navigation.navigate('FavoritesHome');
            } catch (e) {
              console.error('Error deleting favorite outfit:', e);
              Alert.alert('Oops!', 'Could not delete outfit.');
            }
          }
        }
      ]
    );
  };

  const handleSaveToPlanner = async () => {
    try {
      if (!user) {
        setShowPlannerModal(false);
        Alert.alert('Planned!', `Outfit scheduled for ${plannedDate}.`);
        return;
      }

      // Save planned outfit to planner database node
      const plannerRef = ref(database, `users/${user.uid}/planner`);
      const newPlannerRef = push(plannerRef);

      const itemsData = {};
      Object.keys(outfit.items || {}).forEach((key) => {
        const item = outfit.items[key];
        if (item) {
          itemsData[key] = {
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            category: item.category || 'Garment',
          };
        }
      });

      await set(newPlannerRef, {
        name: outfit.name,
        plannedDate: plannedDate,
        createdAt: Date.now(),
        notificationEnabled: true,
        items: itemsData,
      });

      setShowPlannerModal(false);
      Alert.alert('Outfit Scheduled!', `This look is planned successfully for ${plannedDate}.`);
    } catch (e) {
      console.error('Error planning outfit from favorites:', e);
      Alert.alert('Error', 'Failed to plan outfit.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading Outfit Breakdown...</Text>
      </View>
    );
  }

  if (!outfit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Outfit not found or removed.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Return to Favorites</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Outfit Composition</Text>
        <TouchableOpacity
          onPress={handleDeleteOutfit}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Visual Preview */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRhxDqoVBJSq9FTQ42L8CfLsC8svI_uBw9aj5wbqnFng54VF_TNvQTta8la3aswE-yEl86VAJEh9ctaQc-kQzP2TqwTWxXOnfmvcmssVcW5DafnGyPSeNPpovaKVR1XWxfeprFxHtqF4qsm9DxV-8CbEVFQfM4HscArD91R5JlUMc8qcryUkmgURQPW73ooLLq_KTApruMuvpKsEBkJN871BaWoL0Rh_zScsSknOOMlI4BGwkngE8AyJv4HAAnOuNhTRV69G1NPWk' }}
            style={styles.heroImage}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{outfit.type || 'CURATION'}</Text>
            </View>
            <Text style={styles.heroTitleText}>{outfit.name}</Text>
          </View>
        </View>

        {/* Breakdown section */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Composition Breakdown</Text>
          
          <View style={styles.gridContainer}>
            {Object.keys(outfit.items || {}).map((key) => {
              const item = outfit.items[key];
              if (!item) return null;
              return (
                <View key={item.id} style={styles.itemBox}>
                  <View style={styles.imgWrapper}>
                    <Image source={{ uri: item.imageUrl }} style={styles.boxImg} />
                  </View>
                  <Text style={styles.boxCategory} numberOfLines={1}>{item.category || 'Garment'}</Text>
                  <Text style={styles.boxName} numberOfLines={1}>{item.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Schedule Planner button */}
        <View style={styles.planningPanel}>
          <TouchableOpacity
            onPress={() => setShowPlannerModal(true)}
            style={styles.planBtn}
            activeOpacity={0.8}
          >
            <Feather name="calendar" size={18} color={colors.primary} style={styles.planIcon} />
            <Text style={styles.planBtnText}>Schedule in Outfit Planner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Scheduler Modal */}
      <Modal visible={showPlannerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Plan This Outfit</Text>
            <Text style={styles.modalSubtitle}>Select which day you'd like to schedule this look:</Text>

            <View style={styles.dateSelector}>
              {['Today', 'Tomorrow', 'This Weekend'].map((date) => {
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

            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setShowPlannerModal(false)}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveToPlanner}
                style={styles.saveBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Confirm Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  deleteBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 42, 41, 0.45)',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  heroTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  breakdownSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemBox: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 2,
  },
  imgWrapper: {
    height: 110,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  boxImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  boxCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  boxName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  planningPanel: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  planBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIcon: {
    marginRight: 8,
  },
  planBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 42, 41, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width - 48,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateTab: {
    width: '30%',
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dateTabTextActive: {
    color: colors.text,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    width: '46%',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveBtn: {
    width: '46%',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    fontWeight: '600',
  },
  actionBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
