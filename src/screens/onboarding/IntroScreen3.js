import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';

export const IntroScreen3 = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} />

      <View style={styles.content}>
        <View style={styles.assistantVisual}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>📅 June 2026</Text>
          </View>
          <View style={styles.calendarRow}>
            <View style={styles.calendarDay}>
              <Text style={styles.dayNum}>01</Text>
              <Text style={styles.daySub}>☀️ Casual</Text>
            </View>
            <View style={[styles.calendarDay, styles.calendarDayActive]}>
              <Text style={[styles.dayNum, styles.dayNumActive]}>02</Text>
              <Text style={[styles.daySub, styles.daySubActive]}>🌧️ Office</Text>
            </View>
            <View style={styles.calendarDay}>
              <Text style={styles.dayNum}>03</Text>
              <Text style={styles.daySub}>⛅ Party</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Smart Fashion Assistant</Text>
        <Text style={styles.description}>
          Schedule and plan your outfits ahead of time. Get tailored suggestions based on weather and upcoming occasions.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>
        <Button
          title="Get Started"
          variant="primary"
          onPress={() => navigation.navigate('Login')}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  assistantVisual: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 40,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 75,
    height: 85,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  calendarDayActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dayNumActive: {
    color: colors.white,
  },
  daySub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  daySubActive: {
    color: colors.accent,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  btn: {
    width: '100%',
  },
});
