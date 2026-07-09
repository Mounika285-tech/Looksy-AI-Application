import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';

export const PlannedOutfitDetailsScreen = ({ navigation, route }) => {
  const { planId } = route.params;
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const planRef = ref(database, `users/${user.uid}/planner/${planId}`);
    const unsubscribe = onValue(planRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlan(data);
      } else {
        setPlan(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching planned outfit details:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, planId]);

  const handleToggleReminder = async () => {
    if (!plan || !user) return;
    try {
      const planRef = ref(database, `users/${user.uid}/planner/${planId}`);
      const nextStatus = !plan.notificationEnabled;
      await update(planRef, { notificationEnabled: nextStatus });
      Alert.alert(
        nextStatus ? 'Reminder Enabled!' : 'Reminder Disabled',
        nextStatus 
          ? 'You will receive a daily style reminder for this look.'
          : 'Reminders turned off for this look.'
      );
    } catch (e) {
      console.error('Error updating notification toggle:', e);
      Alert.alert('Oops!', 'Failed to update reminder settings.');
    }
  };

  const handleDeletePlan = async () => {
    Alert.alert(
      'Delete Plan?',
      'Are you sure you want to remove this look from your calendar?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) {
                navigation.goBack();
                return;
              }
              const planRef = ref(database, `users/${user.uid}/planner/${planId}`);
              await remove(planRef);
              Alert.alert('Deleted!', 'Look successfully removed from calendar.');
              navigation.navigate('PlannerHome');
            } catch (e) {
              console.error('Error deleting planned look:', e);
              Alert.alert('Oops!', 'Failed to delete planned look.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading Plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Planned look not found or deleted.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Return to Planner</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Planned Look Details</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomPlannerSetup', { editPlanId: planId, currentPlan: plan })}
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={18} color={colors.primary} style={{ marginRight: 12 }} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeletePlan}
            style={styles.deleteBtn}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Large visual preview card */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxYaMaJAJo2srAFvUfWNl3rT1Dm_H8UJ0wVSG4kK-_0Pwzw0wGF-at4l2AiZ8cnmzwYZAHg3wyagl1Crp7DOH4KLUjvPkap4aDJCYC2ZxDrGsASZ_NvT8V91jF4ADVSwmM5heGhcntqXSF4c51nOC5_L9qq7hTvVZdJwt3iTW9oI4veoAzI1fI_YbQyETSexFP2VvpB1m5M05E5jhXDmA5P-TgUHZTvL7bQ24c8r4HQ50DomsYjniCW0AGIiiJhBzGDFGJBc8Ejs' }}
            style={styles.heroImage}
          />
          <View style={styles.gradientOverlay} />
          <View style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{plan.plannedDate ? plan.plannedDate.toUpperCase() : 'TOMORROW'}</Text>
            </View>
            <Text style={styles.heroTitleText}>{plan.name || 'Ensemble Look'}</Text>
          </View>
        </View>

        {/* Dynamic Items breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Curated Flat Lay</Text>
          
          <View style={styles.gridContainer}>
            {Object.keys(plan.items || {}).map((key) => {
              const item = plan.items[key];
              if (!item) return null;
              return (
                <View key={item.id} style={styles.itemBox}>
                  <View style={styles.imgWrapper}>
                    <Image source={{ uri: item.imageUrl }} style={styles.boxImg} />
                  </View>
                  <Text style={styles.boxCategory} numberOfLines={1}>{item.category || 'Garment'}</Text>
                  <Text style={styles.boxName} numberOfLines={1}>{item.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Preferences / Push Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleTitle}>Push Styling Alert</Text>
              <Text style={styles.toggleDesc}>Receive an elegant reminder notification with coordinates on planned days.</Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleReminder}
              style={[
                styles.toggleBtn, 
                plan.notificationEnabled && styles.toggleBtnActive
              ]}
              activeOpacity={0.8}
            >
              <View style={[
                styles.toggleBall, 
                plan.notificationEnabled && styles.toggleBallActive
              ]} />
            </TouchableOpacity>
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
  deleteBtn: {
    padding: 8,
  },
  editBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 42, 41, 0.45)',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  heroTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  breakdownSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemBox: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 2,
  },
  imgWrapper: {
    height: 110,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  boxImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  boxCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  boxName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  toggleSection: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
  },
  toggleMeta: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    fontWeight: '600',
  },
  toggleBtn: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBallActive: {
    alignSelf: 'flex-end',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    fontWeight: '600',
  },
  actionBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
