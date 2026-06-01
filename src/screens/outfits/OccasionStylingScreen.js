import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const OccasionStylingScreen = ({ navigation }) => {
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [description, setDescription] = useState('');

  const occasions = [
    { value: 'wedding', label: 'Wedding Event' },
    { value: 'business', label: 'Business Professional' },
    { value: 'casual', label: 'Smart Casual' },
    { value: 'date-night', label: 'Date Night' },
    { value: 'gala', label: 'Evening Gala' },
    { value: 'vacation', label: 'Resort & Vacation' },
  ];

  const hashtags = [
    '#BeachWedding',
    '#BlackTieGala',
    '#TechConference',
    '#FirstDate',
    '#ArtGalleryOpening',
  ];

  const handleHashtagPress = (tag) => {
    setDescription(`Curating styling for a ${tag.replace('#', '').replace(/([A-Z])/g, ' $1').trim()}. Needs to feel elegant, modern, and perfectly coordinated.`);
    if (tag === '#BeachWedding') setSelectedOccasion('wedding');
    else if (tag === '#BlackTieGala') setSelectedOccasion('gala');
    else if (tag === '#TechConference') setSelectedOccasion('business');
    else if (tag === '#FirstDate') setSelectedOccasion('date-night');
    else if (tag === '#ArtGalleryOpening') setSelectedOccasion('casual');
  };

  const handleGetSuggestions = () => {
    if (!selectedOccasion) return;
    navigation.navigate('OccasionStylingResult', { occasion: selectedOccasion, desc: description });
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
        <Text style={styles.headerTitle}>Occasion Styling</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Define the Occasion</Text>
          <Text style={styles.heroSubtitle}>
            Tell us where you're headed. Our AI stylist will curate the perfect ensemble from your wardrobe.
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Dropdown Options */}
          <Text style={styles.inputLabel}>What's the setting?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownSlider}>
            {occasions.map((item) => {
              const isSelected = selectedOccasion === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setSelectedOccasion(item.value)}
                  style={[
                    styles.occBadge,
                    isSelected && styles.occBadgeSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.occBadgeText,
                      isSelected && styles.occBadgeTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Description Text Box */}
          <Text style={[styles.inputLabel, { marginTop: 24 }]}>Event Description</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the mood, location, or any specific style notes (e.g., 'Modern cocktail party at a rooftop lounge, aiming for chic but comfortable')..."
            placeholderTextColor={colors.textSecondary}
            style={styles.textArea}
          />
        </View>

        {/* Bento mood images */}
        <View style={styles.bentoGallery}>
          <View style={styles.bentoCol}>
            <View style={styles.bentoPicWrapper}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOg7YkQJh37VsvfmDy4iWcMxHt4eAkJmRxYeI-Nb1j4e6qmee1zeB3vw6PREpx4ZqV72RnPzM2vq55h54NG6cQldPY1UF3tSIUOfLye0rQMDkTtjP1A8fSREcVG3EaiSJHa9_5HumY-aCyXQcweaUjdPRzyIFfXCmzjbkuIQAkP9RWx_9l0XaC7pzaDU_Wdys9KUrE0knW0SO8CH0ItL_3uSBmc6c03fAp8Fi4a-x6It18_vOpNCnu2tgikqwWKoe74nhTnv2EFeE' }}
                style={styles.galleryImg}
              />
            </View>
          </View>
          <View style={styles.bentoCol}>
            <View style={[styles.bentoPicWrapper, { height: 110 }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiGBj_bnk8Q20O3Y2PuiHBGrNFythWuXWm6vXQu2j4MPwGMjW5GYHt2dR3gmY5idvsWRZgie2CSg9RnzDRrU04cL9Lr5IUVyOk4H8IxxAlRNGcf3Xu1gCMZuZ-GpR0St1aYfz1Jumr7r7Tsy2QyhlOoP8cO9TYInmlryfLCUUHB6yuGdqFvOIYX-9Cvk7N93LNeW-r8-18EIbEeSek6fbmYO3T3XqJJit_zd6qs1DiGl08f8YTlD9VQle8I_GVbtwGa33vyfwZNtQ' }}
                style={styles.galleryImg}
              />
            </View>
            <View style={[styles.bentoPicWrapper, { height: 110, marginTop: 12 }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp6T6yW5ISq11p1tD1Pf5EK1OdezPzKdTuG6OYiSHDmFGbqlXfjNHDyZbb8bgeDL-Y0uHtofJX3_OSmSUdjgEC4n6lBtGiL6dXiQW9uDYdUJ-hLfQ9Yos005s8UEPGhT9qB0ZeWY6y0MLSV_DEud9ZQo2KBWG3kyYJ1uhWdgN-UTbj2WUSO8AkGcj8xr5kdMzDCaaV05haFvQnqoAeyr2lyrP9bb_ODc1m7UhuIAngOZXG9GAodfj5BuOSig_7ZZ9DT_1Fm6YyNlk' }}
                style={styles.galleryImg}
              />
            </View>
          </View>
        </View>

        {/* Popular hashtag request chips */}
        <View style={styles.popularRequests}>
          <Text style={styles.sectionRequestsTitle}>Popular Requests</Text>
          <View style={styles.requestsWrapper}>
            {hashtags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => handleHashtagPress(tag)}
                style={styles.hashtagBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.hashtagBtnText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action button */}
        <TouchableOpacity
          onPress={handleGetSuggestions}
          disabled={!selectedOccasion}
          style={[
            styles.actionBtn,
            !selectedOccasion && styles.actionBtnDisabled,
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Get Suggestions</Text>
          <Feather name="sparkles" size={16} color={colors.white} style={styles.btnIcon} />
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
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  dropdownSlider: {
    paddingRight: 20,
  },
  occBadge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginRight: 10,
  },
  occBadgeSelected: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  occBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  occBadgeTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  bentoGallery: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
    height: 232,
  },
  bentoCol: {
    width: '48%',
  },
  bentoPicWrapper: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  popularRequests: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionRequestsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  requestsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtagBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accentDark,
    marginRight: 8,
    marginBottom: 8,
  },
  hashtagBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
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
