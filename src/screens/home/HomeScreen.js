import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const userName = profile?.name || 'Stylist';

  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [plannedOutfits, setPlannedOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // High-fidelity fallbacks
  const defaultOutfit = {
    name: 'Summer Casual Chic',
    category: 'Casual',
    items: [
      { id: 'fb_item_1', name: 'Beige Cotton Tee', category: 'Top Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4' },
      { id: 'fb_item_2', name: 'Light Blue Jeans', category: 'Bottom Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE' },
      { id: 'fb_item_3', name: 'Minimalist White Sneakers', category: 'Footwear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY' },
    ],
  };

  const defaultRecentUploads = [
    { id: 'fb_rec_1', name: 'Linen Shirt', category: 'Top Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkWqkR5PT7Bavl-4ujQPl8DZuSpY6oLPErC1MjdO_PObRL9j8GaonEC-ex0j7jxdiDUFog_QkNH6Bl34sAW6ahUhT4PDTuuY4NALKF06n9sJ3AWa-HdJc2g0DZPeJOikUc70nkH1caGEcw0BCvnt2pC5klyGsoecxn9zcGbVHQOutt6BzcQ-qpYBe9gwUmqTC4ISVDtr59TArPw2lyiVP4maclE7aevSktVh7HSqwLvGm3fPZ4eYNzOU082MuDsgBNCru_JGW6aX8' },
    { id: 'fb_rec_2', name: 'Denim Shorts', category: 'Bottom Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQpB5RNTvJARmGajGuy_rwCPsFDeu5dL2yZTwNnuTYlIBuuPepLWbkPkQan3uN5qmpZ4EFklHWrW3eSVPHY8ujqGh2ThUIJ0xszj7tk4PzMRdJ1MTtxWYJhwdRHrBbIZDUpbC-qXgCdwJqprDhnuE1Ex7V5ADmiDtKp78Qe_bmRyDtgaY3aqB6Ene2tv1PRTCfb5AiudckUh07Tk-7D1-Yu1IsjbI9ltLDd71cNSygMqQw0b0xJ8tklUYDp5q_ctM9NwniNNT1gfg' },
    { id: 'fb_rec_3', name: 'White Sneakers', category: 'Footwear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY' },
    { id: 'fb_rec_4', name: 'Leather Belt', category: 'Accessories', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc4sHkVDSXDBHgVaNbwy4wkEwg_AtArL6vRr4kgGzf2TAUsOEIX2ziEvbxvWIaCFbbKysN9X3hauOFEwmvd5yEAMwvlLwVSmTwXRwO48MC56CSy2CSVt-gRge-8IbXn4sFW_bw3qIJ7An-w_3UDu89AL8LKGSbo5UQOamsPK-YjFTL9br0YF2eWeJoYQFrqhzeFOC6BxUGEA_SUaEDaX4U8rGcUGr5JjtX0Lqeq0_-ofk5--HX886EE5mQyqXAszTu2TWP3bR7Ttc' },
  ];

  // Dynamic recommendations styled to profile preference
  const prefStyle = profile?.stylePreferences?.[0] || 'Casual';
  const aiSuggestions = [
    { id: 'sug_1', name: `Premium ${prefStyle}`, desc: `Curated combination tailored for your ${prefStyle} aesthetic.`, style: prefStyle },
    { id: 'sug_2', name: 'Smart Office Formal', desc: 'Minimal blazer with tailored neutral pants.', style: 'Formal' },
    { id: 'sug_3', name: 'Minimalist Weekend', desc: 'Comfortable essentials styled with classic textures.', style: 'Minimalist' },
  ];

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Subscribe to wardrobe items in real-time
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubWardrobe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setWardrobeItems(parsed);
      } else {
        setWardrobeItems([]);
      }
    });

    // Subscribe to scheduled outfits in real-time
    const plannerRef = ref(database, `users/${user.uid}/planner`);
    const unsubPlanner = onValue(plannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPlannedOutfits(parsed);
      } else {
        setPlannedOutfits([]);
      }
      setIsLoading(false);
    });

    return () => {
      unsubWardrobe();
      unsubPlanner();
    };
  }, [user]);

  // Determine Today's Outfit from Planner database
  const todayPlanned = plannedOutfits.find((o) => o.plannedDate === 'Today') || plannedOutfits[0];
  const activeOutfit = todayPlanned || defaultOutfit;
  const activeItems = todayPlanned 
    ? Object.values(todayPlanned.items || {}) 
    : defaultOutfit.items;

  // Determine Recent Uploads
  const recentGridItems = wardrobeItems.length > 0 
    ? wardrobeItems.slice(0, 4) 
    : defaultRecentUploads;

  const handleOutfitCardPress = () => {
    if (todayPlanned) {
      navigation.navigate('PlannerTab');
    } else {
      navigation.navigate('OutfitsTab');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Syncing style dashboard...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
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

          {/* Weather Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('WeatherDetails')}
            activeOpacity={0.9}
            style={styles.weatherCard}
          >
            <View style={styles.weatherInfo}>
              <View style={styles.weatherTextGroup}>
                <Text style={styles.weatherTemp}>24°C</Text>
                <Text style={styles.weatherStatus}>Sunny & Gentle Breeze</Text>
              </View>
              <Feather name="sun" size={36} color={colors.primary} />
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
                {todayPlanned ? 'View Planner' : 'Style Engine'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleOutfitCardPress}
            activeOpacity={0.9}
            style={styles.outfitCard}
          >
            <View style={styles.outfitHeader}>
              <Text style={styles.outfitName} numberOfLines={1}>{activeOutfit.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {todayPlanned ? 'PLAN' : activeOutfit.category}
                </Text>
              </View>
            </View>
            <View style={styles.outfitItemsRow}>
              {activeItems.slice(0, 3).map((item, index) => (
                <View key={item.id || index} style={styles.outfitItemDotWrapper}>
                  <Image source={{ uri: item.imageUrl }} style={styles.outfitItemThumbnail} />
                  <Text style={styles.outfitItemType} numberOfLines={1}>
                    {item.category || 'Garment'}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          {/* AI Recommendations Slider */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AISuggestions')} activeOpacity={0.7}>
              <Text style={styles.viewAllBtn}>Explore All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiSlider}
          >
            {aiSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                onPress={() => navigation.navigate('AISuggestions')}
                activeOpacity={0.8}
                style={styles.suggestionCard}
              >
                <View style={[styles.suggestionIconWrapper, { backgroundColor: colors.accent }]}>
                  <Feather name="award" size={20} color={colors.primary} />
                </View>
                <Text style={styles.suggestionTitle}>{suggestion.name}</Text>
                <Text style={styles.suggestionDesc}>{suggestion.desc}</Text>
                <View style={styles.suggestionFooter}>
                  <Text style={styles.suggestionStyle}>{suggestion.style}</Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Uploads Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {wardrobeItems.length > 0 ? 'Recently Uploaded' : 'Recent Uploads'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecentUploads')} activeOpacity={0.7}>
              <Text style={styles.viewAllBtn}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentGrid}>
            {recentGridItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('RecentUploads')}
                activeOpacity={0.8}
                style={styles.recentCard}
              >
                <View style={styles.recentImageContainer}>
                  <Image source={{ uri: item.imageUrl }} style={styles.recentImage} />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.recentCategory}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  weatherCard: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTextGroup: {
    flexDirection: 'column',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  weatherStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  weatherTipDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  weatherTip: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  boldTip: {
    fontWeight: '700',
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  outfitCard: {
    marginHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
  },
  outfitItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outfitItemDotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  outfitItemThumbnail: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  outfitItemType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  aiSlider: {
    paddingLeft: 24,
    paddingRight: 8,
    marginBottom: 28,
  },
  suggestionCard: {
    width: width * 0.45,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    height: 170,
  },
  suggestionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  suggestionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    marginBottom: 12,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionStyle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  recentCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  recentImageContainer: {
    height: 120,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5,
    borderColor: colors.border,
  },
  recentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentInfo: {
    padding: 12,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  recentCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 14,
  },
});
