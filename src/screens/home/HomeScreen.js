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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { generateSuggestions } from '../../utils/geminiService';
import { fetchLocationByIP, fetchLocationByCity, fetchWeather } from '../../utils/weatherService';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getPlanStatus = (plan) => {
  if (!plan.createdAt) return 'expired';
  const createdDate = new Date(plan.createdAt);
  const today = new Date();
  
  // Reset time components for accurate date comparisons
  const createdZero = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffDays = Math.round((todayZero - createdZero) / (1000 * 60 * 60 * 24));
  
  const dateStr = plan.plannedDate?.toUpperCase();
  
  if (dateStr === 'TODAY') {
    if (diffDays === 0) return 'today';
    if (diffDays > 0) return 'expired';
    return 'future';
  }
  
  if (dateStr === 'TOMORROW') {
    if (diffDays === 1) return 'today';
    if (diffDays > 1) return 'expired';
    return 'future';
  }
  
  if (dateStr === 'THIS WEEKEND') {
    // Weekend is Saturday (6) and Sunday (0)
    const todayDay = today.getDay();
    const isTodayWeekend = todayDay === 0 || todayDay === 6;
    
    // Check if same week
    const getWeekNumber = (d) => {
      const onejan = new Date(d.getFullYear(), 0, 1);
      return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    };
    const sameYear = createdDate.getFullYear() === today.getFullYear();
    const sameWeek = sameYear && getWeekNumber(createdDate) === getWeekNumber(today);
    
    if (sameWeek && isTodayWeekend) return 'today';
    if (sameWeek && !isTodayWeekend && diffDays <= 0) return 'future';
    return 'expired';
  }
  
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  if (weekDays.includes(dateStr)) {
    const getWeekNumber = (d) => {
      const onejan = new Date(d.getFullYear(), 0, 1);
      return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    };
    const sameYear = createdDate.getFullYear() === today.getFullYear();
    const sameWeek = sameYear && getWeekNumber(createdDate) === getWeekNumber(today);
    
    if (sameWeek) {
      const planDayIndex = weekDays.indexOf(dateStr);
      const todayDayIndex = today.getDay();
      
      if (planDayIndex === todayDayIndex) return 'today';
      if (planDayIndex > todayDayIndex) return 'future';
      return 'expired';
    }
    return 'expired';
  }
  
  return 'expired';
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

  // Real-time dynamic weather states
  const [weather, setWeather] = useState({ temp: 28, condition: 'Partly Cloudy', icon: 'cloud', location: 'Mumbai, India', humidity: '72%', wind: '12 km/h', visibility: '8 km', feelsLike: '31°C' });
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherLocation, setWeatherLocation] = useState('Current Location');
  const [searchCity, setSearchCity] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

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

  // High-fidelity static fallback suggestions based on gender
  const isMale = profile?.gender?.toLowerCase() === 'male';
  const staticSuggestions = isMale ? [
    {
      id: 'sug_1',
      name: 'Navy Blue Casual Look',
      desc: 'Relaxed polo shirt with classic chinos.',
      style: 'Casual',
      color: colors.accent,
      icon: 'award',
    },
    {
      id: 'sug_2',
      name: 'Office Ready Outfit',
      desc: 'Tailored button-up shirt with formal trousers.',
      style: 'Formal',
      color: '#E8E2DC',
      icon: 'briefcase',
    },
    {
      id: 'sug_3',
      name: 'Weekend Comfort Fit',
      desc: 'Comfortable basic t-shirt with casual shorts.',
      style: 'Minimalist',
      color: colors.surfaceAlt,
      icon: 'sun',
    },
  ] : [
    {
      id: 'sug_1',
      name: 'Elegant Summer Style',
      desc: 'Breezy linen top with matching midi skirt.',
      style: 'Casual',
      color: colors.accent,
      icon: 'award',
    },
    {
      id: 'sug_2',
      name: 'Formal Office Look',
      desc: 'Tailored blazer with tapered ankle trousers.',
      style: 'Formal',
      color: '#E8E2DC',
      icon: 'briefcase',
    },
    {
      id: 'sug_3',
      name: 'Casual Chic Outfit',
      desc: 'Sleek blouse paired with high-waisted denim.',
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

  const fetchAISuggestions = async (activeWeather = weather) => {
    setIsLoadingAI(true);
    try {
      const stylePrefs = profile?.stylePreferences || [prefStyle];
      const suggestions = await generateSuggestions(wardrobeItems, stylePrefs, profile?.gender, activeWeather);
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

  const loadWeather = async (cityName = '') => {
    setIsLoadingWeather(true);
    try {
      let coords;
      let locName = 'Mumbai, India';
      
      if (cityName) {
        coords = await fetchLocationByCity(cityName);
        locName = `${coords.city}, ${coords.country}`;
        setWeatherLocation(locName);
      } else {
        coords = await fetchLocationByIP();
        locName = `${coords.city}, ${coords.country}`;
        setWeatherLocation('Current Location');
      }

      const forecast = await fetchWeather(coords.latitude, coords.longitude);
      const newWeather = {
        ...forecast,
        location: locName,
      };
      setWeather(newWeather);
      
      if (!isLoadingData && wardrobeItems.length > 0) {
        setIsLoadingAI(true);
        const stylePrefs = profile?.stylePreferences || [prefStyle];
        const suggestions = await generateSuggestions(wardrobeItems, stylePrefs, profile?.gender, newWeather);
        if (suggestions && suggestions.length > 0) {
          setAiSuggestions(suggestions.slice(0, 4));
        } else {
          setAiSuggestions(staticSuggestions);
        }
        setIsLoadingAI(false);
      }
    } catch (error) {
      console.error('Error loading weather on home:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Fetch AI suggestions once wardrobe items load
  useEffect(() => {
    if (!isLoadingData && user) {
      fetchAISuggestions(weather);
    }
  }, [isLoadingData, wardrobeItems.length]);

  // Load live weather on startup
  useEffect(() => {
    if (user) {
      loadWeather();
    }
  }, [user]);

  // Dynamic active/future plan from planner
  const getActivePlan = () => {
    const todayPlan = plannedOutfits.find(o => getPlanStatus(o) === 'today');
    if (todayPlan) {
      return { plan: todayPlan, isToday: true };
    }
    
    const futurePlans = plannedOutfits.filter(o => getPlanStatus(o) === 'future');
    if (futurePlans.length > 0) {
      // Sort future plans to find the closest upcoming one
      futurePlans.sort((a, b) => {
        const dateA = a.plannedDate?.toUpperCase();
        const dateB = b.plannedDate?.toUpperCase();
        if (dateA === 'TOMORROW' && dateB !== 'TOMORROW') return -1;
        if (dateB === 'TOMORROW' && dateA !== 'TOMORROW') return 1;
        return a.createdAt - b.createdAt;
      });
      return { plan: futurePlans[0], isToday: false };
    }
    return { plan: null, isToday: false };
  };

  const { plan: activePlan, isToday: isActiveToday } = getActivePlan();
  const displayOutfitItems = activePlan
    ? Object.values(activePlan.items || {}).filter(Boolean).slice(0, 3)
    : [];

  const recentGridItems = wardrobeItems.slice(0, 4);

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
          onPress={() => navigation.navigate('WeatherDetails', { weatherData: weather })}
          activeOpacity={0.9}
          style={styles.weatherCard}
        >
          {isLoadingWeather ? (
            <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6, fontWeight: '600' }}>
                Fetching live forecast...
              </Text>
            </View>
          ) : (
            <View style={styles.weatherInfo}>
              <View style={styles.weatherTextGroup}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Feather name="map-pin" size={10} color={colors.primary} style={{ marginRight: 3 }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' }} numberOfLines={1}>
                    {weather.location}
                  </Text>
                </View>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherStatus}>{weather.condition}</Text>
              </View>
              <View style={styles.weatherRight}>
                <Feather name={weather.icon} size={36} color={colors.primary} />
                <TouchableOpacity 
                  onPress={() => setShowLocationInput(!showLocationInput)}
                  style={{ paddingVertical: 4, paddingHorizontal: 6, marginTop: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={9} color={colors.primary} style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: colors.primary }}>Change City</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showLocationInput && (
            <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }} onStartShouldSetResponder={() => true}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={{
                    flex: 1,
                    height: 36,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    fontSize: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                    fontWeight: '600',
                  }}
                  value={searchCity}
                  onChangeText={setSearchCity}
                  placeholder="Enter city (e.g. London)"
                  placeholderTextColor={colors.textSecondary}
                  onSubmitEditing={() => {
                    if (searchCity.trim()) {
                      loadWeather(searchCity.trim());
                      setShowLocationInput(false);
                      setSearchCity('');
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (searchCity.trim()) {
                      loadWeather(searchCity.trim());
                      setShowLocationInput(false);
                      setSearchCity('');
                    }
                  }}
                  style={{
                    backgroundColor: colors.primary,
                    height: 36,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    loadWeather();
                    setShowLocationInput(false);
                  }}
                  style={{
                    backgroundColor: colors.surface,
                    height: 36,
                    width: 36,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Feather name="navigation" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.weatherTipDivider} />
          <Text style={styles.weatherTip}>
            💡 Perfect day for a <Text style={styles.boldTip}>{prefStyle}</Text> look! Comfort meets style.
          </Text>
        </TouchableOpacity>

        {/* Today's Outfit Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activePlan ? (isActiveToday ? "Today's Scheduled Look" : "Upcoming Scheduled Look") : "Today's Scheduled Look"}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PlannerTab')} activeOpacity={0.7}>
            <Text style={styles.viewAllBtn}>
              {activePlan ? 'View Planner' : 'Plan Look'}
            </Text>
          </TouchableOpacity>
        </View>

        {activePlan ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('PlannerTab')}
            activeOpacity={0.9}
            style={styles.outfitCard}
          >
            <View style={styles.outfitHeader}>
              <Text style={styles.outfitName} numberOfLines={1}>
                {activePlan.name}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {activePlan.plannedDate}
                </Text>
              </View>
            </View>
            <View style={styles.outfitItemsRow}>
              {displayOutfitItems.map((item, index) => (
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
            <Text style={styles.plannedDateText}>
              <Feather name="clock" size={11} color={colors.textSecondary} /> Scheduled: {activePlan.plannedDate}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyTodayCard}>
            <View style={styles.emptyTodayIconCircle}>
              <Feather name="calendar" size={24} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTodayTitle}>No Outfit Scheduled</Text>
            <Text style={styles.emptyTodayText}>No outfit scheduled for today. Add a schedule to see it here.</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PlannerTab')}
              style={styles.scheduleBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.scheduleBtnText}>Plan Outfit Now</Text>
            </TouchableOpacity>
          </View>
        )}

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
                <Text style={styles.suggestionDesc} numberOfLines={1}>{descText}</Text>
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

  emptyTodayCard: {
    marginHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 28,
  },
  emptyTodayIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTodayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  emptyTodayText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontWeight: '600',
  },
  scheduleBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
