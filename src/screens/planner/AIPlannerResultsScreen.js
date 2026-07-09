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
import { useAuth } from '../../context/AuthContext';
import { ref, get, push, set } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { generateWeeklyPlanner } from '../../utils/geminiService';

export const AIPlannerResultsScreen = ({ navigation, route }) => {
  const { vibe, weatherSync } = route.params;
  const { user } = useAuth();
  const [weeklyDrafts, setWeeklyDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmptyState, setIsEmptyState] = useState(false);

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  useEffect(() => {
    generateAIWeek();
  }, [vibe]);

  const generateAIWeek = async () => {
    try {
      setIsLoading(true);
      setIsEmptyState(false);
      
      let closetItems = [];
      if (user) {
        // Fetch user closet wardrobe
        const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
        const snapshot = await get(wardrobeRef);
        const data = snapshot.val();

        if (data) {
          closetItems = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
        }
      }

      if (closetItems.length === 0) {
        setIsEmptyState(true);
        setIsLoading(false);
        return;
      }

      // Query real Gemini AI Weekly style generator
      const resultPlans = await generateWeeklyPlanner(
        closetItems,
        vibe,
        weatherSync ? 'Syncing localized climate' : 'Standard seasonal climate'
      );

      // Assign dynamic indices or ids
      const mapped = resultPlans.map((plan, idx) => ({
        id: `draft_${idx}`,
        label: plan.plannedDate || weekDays[idx],
        name: plan.name || `${plan.plannedDate || 'Scheduled'} ${vibe} Look`,
        items: plan.items || {},
        suggestedAdditions: plan.suggestedAdditions || {},
      }));

      setWeeklyDrafts(mapped);
      setIsLoading(false);
    } catch (e) {
      console.error('Error auto generating week planner:', e);
      setWeeklyDrafts(createFallbackWeek(closetItems));
      setIsLoading(false);
    }
  };

  const createFallbackWeek = (closetItems) => {
    const closet = closetItems || [];
    const tops = closet.filter(i => i.category === 'Top Wear');
    const bottoms = closet.filter(i => i.category === 'Bottom Wear');

    const getRand = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    return weekDays.map((day, idx) => {
      const selectedTop = getRand(tops);
      const selectedBottom = getRand(bottoms);

      return {
        id: `draft_${idx}`,
        label: day,
        name: `${day} ${vibe} Look`,
        items: {
          top: selectedTop,
          bottom: selectedBottom,
        },
        suggestedAdditions: {
          top: selectedTop ? null : 'top wear',
          bottom: selectedBottom ? null : 'bottom wear',
          footwear: 'classic shoes',
          accessory: 'leather belt',
        }
      };
    });
  };

  const handleApplySchedule = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        Alert.alert('Applied!', 'Weekly AI planner scheduled successfully.');
        navigation.navigate('PlannerHome');
        return;
      }

      // Bulk write all 7 days to users/${user.uid}/planner
      const plannerRef = ref(database, `users/${user.uid}/planner`);
      
      for (let i = 0; i < weeklyDrafts.length; i++) {
        const draft = weeklyDrafts[i];
        const newPlanRef = push(plannerRef);

        const itemsData = {};
        Object.keys(draft.items || {}).forEach((key) => {
          const val = draft.items[key];
          if (val) {
            itemsData[key] = {
              id: val.id || '',
              name: val.name || '',
              imageUrl: val.imageUrl || '',
              category: val.category || 'Garment',
            };
          }
        });

        await set(newPlanRef, {
          name: draft.name,
          plannedDate: draft.label,
          createdAt: Date.now(),
          notificationEnabled: true,
          items: itemsData,
        });
      }

      Alert.alert('AI Schedule Applied!', '7 days of planned outfits added to your calendar successfully.');
      navigation.navigate('PlannerHome');
    } catch (e) {
      console.error('Error applying bulk AI planner schedule:', e);
      Alert.alert('Error', 'Failed to apply schedule.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>LookSy AI is scanning styling rules and weather forecasts...</Text>
      </View>
    );
  }

  if (isEmptyState) {
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
          <Text style={styles.headerTitle}>AI Draft Schedule</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="folder-plus" size={48} color={colors.primary} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Your Wardrobe is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Please upload garments in the Wardrobe tab first so LookSy AI can schedule your weekly outfits!
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('WardrobeTab')}
            style={styles.uploadBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadBtnText}>Go to Wardrobe</Text>
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
        <Text style={styles.headerTitle}>AI Draft Schedule</Text>
        <TouchableOpacity
          onPress={generateAIWeek}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Review Styling Drafts</Text>
          <Text style={styles.introSubtitle}>
            Here is your dynamic lookbook for the upcoming week based on your {vibe} preference. Tap apply to publish.
          </Text>
        </View>

        {/* 7 day list breakdown */}
        <View style={styles.draftList}>
          {weeklyDrafts.map((draft) => {
            const itemsList = Object.values(draft.items || {}).filter(Boolean);
            const thumbnails = itemsList.map((i) => i.imageUrl).filter(Boolean);
            const itemNames = itemsList.map((i) => i.name).filter(Boolean).join(' & ');
            
            // Check missing categories and build advice
            const missingCats = [];
            if (!draft.items?.top && draft.suggestedAdditions?.top) missingCats.push(`Top (${draft.suggestedAdditions.top})`);
            if (!draft.items?.bottom && draft.suggestedAdditions?.bottom) missingCats.push(`Bottom (${draft.suggestedAdditions.bottom})`);
            if (!draft.items?.footwear && draft.suggestedAdditions?.footwear) missingCats.push(`Shoes (${draft.suggestedAdditions.footwear})`);
            if (!draft.items?.accessory && draft.suggestedAdditions?.accessory) missingCats.push(`Accessory (${draft.suggestedAdditions.accessory})`);

            return (
              <View key={draft.id} style={styles.draftCard}>
                <View style={styles.draftRow}>
                  <View style={styles.draftMeta}>
                    <Text style={styles.draftDayText}>{draft.label}</Text>
                    <Text style={styles.draftNameText}>{draft.name}</Text>
                    <Text style={styles.draftStyleText} numberOfLines={1}>
                      {itemNames || 'Empty Outfit'}
                    </Text>
                  </View>
                  <View style={styles.thumbsWrapper}>
                    {thumbnails.length > 0 ? (
                      thumbnails.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.thumbnail} />
                      ))
                    ) : (
                      <View style={styles.emptyThumb}>
                        <Feather name="slash" size={14} color={colors.textSecondary} />
                      </View>
                    )}
                  </View>
                </View>
                {missingCats.length > 0 && (
                  <View style={styles.warningContainer}>
                    <Feather name="info" size={11} color={colors.primary} style={styles.warningIcon} />
                    <Text style={styles.warningText}>
                      Missing: {missingCats.join(', ')}.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Bulk Apply Button */}
        <TouchableOpacity
          onPress={handleApplySchedule}
          style={styles.actionBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Apply Weekly Schedule</Text>
          <Feather name="check" size={18} color={colors.white} style={styles.btnIcon} />
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
  refreshBtn: {
    padding: 8,
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  introSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },
  draftList: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  draftCard: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftMeta: {
    flex: 1,
    marginRight: 12,
  },
  draftDayText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  draftNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  draftStyleText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  thumbsWrapper: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 40,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginLeft: 6,
    resizeMode: 'cover',
  },
  emptyThumb: {
    width: 40,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accentDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  warningIcon: {
    marginRight: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionBtn: {
    marginHorizontal: 24,
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
  actionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  btnIcon: {
    marginLeft: 6,
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
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background,
    paddingTop: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '600',
  },
  uploadBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
