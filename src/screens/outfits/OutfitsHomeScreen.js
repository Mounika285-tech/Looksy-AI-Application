import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const OutfitsHomeScreen = ({ navigation }) => {
  const inspirations = [
    {
      id: 'insp1',
      title: 'Autumn Casual',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp39xhSjcpPAJHgf_SL6MUEdxK_LMvhkS5dgGPkjVklRolqorqUIRdmMekgwxqwJErE0kQ0WGuriSfjFrriOHJZSKmz2GrS8EYWSF_D5yOHeyU9wOwt-ADEI44Q13Qz4whD5c51LrKD6RcsgKcORl10oEc-wHI2YDTeygG2C2RocmMD26xyxp0R1MCzCvIk6ha1O-d2bpFkxLd5fqDnMAYL8NKthvDsKFaXgMaVNwHfdl94Xyir9qRVagyDpiPPpK242-NVnDpB4w',
    },
    {
      id: 'insp2',
      title: 'Business Luxe',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe62gzHcVSTZULYcFAs2BEUHYugoTy0Y2ibZBWnxzH1qEWftjhQeKxa4G7ch33StckXQxOz88cxXbDKT0r_VQUFh3Utsqqwyk6hjpj3F6UWap6M1sep2QoaePHY5FJGw9iZhPPnijvRlgVggTFdDJQ2xlw1EMD9M5ukI_Pav_9phE6gPqcAh8PPmLEBs1p2jju5W5AwdG1Ji2X_rUK8LX11rQqreRfuYugqrwJOQaEk2ubQhiOSOBPFFogw9k-BBPTaSumWncfy_g',
    },
    {
      id: 'insp3',
      title: 'Summer Gala',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZIUaqO27a8a_F9HevYqwt2_Fu136kGWHjayFZCMskDany6aaLMo6F1XdPAyhL3LHWimGAdzeL_Mj2QboNqM7_toxlyRrhlRlEiCnt8E7DhbXPWJsGjqK2lmWOaCShjNHOACG-6AsLCqyQrxhpOtVbdLxtnkgrBAfpaRxRw1LL9omxpwvEi_S32IqVqjD6x71aFani9-Yv3Ps8Pdb-ETEy1eLXvlKzd3aGSEBYqjm7GNLlDPIQ1UaoiSLaAucEO0guPt_KolVAydE',
    },
    {
      id: 'insp4',
      title: 'Winter Layering',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa8gJQOInDvmg62jM1PsSVDOsTbrR74pvNrqqwjKQfWNRPEg95QuiASpkhs7IvgmqjbBSgH3-vDc4HIcd6-6Yee6trEx8LYiNHYyNhvHpDW_mEd2EDunw8kjWSqfhw3X1X-bu3Mi4ATFIaIqf9riMGsq0IcDVzsz-Jm-SpxpWKkQnk3gw_258XvD955HxjFUCnlrN92OiSf2Edfjpq92Gc1QDimqXFGsFf2v49P1Bz2oJK2yRXk_2wUWsB14J25kucX6hHjhp9vCM',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Premium Header */}
      <View style={styles.header}>
        <View style={styles.menuBtn}>
          <Feather name="menu" size={22} color={colors.primary} />
        </View>
        <Text style={styles.headerBrand}>LOOKSY AI</Text>
        <View style={styles.profileBadge}>
          <Feather name="user" size={18} color={colors.text} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Generate Outfit</Text>
          <Text style={styles.heroSubtitle}>
            Curate your perfect look with AI-powered suggestions tailored to your wardrobe and lifestyle.
          </Text>
        </View>

        {/* Bento Grid Cards */}
        <View style={styles.bentoContainer}>
          {/* Row 1 */}
          <View style={styles.bentoRow}>
            {/* Card 1: Mix & Match */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MixMatchSelection')}
              activeOpacity={0.9}
              style={[styles.bentoCard, { backgroundColor: colors.surface }]}
            >
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG8deJIYC3cNUjycIYvLZEYvVsKdWEiYyrTdQXdvMwVrfIGTEjPZL6_LOZhYB1bYw9YREPSa4igokyywpU4RZQmP7n8r66wnnlDfC3ruRVRJhmTRBi_GSSa7n2qKVru9k_ow6fcJ-H_WE8EG7k7onXwPiAYdog9h8uKLXVe-f3zHUh636cnBgpZNFs7L-cai73asNMhQwYg0X6XnvpKn7yYjaR5KwII8sPuj9P3zKZtGQJFwFMUlSaG-Iwcf9dctH1wHd0LlC3hvw' }}
                style={styles.cardBgImage}
              />
              <View style={styles.cardGradient} />
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Feather name="grid" size={20} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Mix & Match</Text>
                <Text style={styles.cardSubtitle}>Explore new options from your existing pieces.</Text>
              </View>
            </TouchableOpacity>

            {/* Card 2: Weather Styling */}
            <TouchableOpacity
              onPress={() => navigation.navigate('WeatherStyling')}
              activeOpacity={0.9}
              style={[styles.bentoCard, { backgroundColor: colors.accent }]}
            >
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk3F8nbZaDvzMEK4FNoI34WO-ZxoQTZEuW0Y1yfMHPLe8BzxKdfVnB6gRo9l70YdZDm4dYdi0E2nsj9xT4pLmi_AO5SsJjNKGM0aAGcujGjwsSPt8UVP7iyckkBJQmqFzDQRbhPUck8eWt8BJiypYiMtFucm4pjPzdltjCVG0EWQ_ZNsCgXsf9wynsTZAxZNXA7LpfK4LMaD3Kz3IQaU3hQ-OULPIqzcEMeDzBitPqTYJUOzBc100XpTfvOSk64XgdWQNsmO_03cU' }}
                style={styles.cardBgImage}
              />
              <View style={styles.cardGradient} />
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Feather name="cloud" size={20} color={colors.text} />
                </View>
                <Text style={styles.cardTitle}>Weather Styling</Text>
                <Text style={styles.cardSubtitle}>Perfect layers matched to your local forecast.</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.bentoRow}>
            {/* Card 3: Occasion Styling */}
            <TouchableOpacity
              onPress={() => navigation.navigate('OccasionStyling')}
              activeOpacity={0.9}
              style={[styles.bentoCard, { backgroundColor: colors.surfaceAlt }]}
            >
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPt1Jzafg6i4gfFYvCwQwYPb520uUuwu5D97Ld6uhWVGEOB8IJKQgKs3HvDQFTclriW_UfHNR0dYvUBWqUi0pRHjPEMUMVORo5SserAlvHOAJu-CfRksHlha_7azmnWGd6y1cUUjshtBXZtC32iU90iD7DZB9s5rCkIIb-yRj2l1t8C_KpjVIrfu521Ps0oHTqhoWu_whyOYAAKPcfsWnz7LCb-SD1ZLKcb4yevGM-vdDpvKFxAl5p7QWLTRDGmsBxaeez8z7KsNE' }}
                style={styles.cardBgImage}
              />
              <View style={styles.cardGradient} />
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Feather name="compass" size={20} color={colors.textSecondary} />
                </View>
                <Text style={styles.cardTitle}>Occasion Styling</Text>
                <Text style={styles.cardSubtitle}>Curated looks for meetings, brunch, or galas.</Text>
              </View>
            </TouchableOpacity>

            {/* Card 4: Color Matching */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ColorMatchingSelection')}
              activeOpacity={0.9}
              style={[styles.bentoCard, { backgroundColor: colors.white }]}
            >
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWa8zL4wK6Tr4EMaNWt0jRy_Jj99dvv2Vawe8Lti6BosJK4_dfANdLkdY2-XleLaZsU-i0MGNVJ_PfjKUCv1HpRdw1p5dFI5eNA_h_lF0JzSf1yYieAWYZfL9svvRszT7s8ugkc7Y13H3M_x0oDormJ7RpdCOFFZAY0dQi_ppFgxjrVq5XCIhXto4JkwXR0ngDQ42Tr6JS_Euk4JGdJ7jRVsZXrrQYbj0swJzf6ZG1gTlXaxK2jQ2cgQMqduladiadWOuUr09SyeQ' }}
                style={styles.cardBgImage}
              />
              <View style={styles.cardGradient} />
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Feather name="aperture" size={20} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Color Matching</Text>
                <Text style={styles.cardSubtitle}>Harmonize your looks with color theory.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Inspirations Section */}
        <View style={styles.inspSection}>
          <View style={styles.inspHeader}>
            <Text style={styles.inspTitle}>Recent Inspirations</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inspScroll}>
            {inspirations.map((item) => (
              <View key={item.id} style={styles.inspCard}>
                <View style={styles.inspImageWrapper}>
                  <Image source={{ uri: item.imageUrl }} style={styles.inspImage} />
                </View>
                <Text style={styles.inspName}>{item.title}</Text>
              </View>
            ))}
          </ScrollView>
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
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  menuBtn: {
    padding: 6,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bentoContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bentoCard: {
    width: '47%',
    aspectRatio: 0.85,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  cardBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 251, 247, 0.4)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  inspSection: {
    paddingHorizontal: 24,
  },
  inspHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inspTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  inspScroll: {
    paddingRight: 24,
  },
  inspCard: {
    width: 130,
    marginRight: 16,
  },
  inspImageWrapper: {
    width: 130,
    height: 170,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  inspImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inspName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
