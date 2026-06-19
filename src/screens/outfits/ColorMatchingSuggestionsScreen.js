import React, { useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { generateColorHarmonyInsight } from '../../utils/geminiService';

const { width } = Dimensions.get('window');

export const ColorMatchingSuggestionsScreen = ({ navigation, route }) => {
  const { baseItem } = route.params;
  const [selectedHarmony, setSelectedHarmony] = useState('');
  const [harmonyInsight, setHarmonyInsight] = useState(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const harmonies = [
    {
      value: 'monochromatic',
      title: 'Monochromatic Harmony',
      desc: 'Sophisticated tonal look using values of the same base color. Delivers a clean, quiet luxury aesthetic.',
      tones: ['#D2B48C', '#E6C2A0', '#F5EFEB', '#FFFDF9'],
    },
    {
      value: 'complementary',
      title: 'Complementary Contrast',
      desc: 'Dynamic contrasting colors that lie opposite in the color wheel. Accentuates outlines and adds pop.',
      tones: ['#D2B48C', '#4A4A4A', '#E8A598', '#2C2A29'],
    },
    {
      value: 'analogous',
      title: 'Analogous Tones',
      desc: 'Harmonious adjacent colors that sit next to each other. Feels serene, balanced, and perfectly fluid.',
      tones: ['#D2B48C', '#F8DCCB', '#EFE5DD', '#6E6B64'],
    },
  ];

  const handleSelectHarmony = async (harmonyValue) => {
    setSelectedHarmony(harmonyValue);
    setHarmonyInsight(null);
    setIsLoadingInsight(true);
    try {
      const insight = await generateColorHarmonyInsight(baseItem, harmonyValue);
      setHarmonyInsight(insight);
    } catch (e) {
      console.error('Failed to fetch color harmony insight:', e);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleCreate = () => {
    if (!selectedHarmony) return;
    navigation.navigate('ColorMatchingResult', { baseItem, harmony: selectedHarmony });
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
        <Text style={styles.headerTitle}>Color Harmony</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Parallax Hero Base Garment */}
        <View style={styles.heroSection}>
          <Image source={{ uri: baseItem.imageUrl }} style={styles.heroImage} />
          <View style={styles.gradientOverlay} />
          <View style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Selected Base</Text>
            </View>
            <Text style={styles.heroTitleText}>{baseItem.name}</Text>
            <View style={styles.colorRow}>
              <View style={[styles.colorBubble, { backgroundColor: baseItem.colorHex || '#D2B48C' }]} />
              <Text style={styles.colorLabel}>
                Color Value: {baseItem.colorName || 'Warm Sand'}
              </Text>
            </View>
          </View>
        </View>

        {/* Curation Options */}
        <View style={styles.contentPadding}>
          <Text style={styles.sectionTitle}>Select Harmony Palette</Text>
          <Text style={styles.sectionSubtitle}>
            Our styling algorithm suggests palettes to elevate your base item for a sophisticated, coordinated outfit.
          </Text>

          {/* Cards list */}
          {harmonies.map((item) => {
            const isSelected = selectedHarmony === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => handleSelectHarmony(item.value)}
                activeOpacity={0.9}
                style={[
                  styles.harmonyCard,
                  isSelected && styles.harmonyCardSelected,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {isSelected && (
                    <View style={styles.selectCheck}>
                      <Feather name="check" size={12} color={colors.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.cardDesc}>{item.desc}</Text>

                {/* Show AI palette if this card is selected, else static tone dots */}
                <View style={styles.dotsWrapper}>
                  {(isSelected && harmonyInsight?.palette ? harmonyInsight.palette : item.tones).map((color, idx) => (
                    <View key={idx} style={[styles.toneDot, { backgroundColor: color }]} />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* AI Insight Panel — shown after harmony selection */}
          {selectedHarmony && (
            <View style={styles.insightPanel}>
              {isLoadingInsight ? (
                <View style={styles.insightLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.insightLoadingText}>LookSy AI is analyzing your palette...</Text>
                </View>
              ) : harmonyInsight ? (
                <>
                  <View style={styles.insightHeader}>
                    <Feather name="cpu" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.insightLabel}>AI Color Insight</Text>
                  </View>
                  <Text style={styles.insightText}>{harmonyInsight.insight}</Text>

                  {/* Style Tips */}
                  <View style={styles.tipsWrapper}>
                    {harmonyInsight.tips.map((tip, idx) => (
                      <View key={idx} style={styles.tipRow}>
                        <View style={styles.tipBullet} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          )}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!selectedHarmony}
          style={[
            styles.actionBtn,
            !selectedHarmony && styles.actionBtnDisabled,
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Curate Outfit</Text>
          <Feather name="layers" size={16} color={colors.white} style={styles.btnIcon} />
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
  heroSection: {
    height: 320,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 42, 41, 0.4)',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  heroTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.white,
    marginRight: 8,
  },
  colorLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  },
  contentPadding: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '600',
  },
  harmonyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 2,
  },
  harmonyCardSelected: {
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  selectCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  dotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toneDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 4,
  },
  insightPanel: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  insightLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightLoadingText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  tipsWrapper: {
    marginTop: 0,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: 8,
  },
  tipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  actionBtn: {
    marginHorizontal: 24,
    marginTop: 16,
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
  actionBtnDisabled: {
    opacity: 0.5,
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
