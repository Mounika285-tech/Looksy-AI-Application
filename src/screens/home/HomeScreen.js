import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { generateSuggestions } from '../../utils/geminiService';

const { width } = Dimensions.get('window');

const WEATHER = { temp: 28, condition: 'Partly Cloudy', icon: 'cloud' };

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const HomeScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const userName = profile?.name || 'Stylist';
  const prefStyle = profile?.stylePreferences?.[0] || 'Casual';

  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [plannedOutfits, setPlannedOutfits] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for AI loading
  useEffect(() => {
    if (isLoadingAI) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoadingAI]);

  // High-fidelity static fallback suggestions
  const staticSuggestions = [
    {
      id: 'sug_1',
      name: `${prefStyle} Essentials`,
      desc: `A curated combination perfectly tailored for your ${prefStyle} aesthetic.`,
      style: prefStyle,
      color: colors.accent,
      icon: 'award',
    },
    {
      id: 'sug_2',
      name: 'Smart Office Formal',
      desc: 'Minimal blazer with tailored neutral trousers — classic authority.',
      style: 'Formal',
      color: '#E8E2DC',
      icon: 'briefcase',
    },
    {
      id: 'sug_3',
      name: 'Weekend Minimalist',
      desc: 'Comfortable essentials styled with premium classic textures.',
      style: 'Minimalist',
      color: colors.surfaceAlt,
      icon: 'sun',
    },
  ];

  useEffect(() => {
    if (!user) { setIsLoadingData(false); return; }

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubWardrobe = onValue(wardrobeRef, (snap) => {
      const data = snap.val();
      if (data) {
        const parsed = Object.keys(data)
          .map((k) => ({ id: k, ...data[k] }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setWardrobeItems(parsed);
      } else {
        setWardrobeItems([]);
      }
    });

    const plannerRef = ref(database, `users/${user.uid}/planner`);
    const unsubPlanner = onValue(plannerRef, (snap) => {
      const data = snap.val();
      if (data) {
        const parsed = Object.keys(data)
          .map((k) => ({ id: k, ...data[k] }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPlannedOutfits(parsed);
      } else {
        setPlannedOutfits([]);
      }
      setIsLoadingData(false);
    });

    return () => { unsubWardrobe(); unsubPlanner(); };
  }, [user]);

  // Fetch AI suggestions once wardrobe items load
  useEffect(() => {
    if (!isLoadingData && user) {
      fetchAISuggestions();
    }
  }, [isLoadingData, wardrobeItems.length]);

  const fetchAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const stylePrefs = profile?.stylePreferences || [prefStyle];
      const suggestions = await generateSuggestions(wardrobeItems, stylePrefs);
      if (suggestions && suggestions.length > 0) {
        setAiSuggestions(suggestions.slice(0, 4));
      } else {
        setAiSuggestions(staticSuggestions);
      }
    } catch (e) {
      console.error('Home AI suggestions failed:', e);
      setAiSuggestions(staticSuggestions);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Today's outfit from planner
  const todayPlanned = plannedOutfits.find((o) => o.plannedDate === 'Today') || plannedOutfits[0];
  const activeItems = todayPlanned
    ? Object.values(todayPlanned.items || {}).filter(Boolean).slice(0, 3)
    : [];

  const recentGridItems = wardrobeItems.slice(0, 4);

  // Default outfit fallback
  const defaultOutfitItems = [
    { id: 'fb1', category: 'Top Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4' },
    { id: 'fb2', category: 'Bottom Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE' },
    { id: 'fb3', category: 'Footwear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY' },
  ];

  const displayOutfitItems = activeItems.length > 0 ? activeItems : defaultOutfitItems;

  const handleOutfitCardPress = () => {
    if (todayPlanned) navigation.navigate('PlannerTab');
    else navigation.navigate('TodaysOutfit');
  };

  if (isLoadingData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Syncing your style dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName} ✨</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userName[0].toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Wardrobe Summary Pills */}
        {(wardrobeItems.length > 0 || plannedOutfits.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsSlider}>
            <View style={styles.statPill}>
              <Feather name="layers" size={13} color={colors.primary} />
              <Text style={styles.statPillText}>{wardrobeItems.length} Garments</Text>
            </View>
            <View style={styles.statPill}>
              <Feather name="calendar" size={13} color={colors.primary} />
              <Text style={styles.statPillText}>{plannedOutfits.length} Planned</Text>
            </View>
            <View style={styles.statPill}>
              <Feather name="star" size={13} color={colors.primary} />
              <Text style={styles.statPillText}>{prefStyle} Style</Text>
            </View>
          </ScrollView>
        )}

        {/* Weather Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('WeatherDetails')}
          activeOpacity={0.9}
          style={styles.weatherCard}
        >
          <View style={styles.weatherInfo}>
            <View style={styles.weatherTextGroup}>
              <Text style={styles.weatherTemp}>{WEATHER.temp}°C</Text>
              <Text style={styles.weatherStatus}>{WEATHER.condition}</Text>
            </View>
            <View style={styles.weatherRight}>
              <Feather name={WEATHER.icon} size={36} color={colors.primary} />
              <Text style={styles.weatherTapHint}>Tap for tips →</Text>
            </View>
          </View>
          <View style={styles.weatherTipDivider} />
          <Text style={styles.weatherTip}>
            💡 Perfect day for a <Text style={styles.boldTip}>{prefStyle}</Text> look! Comfort meets style.
          </Text>
        </TouchableOpacity>

        {/* Today's Outfit Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {todayPlanned ? "Today's Scheduled Look" : "Suggested Look"}
          </Text>
          <TouchableOpacity onPress={handleOutfitCardPress} activeOpacity={0.7}>
            <Text style={styles.viewAllBtn}>
              {todayPlanned ? 'View Planner' : 'See Details'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleOutfitCardPress}
          activeOpacity={0.9}
          style={styles.outfitCard}
        >
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitName} numberOfLines={1}>
              {todayPlanned?.name || 'Summer Casual Chic'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {todayPlanned ? 'PLAN' : 'AI PICK'}
              </Text>
            </View>
          </View>
          <View style={styles.outfitItemsRow}>
            {displayOutfitItems.slice(0, 3).map((item, index) => (
              <View key={item.id || index} style={styles.outfitItemDotWrapper}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.outfitItemThumbnail} />
                ) : (
                  <View style={[styles.outfitItemThumbnail, { backgroundColor: colors.surface }]} />
                )}
                <Text style={styles.outfitItemType} numberOfLines={1}>
                  {item.category || 'Garment'}
                </Text>
              </View>
            ))}
          </View>
          {todayPlanned && (
            <Text style={styles.plannedDateText}>
              <Feather name="clock" size={11} color={colors.textSecondary} /> Scheduled: {todayPlanned.plannedDate}
            </Text>
          )}
        </TouchableOpacity>

        {/* AI Recommendations Slider */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            {isLoadingAI && (
              <Animated.View style={{ opacity: pulseAnim, marginLeft: 8 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </Animated.View>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AISuggestions')} activeOpacity={0.7}>
            <Text style={styles.viewAllBtn}>Explore All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.aiSlider}
        >
          {(aiSuggestions.length > 0 ? aiSuggestions : staticSuggestions).map((suggestion, idx) => {
            // AI suggestions from geminiService have items object or array — extract item names dynamically
            let descText = suggestion.desc;
            if (!descText && suggestion.items) {
              if (Array.isArray(suggestion.items)) {
                descText = suggestion.items.join(' · ');
              } else if (typeof suggestion.items === 'object') {
                descText = Object.values(suggestion.items)
                  .filter(Boolean)
                  .map((item) => item.name)
                  .join(' · ');
              }
            }
            const ICONS = ['award', 'star', 'zap', 'sun', 'coffee', 'heart'];
            return (
              <TouchableOpacity
                key={suggestion.id || idx}
                onPress={() => navigation.navigate('AISuggestions')}
                activeOpacity={0.85}
                style={styles.suggestionCard}
              >
                <View style={[styles.suggestionIconWrapper, { backgroundColor: suggestion.color || colors.accent }]}>
                  <Feather name={suggestion.icon || ICONS[idx % ICONS.length]} size={20} color={colors.primary} />
                </View>
                <Text style={styles.suggestionTitle}>{suggestion.name}</Text>
                <Text style={styles.suggestionDesc} numberOfLines={3}>{descText}</Text>
                <View style={styles.suggestionFooter}>
                  <Text style={styles.suggestionStyle}>{suggestion.category || suggestion.style}</Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Recent Uploads Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {wardrobeItems.length > 0 ? `Recently Uploaded (${wardrobeItems.length})` : 'Recent Uploads'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentUploads')} activeOpacity={0.7}>
            <Text style={styles.viewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>

        {wardrobeItems.length > 0 ? (
          <View style={styles.recentGrid}>
            {wardrobeItems.slice(0, 4).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('RecentUploads')}
                activeOpacity={0.8}
                style={styles.recentCard}
              >
                <View style={styles.recentImageContainer}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.recentImage} />
                  ) : (
                    <View style={[styles.recentImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                      <Feather name="image" size={24} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recentCategory}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('WardrobeTab')}
            style={styles.emptyWardrobeCard}
            activeOpacity={0.85}
          >
            <Feather name="plus-circle" size={32} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyWardrobeTitle}>Start Your Digital Wardrobe</Text>
            <Text style={styles.emptyWardrobeText}>Upload garments to unlock AI-powered outfit curation</Text>
            <View style={styles.addGarmentBtn}>
              <Text style={styles.addGarmentBtnText}>Add First Garment →</Text>
            </View>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loaderText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginTop: 14 },
  scrollContainer: { paddingBottom: 40, paddingTop: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 18,
  },
  greeting: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '800', color: colors.text },
  avatarWrapper: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.border },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },

  statsSlider: { paddingHorizontal: 24, paddingBottom: 18, gap: 8, flexDirection: 'row' },
  statPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, gap: 5,
  },
  statPillText: { fontSize: 11, fontWeight: '700', color: colors.text },

  weatherCard: {
    marginHorizontal: 24, backgroundColor: colors.surface, borderRadius: 24,
    padding: 20, marginBottom: 28, borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  weatherInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherTextGroup: {},
  weatherTemp: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 4 },
  weatherStatus: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  weatherRight: { alignItems: 'center' },
  weatherTapHint: { fontSize: 10, fontWeight: '700', color: colors.primary, marginTop: 4 },
  weatherTipDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  weatherTip: { fontSize: 13, color: colors.text, lineHeight: 18 },
  boldTip: { fontWeight: '700', color: colors.primary },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 16,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  viewAllBtn: { fontSize: 13, fontWeight: '700', color: colors.primary },

  outfitCard: {
    marginHorizontal: 24, backgroundColor: colors.white, borderRadius: 24,
    padding: 20, marginBottom: 28, borderWidth: 1.5, borderColor: colors.border,
    shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  outfitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  outfitName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, marginRight: 10 },
  badge: { backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.text, textTransform: 'uppercase' },
  outfitItemsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  outfitItemDotWrapper: { flexDirection: 'row', alignItems: 'center', width: '30%' },
  outfitItemThumbnail: { width: 36, height: 36, borderRadius: 10, marginRight: 8, backgroundColor: colors.surface },
  outfitItemType: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, flex: 1 },
  plannedDateText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginTop: 12 },

  aiSlider: { paddingLeft: 24, paddingRight: 8, marginBottom: 28 },
  suggestionCard: {
    width: width * 0.52, backgroundColor: colors.white, borderRadius: 20, padding: 16,
    marginRight: 14, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'space-between',
    minHeight: 180, shadowColor: colors.text, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  suggestionIconWrapper: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  suggestionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 5 },
  suggestionDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 15, flex: 1, marginBottom: 10 },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionStyle: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },

  recentGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 24,
  },
  recentCard: {
    width: '48%', backgroundColor: colors.white, borderRadius: 20, borderWidth: 1.5,
    borderColor: colors.border, marginBottom: 16, overflow: 'hidden',
    shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 2,
  },
  recentImageContainer: { height: 120, backgroundColor: colors.surface, borderBottomWidth: 1.5, borderColor: colors.border },
  recentImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  recentInfo: { padding: 12 },
  recentName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  recentCategory: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },

  emptyWardrobeCard: {
    marginHorizontal: 24, backgroundColor: colors.white, borderRadius: 24,
    padding: 32, alignItems: 'center', borderWidth: 1.5,
    borderColor: colors.border, borderStyle: 'dashed',
  },
  emptyWardrobeTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  emptyWardrobeText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  addGarmentBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  addGarmentBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
});
