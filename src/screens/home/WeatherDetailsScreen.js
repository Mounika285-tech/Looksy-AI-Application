import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { GEMINI_API_KEY, GEMINI_ENDPOINT } from '../../config/gemini';

// Weather condition config
const WEATHER_DATA = {
  temp: 28,
  unit: '°C',
  condition: 'Partly Cloudy',
  location: 'Mumbai, India',
  wind: '12 km/h',
  humidity: '72%',
  visibility: '8 km',
  icon: 'cloud',
  feelsLike: '31°C',
};

const getWeatherIcon = (condition) => {
  if (condition.toLowerCase().includes('sun') || condition.toLowerCase().includes('clear')) return 'sun';
  if (condition.toLowerCase().includes('rain')) return 'cloud-rain';
  if (condition.toLowerCase().includes('storm')) return 'cloud-lightning';
  if (condition.toLowerCase().includes('snow')) return 'cloud-snow';
  if (condition.toLowerCase().includes('wind')) return 'wind';
  return 'cloud';
};

export const WeatherDetailsScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [aiTips, setAiTips] = useState(null);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const prefStyle = profile?.stylePreferences?.[0] || 'Casual';

  useEffect(() => {
    fetchAIWeatherTips();
  }, []);

  const fetchAIWeatherTips = async () => {
    setIsLoadingTips(true);
    try {
      const prompt = `
        You are LookSy's expert fashion AI. A user is checking the weather and needs personalized outfit styling advice.

        Weather conditions:
        - Temperature: ${WEATHER_DATA.temp}${WEATHER_DATA.unit} (Feels like ${WEATHER_DATA.feelsLike})
        - Condition: ${WEATHER_DATA.condition}
        - Humidity: ${WEATHER_DATA.humidity}
        - Wind: ${WEATHER_DATA.wind}
        - Location: ${WEATHER_DATA.location}

        User's preferred style: ${prefStyle}

        Based on these conditions, provide:
        1. A 2-sentence weather-aware styling summary.
        2. An array of exactly 4 specific outfit tips tailored to these weather conditions and the user's ${prefStyle} style preference.
        3. A recommended outfit type (e.g. "Breathable Casual" or "Smart Layered" - max 3 words).

        Respond with ONLY a raw JSON object. No markdown, no backticks.
        {
          "summary": "...",
          "tips": ["tip1", "tip2", "tip3", "tip4"],
          "outfitType": "..."
        }
      `;

      const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      setAiTips(JSON.parse(text));
    } catch (e) {
      console.error('Weather AI tips failed:', e);
      setAiTips({
        summary: `${WEATHER_DATA.temp}°C with ${WEATHER_DATA.condition.toLowerCase()} skies calls for comfortable, breathable layers. Stay stylish while adapting to the day's conditions.`,
        tips: [
          `Choose light ${prefStyle.toLowerCase()} fabrics that breathe well in ${WEATHER_DATA.temp}°C heat`,
          'Opt for neutral tones or pastels to reflect sunlight and stay cool',
          `A structured ${WEATHER_DATA.wind !== '0 km/h' ? 'windbreaker layer' : 'light jacket'} adds versatility`,
          'Complete with comfortable footwear suited for outdoor movement',
        ],
        outfitType: `${prefStyle} Ready`,
      });
    } finally {
      setIsLoadingTips(false);
    }
  };

  const weatherIcon = getWeatherIcon(WEATHER_DATA.condition);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Details</Text>
        <TouchableOpacity onPress={fetchAIWeatherTips} style={styles.refreshBtn} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Large Weather Display */}
        <View style={styles.weatherHero}>
          <View style={[styles.weatherIconWrapper, { backgroundColor: colors.accent }]}>
            <Feather name={weatherIcon} size={60} color={colors.primary} />
          </View>
          <Text style={styles.temp}>{WEATHER_DATA.temp}{WEATHER_DATA.unit}</Text>
          <Text style={styles.feelsLike}>Feels like {WEATHER_DATA.feelsLike}</Text>
          <Text style={styles.status}>{WEATHER_DATA.condition}</Text>
          <Text style={styles.location}>
            <Feather name="map-pin" size={13} color={colors.textSecondary} /> {WEATHER_DATA.location}
          </Text>
        </View>

        {/* Conditions Grid */}
        <View style={styles.conditionsGrid}>
          <View style={styles.conditionCard}>
            <Feather name="wind" size={20} color={colors.textSecondary} style={styles.condIcon} />
            <Text style={styles.condLabel}>Wind</Text>
            <Text style={styles.condValue}>{WEATHER_DATA.wind}</Text>
          </View>
          <View style={styles.conditionCard}>
            <Feather name="droplet" size={20} color={colors.textSecondary} style={styles.condIcon} />
            <Text style={styles.condLabel}>Humidity</Text>
            <Text style={styles.condValue}>{WEATHER_DATA.humidity}</Text>
          </View>
          <View style={styles.conditionCard}>
            <Feather name="eye" size={20} color={colors.textSecondary} style={styles.condIcon} />
            <Text style={styles.condLabel}>Visibility</Text>
            <Text style={styles.condValue}>{WEATHER_DATA.visibility}</Text>
          </View>
        </View>

        {/* AI Styling Advice */}
        <View style={styles.adviceCard}>
          <View style={styles.adviceHeader}>
            <Feather name="cpu" size={18} color={colors.primary} />
            <Text style={styles.adviceTitle}>AI Styling Tips</Text>
            {!isLoadingTips && aiTips?.outfitType && (
              <View style={styles.outfitTypeBadge}>
                <Text style={styles.outfitTypeBadgeText}>{aiTips.outfitType}</Text>
              </View>
            )}
          </View>

          {isLoadingTips ? (
            <View style={styles.tipsLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.tipsLoaderText}>LookSy AI is analyzing the weather...</Text>
            </View>
          ) : (
            <>
              {aiTips?.summary && (
                <Text style={styles.adviceText}>{aiTips.summary}</Text>
              )}
              <View style={styles.bulletList}>
                {(aiTips?.tips || []).map((tip, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Style profile indicator */}
          <View style={styles.styleTagRow}>
            <Feather name="tag" size={12} color={colors.textSecondary} />
            <Text style={styles.styleTagText}>Personalized for your {prefStyle} style</Text>
          </View>
        </View>

        {/* Navigate to AI Suggestions */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AISuggestions')}
          style={styles.ctaBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Get Full AI Outfit Suggestions</Text>
          <Feather name="arrow-right" size={16} color={colors.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border,
  },
  backBtn: { padding: 8 },
  refreshBtn: { padding: 8 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  scrollContainer: { paddingBottom: 40, paddingTop: 24 },
  weatherHero: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 24 },
  weatherIconWrapper: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  temp: { fontSize: 52, fontWeight: '800', color: colors.text, marginBottom: 4 },
  feelsLike: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  status: { fontSize: 18, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  location: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  conditionsGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 24, marginBottom: 28,
  },
  conditionCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5,
    borderColor: colors.border, padding: 12, alignItems: 'center', marginHorizontal: 5,
  },
  condIcon: { marginBottom: 8 },
  condLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  condValue: { fontSize: 13, fontWeight: '800', color: colors.text },
  adviceCard: {
    marginHorizontal: 24, backgroundColor: colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 24,
  },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  adviceTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginLeft: 8, flex: 1 },
  outfitTypeBadge: {
    backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  outfitTypeBadgeText: { fontSize: 9, fontWeight: '700', color: colors.white, textTransform: 'uppercase' },
  tipsLoader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  tipsLoaderText: { marginLeft: 10, fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  adviceText: { fontSize: 13, color: colors.text, lineHeight: 19, marginBottom: 16 },
  bulletList: { paddingLeft: 4, marginBottom: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bullet: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary,
    marginTop: 6, marginRight: 10,
  },
  bulletText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  styleTagRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderColor: colors.border },
  styleTagText: { marginLeft: 5, fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  ctaBtn: {
    marginHorizontal: 24, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 3,
  },
  ctaBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
