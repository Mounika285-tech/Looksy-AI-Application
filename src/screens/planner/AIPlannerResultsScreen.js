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
  const { vibe, weatherSync, accessories } = route.params;
  const { user } = useAuth();
  const [weeklyDrafts, setWeeklyDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // High-fidelity fallback styling items
  const fallbacks = {
    top: { id: 'fb_ai_t', name: 'Ivory Silk slip dress', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtW5eVHJ9MX0Mc_ooTyQ_Y2dyNu8FFJqtGiOqlGxeG9bd8tST2nw1n4eDIF-QK4I03D1kV9BEsXQAboEbC5prK_GhgYyppFYp1Q0hiOp-CjFGsWg3GMA4XuMob06CIiQUQU-xlg2Zq6nzlpBut8ekgWShAmKRPddxd8DzP_AkseULzeaicuV0nWOpR4Q7Si0lsl0Be6-X3VrtBT7jfP8hxguB0iX-20iGHLmXwEl3EMRVespKpK3I9HjgVlgG3c6x6bgaYqYTmVf4' },
    accessory: { id: 'fb_ai_a', name: 'Classic Camel Trench', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrkXfdQu_MDw4w8v01V69ErBFw12nPB7Hp1p9oA786ghJWM_5UthMzRKPn5H4HNQr78fZ_JPdSHZNdYCUVGVdbxyDyY-q4ZW4iUcXbN6z6JzMAA26KYEkVj14YJXJYzhMdv9CMwDijvnVFZGz6oSDuR7ZXX8lz0UDNDtkUisX0FtN3kNddqrWHHbYGoAKvbfjMUXwpfwxRZlkGbohNKo4dMxCdmj4aGPHM4J7Qzg-hZnY5rdWG7mfZ46tkNes9OTzqhFjgIGqOpVI' },
    bottom: { id: 'fb_ai_b', name: 'Wide-Leg White Trousers', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoh0N90yJ5MDl6c1pJQoMgj1_69saIexO5gQiJ4lsrVp-KZQCq0BrnV4-gIf9ut0WGlJsJQh5q_ySJ7NisQE1JNmBYKYG1djb1njjUCdoUaVh059CIizjauo6-mu1Epcd74XMlfb5h5KbI728vclCQuSfooidiDEf8Mt0vSu2ITNU00Dh-eOjbZMotUlmCbQEaGI6de-eJEGGsuKVFo--KbehadqfG_Hfi0dUrZqO6Xn9c1033-hNhkL5YWRvM6QthGfcHxPkgK_Y' },
  };

  const weekDays = [
    { label: 'MON 11', name: 'Gallery Opening Night', fallbackTop: fallbacks.top, fallbackAcc: fallbacks.accessory },
    { label: 'TUE 12', name: 'Client Brunch', fallbackTop: fallbacks.top, fallbackAcc: fallbacks.bottom },
    { label: 'WED 13', name: 'Weekend Getaway Prep', fallbackTop: fallbacks.bottom, fallbackAcc: fallbacks.accessory },
    { label: 'THU 14', name: 'Business Board Meeting', fallbackTop: fallbacks.top, fallbackAcc: fallbacks.accessory },
    { label: 'FRI 15', name: 'Leisure Coffee Date', fallbackTop: fallbacks.top, fallbackAcc: fallbacks.bottom },
    { label: 'SAT 16', name: 'Weekend Beach Walk', fallbackTop: fallbacks.bottom, fallbackAcc: fallbacks.accessory },
    { label: 'SUN 17', name: 'Sunday Dinner Gala', fallbackTop: fallbacks.top, fallbackAcc: fallbacks.accessory },
  ];

  useEffect(() => {
    generateAIWeek();
  }, [vibe]);

  const generateAIWeek = async () => {
    try {
      setIsLoading(true);
      
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

      // Query real Gemini AI Weekly style generator
      const resultPlans = await generateWeeklyPlanner(
        closetItems,
        vibe,
        weatherSync ? 'Syncing localized climate' : 'Standard seasonal climate'
      );

      // Assign dynamic indices or ids
      const mapped = resultPlans.map((plan, idx) => ({
        id: `draft_${idx}`,
        label: plan.plannedDate || weekDays[idx].label,
        name: plan.name || `${plan.plannedDate || 'Scheduled'} ${vibe} Look`,
        items: plan.items
      }));

      setWeeklyDrafts(mapped);
      setIsLoading(false);
    } catch (e) {
      console.error('Error auto generating week planner:', e);
      setWeeklyDrafts(createFallbackWeek());
      setIsLoading(false);
    }
  };

  const selectRandom = (pool, fallback) => {
    if (pool.length === 0) return fallback;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  };

  const createFallbackWeek = () => {
    return weekDays.map((day, idx) => ({
      id: `draft_${idx}`,
      label: day.label,
      name: day.name,
      items: {
        top: day.fallbackTop,
        bottom: day.fallbackAcc,
      },
    }));
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
        Object.keys(draft.items).forEach((key) => {
          const val = draft.items[key];
          if (val) {
            itemsData[key] = {
              id: val.id,
              name: val.name,
              imageUrl: val.imageUrl,
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
            return (
              <View key={draft.id} style={styles.draftRow}>
                <View style={styles.draftMeta}>
                  <Text style={styles.draftDayText}>{draft.label}</Text>
                  <Text style={styles.draftNameText}>{draft.name}</Text>
                  <Text style={styles.draftStyleText} numberOfLines={1}>
                    {itemNames || 'Empty Outfit'}
                  </Text>
                </View>
                <View style={styles.thumbsWrapper}>
                  {thumbnails.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={styles.thumbnail} />
                  ))}
                </View>
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
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
