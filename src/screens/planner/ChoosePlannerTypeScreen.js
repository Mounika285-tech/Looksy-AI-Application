import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

export const ChoosePlannerTypeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Planning Mode</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>How would you like to plan?</Text>
          <Text style={styles.introSubtitle}>
            Choose between standard manual day-by-day scheduling or let our AI auto-curate your entire week dynamically.
          </Text>
        </View>

        {/* Card 1: Custom Planner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CustomPlannerSetup')}
          activeOpacity={0.9}
          style={styles.choiceCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <Feather name="edit" size={28} color={colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Custom Planner</Text>
            <Text style={styles.cardDesc}>
              Manually schedule specific outfits or individual wardrobe pieces day-by-day to lock in your calendar looks.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Card 2: AI Weekly Planner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AIPlannerSetup')}
          activeOpacity={0.9}
          style={[styles.choiceCard, styles.aiCard]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
            <Feather name="cpu" size={28} color={colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>AI Weekly Planner</Text>
            <Text style={styles.cardDesc}>
              Our styling engine automatically curates 7 days of coordinated outfits matched directly to your forecast climate and occasions.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
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
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  introSection: {
    marginBottom: 40,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  aiCard: {
    borderColor: colors.primary,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    fontWeight: '600',
  },
});
