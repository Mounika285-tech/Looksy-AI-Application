// Upgraded Rainbow Grid Spectrum and Overrides Controller
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Feather } from '@expo/vector-icons';

export const EditDetailsScreen = ({ navigation, route }) => {
  const { item } = route.params;

  // Options lists
  const standardCategories = ['Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];
  const standardPatterns = ['Solid', 'Striped', 'Checked', 'Floral', 'Graphic Print', 'Polka Dot', 'Textured'];
  const standardOccasions = ['Casual', 'Formal', 'Business', 'Party', 'Wedding', 'Sports', 'Travel'];

  const categoriesList = [...standardCategories, 'Other'];
  const patternsList = [...standardPatterns, 'Other'];
  const occasionsList = [...standardOccasions, 'Other'];
  const seasonsList = ['Spring', 'Summer', 'Autumn', 'Winter', 'All-Season'];

  const colorsList = [
    // Reds & Pinks
    { name: 'Scarlet Red', hex: '#E53E3E' },
    { name: 'Crimson Burgundy', hex: '#9B2C2C' },
    { name: 'Blush Pink', hex: '#FEB2B2' },
    { name: 'Hot Pink', hex: '#ED64A6' },
    { name: 'Deep Fuchsia', hex: '#D53F8C' },
    { name: 'Plum Purple', hex: '#702459' },
    // Oranges & Yellows
    { name: 'Warm Coral', hex: '#F05A5B' },
    { name: 'Sunset Orange', hex: '#ED8936' },
    { name: 'Mustard Gold', hex: '#E2B842' },
    { name: 'Lemon Yellow', hex: '#F6E05E' },
    { name: 'Amber Glow', hex: '#D69E2E' },
    { name: 'Peach Cream', hex: '#FBD38D' },
    // Greens
    { name: 'Lime Green', hex: '#9AE6B4' },
    { name: 'Mint Leaf', hex: '#68D391' },
    { name: 'Emerald Forest', hex: '#38A169' },
    { name: 'Dark Sage', hex: '#22543D' },
    { name: 'Olive Drab', hex: '#808000' },
    { name: 'Soft Sage', hex: '#8FBC8F' },
    // Cyans & Blues
    { name: 'Dark Teal', hex: '#234E52' },
    { name: 'Teal Blue', hex: '#319795' },
    { name: 'Cyan Sky', hex: '#00FFFF' },
    { name: 'Sky Blue', hex: '#63B3ED' },
    { name: 'Royal Blue', hex: '#3182CE' },
    { name: 'Navy Blue', hex: '#2B4C7E' },
    // Violets & Purples
    { name: 'Soft Lavender', hex: '#E9D8FD' },
    { name: 'Lilac Dusk', hex: '#D6BCFA' },
    { name: 'Bright Violet', hex: '#B794F4' },
    { name: 'Classic Purple', hex: '#805AD5' },
    { name: 'Deep Indigo', hex: '#553C9A' },
    { name: 'Midnight Blue', hex: '#1A365D' },
    // Earthy & Grayscale
    { name: 'Warm Beige', hex: '#F5EFEB' },
    { name: 'Camel Tan', hex: '#EDC9AF' },
    { name: 'Chocolate Brown', hex: '#5C3A21' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Silver Gray', hex: '#E2E8F0' },
    { name: 'Charcoal Black', hex: '#2C2A29' }
  ];

  // Helper: check if incoming attribute is standard or custom (Other)
  const getInitialValue = (val, list, defaultVal) => {
    if (!val) return defaultVal;
    return list.includes(val) ? val : 'Other';
  };

  const initialCat = getInitialValue(item.category, standardCategories, 'Top Wear');
  const initialCustomCat = initialCat === 'Other' ? item.category : '';

  const initialPattern = getInitialValue(item.pattern, standardPatterns, 'Solid');
  const initialCustomPattern = initialPattern === 'Other' ? item.pattern : '';

  const initialOccasion = getInitialValue(item.occasion, standardOccasions, 'Casual');
  const initialCustomOccasion = initialOccasion === 'Other' ? item.occasion : '';

  // Form states
  const [name, setName] = useState(item.name || '');
  const [category, setCategory] = useState(initialCat);
  const [customCategory, setCustomCategory] = useState(initialCustomCat);

  // Color picker states
  const [colorMode, setColorMode] = useState('ai'); // 'ai' or 'picker'
  const [colorName, setColorName] = useState(item.colorName || 'Beige');
  const [colorHex, setColorHex] = useState(item.colorHex || '#F5EFEB');

  // AI color original values
  const aiColorName = item.colorName || 'Beige';
  const aiColorHex = item.colorHex || '#F5EFEB';

  // RGB conversion helpers
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 245, g: 239, b: 235 };
  };

  const initialRgb = hexToRgb(item.colorHex || '#F5EFEB');
  const [r, setR] = useState(initialRgb.r);
  const [g, setG] = useState(initialRgb.g);
  const [b, setB] = useState(initialRgb.b);

  const [pattern, setPattern] = useState(initialPattern);
  const [customPattern, setCustomPattern] = useState(initialCustomPattern);

  const [season, setSeason] = useState(item.season || 'All-Season');

  const [occasion, setOccasion] = useState(initialOccasion);
  const [customOccasion, setCustomOccasion] = useState(initialCustomOccasion);

  const rgbToHex = (rVal, gVal, bVal) => {
    const clamp = (val) => Math.max(0, Math.min(255, val));
    const toHex = (c) => {
      const hex = clamp(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + (toHex(rVal) + toHex(gVal) + toHex(bVal)).toUpperCase();
  };

  const updateRgbColor = (newR, newG, newB) => {
    const clamp = (val) => Math.max(0, Math.min(255, val));
    const finalR = clamp(newR);
    const finalG = clamp(newG);
    const finalB = clamp(newB);
    setR(finalR);
    setG(finalG);
    setB(finalB);
    
    const hex = rgbToHex(finalR, finalG, finalB);
    setColorHex(hex);
    setColorName('Custom Color');
    setColorMode('picker');
  };

  const handlePresetSelect = (preset) => {
    setColorName(preset.name);
    setColorHex(preset.hex);
    const rgb = hexToRgb(preset.hex);
    setR(rgb.r);
    setG(rgb.g);
    setB(rgb.b);
    setColorMode('picker');
  };

  const handleSaveChanges = () => {
    if (!name.trim()) {
      alert('Item name cannot be empty');
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;
    const finalPattern = pattern === 'Other' ? (customPattern.trim() || 'Other') : pattern;
    const finalOccasion = occasion === 'Other' ? (customOccasion.trim() || 'Other') : occasion;

    navigation.navigate('AIDetectionResults', {
      imageUrl: item.imageUrl,
      editedData: {
        ...item,
        name: name.trim(),
        category: finalCategory,
        colorName,
        colorHex,
        pattern: finalPattern,
        season,
        occasion: finalOccasion,
      },
    });
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
        <Text style={styles.headerTitle}>Edit Attributes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Name Input */}
        <Input
          label="Item Name"
          placeholder="e.g. Classic Linen Shirt"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Category Picker Selector */}
        <Text style={styles.selectorLabel}>Category</Text>
        <View style={styles.gridRow}>
          {categoriesList.map((c) => {
            const isSelected = category === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                activeOpacity={0.8}
                style={[styles.selectorBtn, isSelected && styles.selectorBtnActive]}
              >
                <Text style={[styles.selectorBtnText, isSelected && styles.selectorBtnTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {category === 'Other' && (
          <View style={styles.otherInputWrapper}>
            <Input
              label="Custom Category"
              placeholder="e.g. Blazer, Trench Coat, Kimono"
              value={customCategory}
              onChangeText={setCustomCategory}
              autoCapitalize="words"
            />
          </View>
        )}

        {/* Color Selection Enhancement */}
        <Text style={styles.selectorLabel}>Color Source</Text>
        <View style={styles.colorTabs}>
          <TouchableOpacity
            style={[styles.colorTab, colorMode === 'ai' && styles.colorTabActive]}
            onPress={() => {
              setColorMode('ai');
              setColorName(aiColorName);
              setColorHex(aiColorHex);
              const rgb = hexToRgb(aiColorHex);
              setR(rgb.r);
              setG(rgb.g);
              setB(rgb.b);
            }}
          >
            <Feather name="cpu" size={14} color={colorMode === 'ai' ? colors.white : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.colorTabText, colorMode === 'ai' && styles.colorTabTextActive]}>AI Detected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.colorTab, colorMode === 'picker' && styles.colorTabActive]}
            onPress={() => setColorMode('picker')}
          >
            <Feather name="sliders" size={14} color={colorMode === 'picker' ? colors.white : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.colorTabText, colorMode === 'picker' && styles.colorTabTextActive]}>Color Picker</Text>
          </TouchableOpacity>
        </View>

        {colorMode === 'ai' ? (
          <View style={styles.aiColorPreview}>
            <View style={[styles.colorBubbleLarge, { backgroundColor: aiColorHex }]} />
            <View>
              <Text style={styles.colorNameTitle}>{aiColorName}</Text>
              <Text style={styles.colorHexSub}>{aiColorHex}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            {/* Rainbow Spectrum Grid */}
            <Text style={styles.pickerSubLabel}>Rainbow Spectrum Grid</Text>
            <View style={styles.presetsGrid}>
              {colorsList.map((c) => {
                const isSelected = colorHex.toUpperCase() === c.hex.toUpperCase();
                return (
                  <TouchableOpacity
                    key={c.name}
                    onPress={() => handlePresetSelect(c)}
                    style={[styles.presetItem, isSelected && styles.presetItemActive]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.presetBubble, { backgroundColor: c.hex }, c.name === 'White' && { borderWidth: 1, borderColor: colors.border }]} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tactile RGB Sliders */}
            <Text style={styles.pickerSubLabel}>Tactile RGB Tuning</Text>
            
            <View style={styles.livePreviewBar}>
              <View style={[styles.colorBubbleLarge, { backgroundColor: colorHex }]} />
              <View>
                <Text style={styles.colorNameTitle}>{colorName}</Text>
                <Text style={styles.colorHexSub}>{colorHex}</Text>
              </View>
            </View>

            {/* R Slider */}
            <View style={styles.rgbRow}>
              <Text style={[styles.rgbTitle, { color: '#C53030' }]}>R</Text>
              <TouchableOpacity onPress={() => updateRgbColor(r - 5, g, b)} style={styles.rgbStepBtn}>
                <Feather name="minus" size={14} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.rgbTrack}>
                <View style={[styles.rgbFill, { width: `${(r / 255) * 100}%`, backgroundColor: '#C53030' }]} />
              </View>
              <TouchableOpacity onPress={() => updateRgbColor(r + 5, g, b)} style={styles.rgbStepBtn}>
                <Feather name="plus" size={14} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.rgbValue}>{r}</Text>
            </View>

            {/* G Slider */}
            <View style={styles.rgbRow}>
              <Text style={[styles.rgbTitle, { color: '#276749' }]}>G</Text>
              <TouchableOpacity onPress={() => updateRgbColor(r, g - 5, b)} style={styles.rgbStepBtn}>
                <Feather name="minus" size={14} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.rgbTrack}>
                <View style={[styles.rgbFill, { width: `${(g / 255) * 100}%`, backgroundColor: '#276749' }]} />
              </View>
              <TouchableOpacity onPress={() => updateRgbColor(r, g + 5, b)} style={styles.rgbStepBtn}>
                <Feather name="plus" size={14} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.rgbValue}>{g}</Text>
            </View>

            {/* B Slider */}
            <View style={styles.rgbRow}>
              <Text style={[styles.rgbTitle, { color: '#2B4C7E' }]}>B</Text>
              <TouchableOpacity onPress={() => updateRgbColor(r, g, b - 5)} style={styles.rgbStepBtn}>
                <Feather name="minus" size={14} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.rgbTrack}>
                <View style={[styles.rgbFill, { width: `${(b / 255) * 100}%`, backgroundColor: '#2B4C7E' }]} />
              </View>
              <TouchableOpacity onPress={() => updateRgbColor(r, g, b + 5)} style={styles.rgbStepBtn}>
                <Feather name="plus" size={14} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.rgbValue}>{b}</Text>
            </View>
          </View>
        )}

        {/* Pattern Selector */}
        <Text style={styles.selectorLabel}>Pattern</Text>
        <View style={styles.gridRow}>
          {patternsList.map((p) => {
            const isSelected = pattern === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPattern(p)}
                activeOpacity={0.8}
                style={[styles.selectorBtn, isSelected && styles.selectorBtnActive]}
              >
                <Text style={[styles.selectorBtnText, isSelected && styles.selectorBtnTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {pattern === 'Other' && (
          <View style={styles.otherInputWrapper}>
            <Input
              label="Custom Pattern"
              placeholder="e.g. Herringbone, Houndstooth, Camouflage"
              value={customPattern}
              onChangeText={setCustomPattern}
              autoCapitalize="words"
            />
          </View>
        )}

        {/* Season Selector */}
        <Text style={styles.selectorLabel}>Suitable Season</Text>
        <View style={styles.gridRow}>
          {seasonsList.map((s) => {
            const isSelected = season === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSeason(s)}
                activeOpacity={0.8}
                style={[styles.selectorBtn, isSelected && styles.selectorBtnActive]}
              >
                <Text style={[styles.selectorBtnText, isSelected && styles.selectorBtnTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Occasion Selector */}
        <Text style={styles.selectorLabel}>Occasion</Text>
        <View style={styles.gridRow}>
          {occasionsList.map((o) => {
            const isSelected = occasion === o;
            return (
              <TouchableOpacity
                key={o}
                onPress={() => setOccasion(o)}
                activeOpacity={0.8}
                style={[styles.selectorBtn, isSelected && styles.selectorBtnActive]}
              >
                <Text style={[styles.selectorBtnText, isSelected && styles.selectorBtnTextActive]}>
                  {o}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {occasion === 'Other' && (
          <View style={styles.otherInputWrapper}>
            <Input
              label="Custom Occasion"
              placeholder="e.g. Graduation Ceremony, Job Interview"
              value={customOccasion}
              onChangeText={setCustomOccasion}
              autoCapitalize="words"
            />
          </View>
        )}

        <Button
          title="Save Attributes"
          variant="primary"
          onPress={handleSaveChanges}
          style={styles.saveBtn}
        />
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingLeft: 4,
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  selectorBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectorBtnActive: {
    backgroundColor: colors.white,
    borderColor: colors.accentDark,
  },
  selectorBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectorBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  otherInputWrapper: {
    marginBottom: 16,
  },
  colorTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  colorTab: {
    flex: 1,
    flexDirection: 'row',
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorTabActive: {
    backgroundColor: colors.primary,
  },
  colorTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  colorTabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  aiColorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  colorBubbleLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  colorNameTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  colorHexSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 24,
  },
  pickerSubLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  presetItem: {
    width: '14%', // 6 items per row fits perfectly
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  presetItemActive: {
    transform: [{ scale: 1.25 }],
  },
  presetBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  livePreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  rgbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  rgbTitle: {
    fontSize: 14,
    fontWeight: '800',
    width: 24,
    textAlign: 'center',
  },
  rgbStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  rgbTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rgbFill: {
    height: '100%',
    borderRadius: 4,
  },
  rgbValue: {
    fontSize: 12,
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
    color: colors.text,
  },
  saveBtn: {
    marginTop: 16,
  },
});
