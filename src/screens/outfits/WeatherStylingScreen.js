import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const WeatherStylingScreen = ({ navigation }) => {
  const [temperature, setTemperature] = useState(18);
  const [condition, setCondition] = useState('Partly Cloudy');

  const hourlyForecast = [
    { time: '14:00', temp: '19°', icon: 'sun', color: '#F2A03D' },
    { time: '15:00', temp: '18°', icon: 'cloud-rain', color: colors.primary },
    { time: '16:00', temp: '17°', icon: 'cloud', color: colors.textSecondary },
    { time: '17:00', temp: '15°', icon: 'cloud-lightning', color: colors.text },
    { time: '18:00', temp: '14°', icon: 'wind', color: colors.textSecondary },
  ];

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
          <View>
            <Text style={styles.sectionLabel}>Today's Forecast</Text>
            <Text style={styles.pageTitle}>London, UK</Text>
          </View>
          <View style={styles.locationBadge}>
            <Feather name="map-pin" size={14} color={colors.primary} style={styles.pinIcon} />
            <Text style={styles.locationBadgeText}>London, UK</Text>
          </View>
        </View>

        {/* Main Weather Visual Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherLeft}>
            <View style={styles.tempWrapper}>
              <Text style={styles.tempNum}>{temperature}</Text>
              <Text style={styles.tempSymbol}>°C</Text>
            </View>
            <Text style={styles.conditionText}>{condition}</Text>
          </View>

          <View style={styles.dividerLine} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
            {hourlyForecast.map((item, idx) => (
              <View key={idx} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{item.time}</Text>
                <Feather name={item.icon} size={18} color={item.color} style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>{item.temp}</Text>
              </View>
            ))}
          </ScrollView>
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
          style={styles.actionBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Curate Layered Look</Text>
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
