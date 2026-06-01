import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

export const WeatherDetailsScreen = ({ navigation }) => {
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
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Large Weather Display */}
        <View style={styles.weatherHero}>
          <View style={[styles.weatherIconWrapper, { backgroundColor: colors.accent }]}>
            <Feather name="sun" size={64} color={colors.primary} />
          </View>
          <Text style={styles.temp}>24°C</Text>
          <Text style={styles.status}>Clear Sunny Sky</Text>
          <Text style={styles.location}>New York, USA</Text>
        </View>

        {/* Weather Conditions List */}
        <View style={styles.conditionsGrid}>
          <View style={styles.conditionCard}>
            <Feather name="wind" size={20} color={colors.textSecondary} style={styles.condIcon} />
            <Text style={styles.condLabel}>Wind</Text>
            <Text style={styles.condValue}>8 km/h</Text>
          </View>
          <View style={styles.conditionCard}>
            <Feather name="droplet" size={20} color={colors.textSecondary} style={styles.condIcon} />
            <Text style={styles.condLabel}>Humidity</Text>
            <Text style={styles.condValue}>45%</Text>
          </View>
          <View style={styles.conditionCard}>
            <Feather name="eye" size={20} color={colors.textSecondary} style={styles.condIcon} />
            <Text style={styles.condLabel}>Visibility</Text>
            <Text style={styles.condValue}>10 km</Text>
          </View>
        </View>

        {/* Styling Advice Section */}
        <View style={styles.adviceCard}>
          <View style={styles.adviceHeader}>
            <Feather name="info" size={20} color={colors.primary} />
            <Text style={styles.adviceTitle}>Smart Styling Tips</Text>
          </View>
          <Text style={styles.adviceText}>
            Today's mild 24°C temperature and bright sunshine is optimal for wearing breathable fabrics.
          </Text>
          
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Choose light pastel or neutral colors to stay cool.</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Opt for comfortable cotton tees, light chinos or denim.</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Bring accessories like round sunglasses or a stylish leather watch.</Text>
            </View>
          </View>
        </View>
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
  scrollContainer: {
    paddingBottom: 40,
    paddingTop: 24,
  },
  weatherHero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  weatherIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  temp: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  status: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  conditionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  conditionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  condIcon: {
    marginBottom: 8,
  },
  condLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  condValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  adviceCard: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 8,
  },
  adviceText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  bulletList: {
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
