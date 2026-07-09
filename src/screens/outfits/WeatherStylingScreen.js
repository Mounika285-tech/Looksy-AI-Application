import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { fetchLocationByIP, fetchLocationByCity, fetchWeather } from '../../utils/weatherService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const WeatherStylingScreen = ({ navigation }) => {
  const [temperature, setTemperature] = useState(18);
  const [condition, setCondition] = useState('Partly Cloudy');
  const [weatherIconName, setWeatherIconName] = useState('cloud');
  const [weatherLocation, setWeatherLocation] = useState('Current Location');
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  const loadWeather = async (cityName = '') => {
    setIsLoading(true);
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
      setTemperature(forecast.temp);
      setCondition(forecast.condition);
      setWeatherIconName(forecast.icon);
    } catch (error) {
      console.error('Error loading weather on styling screen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleCurate = () => {
    navigation.navigate('WeatherStylingResult', { temp: temperature, cond: condition });
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
        <Text style={styles.headerTitle}>Weather Styling</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Location Row */}
        <View style={styles.locationContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Today's Forecast</Text>
            <Text style={styles.pageTitle} numberOfLines={1}>{weatherLocation}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowLocationInput(!showLocationInput)}
            style={styles.locationBadge}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={12} color={colors.primary} style={styles.pinIcon} />
            <Text style={styles.locationBadgeText}>Change City</Text>
          </TouchableOpacity>
        </View>

        {showLocationInput && (
          <View style={{ marginHorizontal: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{
                flex: 1,
                height: 40,
                backgroundColor: colors.white,
                borderRadius: 12,
                paddingHorizontal: 16,
                fontSize: 13,
                borderWidth: 1.5,
                borderColor: colors.border,
                color: colors.text,
                fontWeight: '600',
              }}
              value={searchCity}
              onChangeText={setSearchCity}
              placeholder="Search city (e.g. London)"
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
                height: 40,
                paddingHorizontal: 16,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                loadWeather();
                setShowLocationInput(false);
              }}
              style={{
                backgroundColor: colors.white,
                height: 40,
                width: 40,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
                borderWidth: 1.5,
                borderColor: colors.border,
              }}
            >
              <Feather name="navigation" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Main Weather Visual Card */}
        <View style={styles.weatherCard}>
          {isLoading ? (
            <View style={{ flex: 1, height: 120, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8, fontWeight: '600' }}>
                Fetching live climate data...
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={styles.weatherLeft}>
                <View style={styles.tempWrapper}>
                  <Text style={styles.tempNum}>{temperature}</Text>
                  <Text style={styles.tempSymbol}>°C</Text>
                </View>
                <Text style={styles.conditionText}>{condition}</Text>
              </View>

              <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                <Feather name={weatherIconName} size={48} color={colors.primary} />
              </View>
            </View>
          )}
        </View>

        {/* Weather styling rule detail box */}
        <View style={styles.insightBox}>
          <View style={styles.insightHeader}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={styles.insightTitle}>Styling Guidance</Text>
          </View>
          <Text style={styles.insightText}>
            A temperate climate of 18°C calls for sleek layering. Combining light cotton coats with fine knits or premium silk is highly recommended. Keep a light scarf handy for the late afternoon breezes.
          </Text>
        </View>

        {/* Big Action button */}
        <TouchableOpacity
          onPress={handleCurate}
          disabled={isLoading}
          style={[styles.actionBtn, isLoading && { opacity: 0.65 }]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Curate Outfit Suggestion</Text>
          <Feather name="magic-pen" size={16} color={colors.white} style={styles.btnIcon} />
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
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pinIcon: {
    marginRight: 4,
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  weatherCard: {
    marginHorizontal: 24,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  weatherLeft: {
    marginBottom: 20,
  },
  tempWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempNum: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 52,
  },
  tempSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 2,
  },
  conditionText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  hourlyList: {
    paddingRight: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    width: 60,
    marginRight: 12,
  },
  hourlyTime: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  hourlyIcon: {
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  insightBox: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
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
});
