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

export const PlannerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState(2); // Wednesday (13) highlighted by default

  const daysOfWeek = [
    { day: 'M', date: '11', name: 'Monday' },
    { day: 'T', date: '12', name: 'Tuesday' },
    { day: 'W', date: '13', name: 'Wednesday' },
    { day: 'T', date: '14', name: 'Thursday' },
    { day: 'F', date: '15', name: 'Friday' },
    { day: 'S', date: '16', name: 'Saturday' },
    { day: 'S', date: '17', name: 'Sunday' },
  ];

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const plannerRef = ref(database, `users/${user.uid}/planner`);
    const unsubscribe = onValue(plannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedPlans = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Sort by planned date or creation
        setPlans(parsedPlans.reverse());
      } else {
        setPlans([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching planner list:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderPlanItem = ({ item }) => {
    // Collect thumbnail images of items inside the plan
    const thumbnails = [];
    if (item.items) {
      Object.keys(item.items).forEach((key) => {
        const val = item.items[key];
        if (val && val.imageUrl) thumbnails.push(val.imageUrl);
      });
    }

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PlannedOutfitDetails', { planId: item.id })}
        activeOpacity={0.8}
        style={styles.planCard}
      >
        <View style={styles.planMeta}>
          <Text style={styles.planDateText}>{item.plannedDate ? item.plannedDate.toUpperCase() : 'TOMORROW'}</Text>
          <Text style={styles.planName}>{item.name || 'Casual Style'}</Text>
          <Text style={styles.planDetailsText} numberOfLines={1}>
            {item.description || Object.values(item.items || {}).map(i => i.name).join(' & ') || 'Custom curation'}
          </Text>
        </View>
        
        {/* Overlapping Thumbnails */}
        <View style={styles.thumbsContainer}>
          {thumbnails.slice(0, 2).map((uri, idx) => (
            <View key={idx} style={[styles.thumbWrapper, idx > 0 && styles.thumbOffset]}>
              <Image source={{ uri }} style={styles.thumbImage} />
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Premium Header */}
      <View style={styles.header}>
        <View style={styles.menuBtn}>
          <Feather name="menu" size={22} color={colors.primary} />
        </View>
        <Text style={styles.headerBrand}>LOOKSY AI</Text>
        <View style={styles.profileBadge}>
          <Feather name="user" size={18} color={colors.text} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Weekly dates slider */}
        <View style={styles.calendarSection}>
          <View style={styles.monthRow}>
            <Text style={styles.monthTitle}>September</Text>
            <Text style={styles.yearText}>2026</Text>
          </View>

          <View style={styles.dateSlider}>
            {daysOfWeek.map((day, idx) => {
              const isActive = selectedDayIdx === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedDayIdx(idx)}
                  activeOpacity={0.8}
                  style={styles.dayTab}
                >
                  <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>{day.day}</Text>
                  <View style={[
                    styles.dateCircle,
                    isActive && styles.dateCircleActive,
                  ]}>
                    <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{day.date}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Weekly planning CTA banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ChoosePlannerType')}
          activeOpacity={0.9}
          style={styles.ctaBanner}
        >
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxYaMaJAJo2srAFvUfWNl3rT1Dm_H8UJ0wVSG4kK-_0Pwzw0wGF-at4l2AiZ8cnmzwYZAHg3wyagl1Crp7DOH4KLUjvPkap4aDJCYC2ZxDrGsASZ_NvT8V91jF4ADVSwmM5heGhcntqXSF4c51nOC5_L9qq7hTvVZdJwt3iTW9oI4veoAzI1fI_YbQyETSexFP2VvpB1m5M05E5jhXDmA5P-TgUHZTvL7bQ24c8r4HQ50DomsYjniCW0AGIiiJhBzGDFGJBc8Ejs' }}
            style={styles.ctaBg}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Plan Your Week</Text>
            <Text style={styles.ctaSubtitle}>Curate 7 days of effortless style</Text>
          </View>
          <View style={styles.ctaIconBadge}>
            <Feather name="zap" size={18} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Planned ensembles list */}
        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>Planned Ensembles</Text>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : plans.length > 0 ? (
            <FlatList
              data={plans}
              renderItem={renderPlanItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>Nothing Planned Yet</Text>
              <Text style={styles.emptySubtitle}>
                Schedule wardrobe outfits for your upcoming calendar days to stay styled effortlessly.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ChoosePlannerType')}
                style={styles.emptyBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyBtnText}>Plan Outfit Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ChoosePlannerType')}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <Feather name="plus" size={28} color={colors.white} />
      </TouchableOpacity>
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
  menuBtn: {
    padding: 6,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  calendarSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dateSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayTab: {
    alignItems: 'center',
    width: '12%',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dayLabelActive: {
    color: colors.primary,
  },
  dateCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCircleActive: {
    backgroundColor: colors.primary,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  dateTextActive: {
    color: colors.white,
  },
  ctaBanner: {
    marginHorizontal: 24,
    height: 150,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 32,
  },
  ctaBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 42, 41, 0.4)',
  },
  ctaContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  ctaIconBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSection: {
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
    paddingLeft: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  planCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  planMeta: {
    flex: 1,
    marginRight: 12,
  },
  planDateText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  planDetailsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  thumbsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrapper: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.white,
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbOffset: {
    marginLeft: -16,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loaderContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 40,
  },
});
