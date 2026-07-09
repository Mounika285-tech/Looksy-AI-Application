import { GEMINI_API_KEY, GEMINI_ENDPOINT } from '../config/gemini';
import * as FileSystem from 'expo-file-system/legacy';

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC: Logs the real HTTP error from Gemini (401/403/429/500 etc.)
// ─────────────────────────────────────────────────────────────────────────────
async function throwDetailedGeminiError(response) {
  let body = '';
  try { body = await response.text(); } catch (_) {}
  const msg = `Gemini API HTTP ${response.status} — ${body.slice(0, 300)}`;
  console.error('🔴 GEMINI ERROR DETAIL:', msg);
  throw new Error(msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: convert image URL → base64 inline part for Vision API
// Uses expo-file-system (React Native has no FileReader)
// ─────────────────────────────────────────────────────────────────────────────
async function imageToGenerativePart(url) {
  try {
    const localUri = FileSystem.cacheDirectory + `gemini_img_${Date.now()}.jpg`;
    const downloadResult = await FileSystem.downloadAsync(url, localUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download image: HTTP ${downloadResult.status}`);
    }

    const base64data = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Clean up temp file
    FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});

    return {
      inlineData: {
        data: base64data,
        mimeType: 'image/jpeg',
      },
    };
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Gemini fetch helper — uses X-goog-api-key header (matches curl format)
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(payload) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwDetailedGeminiError(response);
  }

  const data = await response.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}

/**
 * 1. Analyze garment picture using Gemini Vision API
 */
export const analyzeGarmentImage = async (imageUrl) => {
  try {
    const imagePart = await imageToGenerativePart(imageUrl);

    const prompt = `
      You are an expert fashion computer vision analyzer. Analyze this clothing garment image and classify its details.
      
      You must respond with ONLY a valid raw JSON object. No markdown, no backticks.
      
      The JSON object must have exactly these keys:
      {
        "name": "A creative, fashion-industry descriptive name for this item",
        "category": "Must be exactly one of: Top Wear, Bottom Wear, Footwear, Accessories, Other",
        "colorName": "A descriptive name of the dominant color (e.g., Soft Sage, Camel, Navy Blue)",
        "colorHex": "The exact dominant hex color code (e.g., #8FBC8F)",
        "pattern": "Must be exactly one of: Solid, Striped, Checked, Floral, Graphic Print, Polka Dot, Textured, Other",
        "season": "Spring, Summer, Autumn, Winter, or All-Season",
        "occasion": "Must be exactly one of: Casual, Formal, Business, Party, Wedding, Sports, Travel, Other"
      }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }, imagePart] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    return await callGemini(payload);
  } catch (error) {
    console.error('Gemini Image Analysis failed. Using fallback:', error);
    return getFallbackGarmentAnalysis(imageUrl);
  }
};

/**
 * 2. Curate cohesive outfit based on context (Occasion, Weather, Mix & Match)
 */
export const curateOutfit = async (closetItems, baseItem, parameter, type) => {
  try {
    const prompt = `
      You are LookSy's expert AI Fashion Stylist. Curate a cohesive outfit using ONLY the items provided in the user's digital wardrobe (User's Closet Items).
      
      Target Curation Type: ${type} (Occasions, Climate, or Core Mix & Match)
      Styling Context: ${parameter}
      
      Base Item that MUST be included in the look:
      ${JSON.stringify(baseItem)}
      
      User's Closet Items to choose from:
      ${JSON.stringify(closetItems)}
      
      CRITICAL REQUIREMENTS:
      1. You MUST select matching items ONLY from the provided "User's Closet Items" list. Do not invent, mock, or assume any items that are not explicitly present in the list.
      2. Set the base item under its corresponding category in the "items" object (e.g. if the base item is 'Top Wear', it must be placed in items.top).
      3. If the user's closet contains no items in a category (e.g. they have no "Footwear" or "Accessories"), set that category's key to null in the "items" object. Do NOT use placeholder or dummy items.
      4. For any category set to null in the "items" object, write a text suggestion for a missing item in the "suggestedAdditions" object (e.g. "classic black leather shoes" or "black leather belt"). If the category is NOT missing, set its key in "suggestedAdditions" to null.
      5. Ensure the item IDs matched in your response exactly correspond to the "id" fields of the items in the "User's Closet Items" list.
      
      You must respond with ONLY a valid raw JSON object. No markdown, no backticks.
      
      The JSON object must have exactly these keys:
      {
        "name": "A creative, premium name for this complete outfit styling",
        "type": "Curation Type name",
        "items": {
          "top": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Top Wear" } or null,
          "bottom": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Bottom Wear" } or null,
          "footwear": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Footwear" } or null,
          "accessory": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Accessories" } or null
        },
        "suggestedAdditions": {
          "top": "Text suggestion" or null,
          "bottom": "Text suggestion" or null,
          "footwear": "Text suggestion" or null,
          "accessory": "Text suggestion" or null
        }
      }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    return await callGemini(payload);
  } catch (error) {
    console.error('Gemini Outfit curation failed. Using fallback:', error);
    return getFallbackOutfitCuration(baseItem, closetItems, parameter, type);
  }
};

/**
 * 3. Generate a 7-day style planner
 */
export const generateWeeklyPlanner = async (closetItems, vibe, climate) => {
  try {
    const prompt = `
      You are LookSy's elite Personal AI Stylist. Plan a full 7-day weekly schedule (Monday through Sunday).
      
      Styling Vibe Theme: ${vibe}
      Target Weather Context: ${climate}
      
      User's Closet items available for scheduling:
      ${JSON.stringify(closetItems)}
      
      For each of the 7 days (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday), create a cohesive daily outfit.
      Each day must have a descriptive "name" and select a "top", "bottom", "footwear", and optional "accessory" from their closet items.
      
      CRITICAL REQUIREMENTS:
      1. You MUST select matching items ONLY from the provided closet items. Do not invent, mock, or assume any items that are not explicitly present in the list.
      2. If closet items are missing for a specific category, set that category's key to null in the "items" object. Do NOT use placeholder or dummy items.
      3. For any category set to null in the "items" object, write a text suggestion for a missing item in the "suggestedAdditions" object (e.g. "classic black leather shoes" or "black leather belt"). If the category is NOT missing, set its key in "suggestedAdditions" to null.
      4. Ensure the item IDs matched in your response exactly correspond to the "id" fields of the items in the closet items list.

      You must respond with ONLY a valid raw JSON array of 7 objects. No markdown, no backticks.
      
      The JSON array format must match exactly:
      [
        {
          "plannedDate": "Monday",
          "name": "Monday Outfit Name",
          "items": {
            "top": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Top Wear" } or null,
            "bottom": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Bottom Wear" } or null,
            "footwear": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Footwear" } or null,
            "accessory": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Accessories" } or null
          },
          "suggestedAdditions": {
            "top": "Text suggestion" or null,
            "bottom": "Text suggestion" or null,
            "footwear": "Text suggestion" or null,
            "accessory": "Text suggestion" or null
          }
        },
        ... (repeat for Tuesday through Sunday)
      ]
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    return await callGemini(payload);
  } catch (error) {
    console.error('Gemini Weekly Planner failed. Using fallback:', error);
    return getFallbackWeeklyPlanner(closetItems, vibe);
  }
};

/**
 * 4. Generate dynamic outfit suggestions based on style preferences and wardrobe
 */
export const generateSuggestions = async (closetItems, stylePreferences, gender, weather) => {
  try {
    const weatherContext = weather 
      ? `The current weather condition is: ${weather.condition}, Temperature: ${weather.temp}°C.` 
      : '';
    const prompt = `
      You are LookSy's elite Personal AI Stylist. The user's style preferences are: ${JSON.stringify(stylePreferences)}.
      The user's gender is: ${gender || 'Unspecified'}.
      ${weatherContext}
      
      User's Closet items:
      ${JSON.stringify(closetItems)}
      
      Analyze the user's closet items and generate exactly 4 distinct outfit suggestion compositions.
      
      Styling Rules:
      1. Each outfit must mix and match available clothing items to generate personalized suggestions based on styling moods (such as Casual, Streetwear, Formal, Minimalist, Sporty, etc.).
      2. The suggestions must be tailored specifically to the user's gender (${gender || 'Unspecified'}), the weather conditions if provided (${weatherContext}), and the user's wardrobe.
      3. For a Male user, generate names like "Navy Blue Casual Look", "Office Ready Outfit", "Weekend Comfort Fit".
      4. For a Female user, generate names like "Elegant Summer Style", "Casual Chic Outfit", "Formal Office Look".
      5. The "desc" field MUST be a single, short, concise line of description (maximum 8 words). Do not include long paragraphs or explanations.
      6. CRITICAL: You must recommend clothing items ONLY from the user's wardrobe (User's Closet items above). Do not recommend items that are not in their closet.
      7. If the user's closet contains no items in a category (e.g. they have no "Footwear" or "Accessories"), set that category key to null in the "items" object. Do NOT use placeholder or dummy items.
      8. For any category set to null in the "items" object, write a text suggestion for a missing item in the "suggestedAdditions" object (e.g. "classic black leather shoes" or "black leather belt"). If the category is NOT missing, set its key in "suggestedAdditions" to null.
      9. Ensure the item IDs matched in your response exactly correspond to the "id" fields of the items in the "User's Closet items" list.

      You must respond with ONLY a valid raw JSON array of exactly 4 objects. No markdown, no backticks.
      
      The JSON array format must match exactly:
      [
        {
          "id": "outfit_s1",
          "name": "Creative Premium Gender-Tailored Title",
          "desc": "One short concise line (max 8 words) describing the outfit",
          "category": "Aesthetic category name (e.g. Streetwear, Formal, Minimalist, Casual, Sporty)",
          "color": "A light pastel hex color (e.g. #F8DCCB, #F5EFEB)",
          "items": {
            "top": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Top Wear" } or null,
            "bottom": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Bottom Wear" } or null,
            "footwear": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Footwear" } or null,
            "accessory": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Accessories" } or null
          },
          "suggestedAdditions": {
            "top": "Text suggestion" or null,
            "bottom": "Text suggestion" or null,
            "footwear": "Text suggestion" or null,
            "accessory": "Text suggestion" or null
          }
        },
        ...
      ]
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    return await callGemini(payload);
  } catch (error) {
    console.error('Gemini Suggestions failed. Using fallback:', error);
    return getFallbackSuggestions(closetItems, stylePreferences, gender);
  }
};

/**
 * 5. Generate AI color harmony insights for the Color Matching flow
 */
export const generateColorHarmonyInsight = async (baseItem, harmonyType) => {
  try {
    const prompt = `
      You are LookSy's expert Color Theory AI Stylist.

      Base Garment:
      - Name: ${baseItem.name || 'Unnamed Garment'}
      - Color Name: ${baseItem.colorName || 'Unknown Color'}
      - Color Hex: ${baseItem.colorHex || '#D2B48C'}
      - Category: ${baseItem.category || 'Top Wear'}

      Selected Color Harmony Mode: ${harmonyType.toUpperCase()}

      Provide:
      1. A 2-3 sentence premium styling insight explaining why this harmony works.
      2. An array of exactly 4 recommended companion hex color codes using ${harmonyType} color theory.
      3. An array of exactly 3 short styling tips (max 10 words each).

      Respond with ONLY a valid raw JSON object. No markdown, no backticks.
      {
        "insight": "...",
        "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
        "tips": ["tip 1", "tip 2", "tip 3"]
      }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    return await callGemini(payload);
  } catch (error) {
    console.error('Gemini Color Harmony Insight failed. Using fallback:', error);
    return getFallbackColorHarmonyInsight(baseItem, harmonyType);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK GENERATORS — used when AI is unavailable / key is not yet set
// ─────────────────────────────────────────────────────────────────────────────

const getFallbackGarmentAnalysis = (imageUrl) => {
  const fallbacks = [
    { name: 'Wardrobe Garment', category: 'Top Wear', colorName: 'Neutral', colorHex: '#CCCCCC', pattern: 'Solid', season: 'All-Season', occasion: 'Casual' },
  ];
  return fallbacks[0];
};

const getFallbackOutfitCuration = (baseItem, closetItems, parameter, type) => {
  const closet = closetItems || [];
  const tops = closet.filter(i => i.category === 'Top Wear');
  const bottoms = closet.filter(i => i.category === 'Bottom Wear');
  const shoes = closet.filter(i => i.category === 'Footwear');
  const accessories = closet.filter(i => i.category === 'Accessories');

  const getRand = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  const selectedTop = baseItem?.category === 'Top Wear' ? baseItem : getRand(tops);
  const selectedBottom = baseItem?.category === 'Bottom Wear' ? baseItem : getRand(bottoms);
  const selectedShoe = baseItem?.category === 'Footwear' ? baseItem : getRand(shoes);
  const selectedAcc = baseItem?.category === 'Accessories' ? baseItem : getRand(accessories);

  const suggestedAdditions = {
    top: selectedTop ? null : 'classic top layer',
    bottom: selectedBottom ? null : 'tailored bottom wear',
    footwear: selectedShoe ? null : 'classic black shoes',
    accessory: selectedAcc ? null : 'black leather belt',
  };

  return {
    name: `${type || 'Curated'} ${parameter?.split(' ')[0] || 'Look'}`,
    type: type || 'Curated',
    items: {
      top: selectedTop,
      bottom: selectedBottom,
      footwear: selectedShoe,
      accessory: selectedAcc,
    },
    suggestedAdditions,
  };
};

const getFallbackWeeklyPlanner = (closetItems, vibe) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const closet = closetItems || [];
  
  const tops = closet.filter(i => i.category === 'Top Wear');
  const bottoms = closet.filter(i => i.category === 'Bottom Wear');
  const shoes = closet.filter(i => i.category === 'Footwear');
  const accessories = closet.filter(i => i.category === 'Accessories');

  const getRand = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  return days.map((day, idx) => {
    const selectedTop = tops[idx % Math.max(tops.length, 1)] || null;
    const selectedBottom = bottoms[idx % Math.max(bottoms.length, 1)] || null;
    const selectedShoe = shoes[idx % Math.max(shoes.length, 1)] || null;
    const selectedAcc = accessories[idx % Math.max(accessories.length, 1)] || null;

    const suggestedAdditions = {
      top: selectedTop ? null : 'classic top layer',
      bottom: selectedBottom ? null : 'tailored bottoms',
      footwear: selectedShoe ? null : 'classic black shoes',
      accessory: selectedAcc ? null : 'black leather belt',
    };

    return {
      plannedDate: day,
      name: `${day} ${vibe} Look`,
      items: {
        top: selectedTop,
        bottom: selectedBottom,
        footwear: selectedShoe,
        accessory: selectedAcc,
      },
      suggestedAdditions,
    };
  });
};

const getFallbackSuggestions = (closetItems, stylePreferences, gender) => {
  const closet = closetItems || [];
  const tops = closet.filter(i => i.category === 'Top Wear');
  const bottoms = closet.filter(i => i.category === 'Bottom Wear');
  const shoes = closet.filter(i => i.category === 'Footwear');
  const accessories = closet.filter(i => i.category === 'Accessories');

  const getRand = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  const isMale = gender?.toLowerCase() === 'male';

  const baseOutfits = isMale ? [
    { id: 'outfit_s1', name: 'Navy Blue Casual Look', desc: 'Relaxed polo shirt with classic chinos.', category: 'Casual', color: '#EFE5DD' },
    { id: 'outfit_s2', name: 'Office Ready Outfit', desc: 'Tailored button-up shirt with formal trousers.', category: 'Formal', color: '#F5EFEB' },
    { id: 'outfit_s3', name: 'Weekend Comfort Fit', desc: 'Comfortable basic tee with casual shorts.', category: 'Minimalist', color: '#FFFFFF' },
    { id: 'outfit_s4', name: 'Streetwear Cool Look', desc: 'Graphic hoodie paired with clean joggers.', category: 'Streetwear', color: '#F8DCCB' },
  ] : [
    { id: 'outfit_s1', name: 'Elegant Summer Style', desc: 'Breezy linen top with matching midi skirt.', category: 'Casual', color: '#EFE5DD' },
    { id: 'outfit_s2', name: 'Casual Chic Outfit', desc: 'Sleek blouse paired with high-waisted denim.', category: 'Streetwear', color: '#F8DCCB' },
    { id: 'outfit_s3', name: 'Formal Office Look', desc: 'Tailored blazer with tapered ankle trousers.', category: 'Formal', color: '#F5EFEB' },
    { id: 'outfit_s4', name: 'Relaxed Weekend Vibe', desc: 'Loose knit sweater with comfortable leggings.', category: 'Minimalist', color: '#FFFFFF' },
  ];

  return baseOutfits.map((outfit) => {
    const selectedTop = getRand(tops);
    const selectedBottom = getRand(bottoms);
    const selectedShoe = getRand(shoes);
    const selectedAcc = getRand(accessories);

    const suggestedAdditions = {
      top: selectedTop ? null : 'classic top layer',
      bottom: selectedBottom ? null : 'tailored pants',
      footwear: selectedShoe ? null : 'classic black shoes',
      accessory: selectedAcc ? null : 'black leather belt',
    };

    return {
      ...outfit,
      items: {
        top: selectedTop,
        bottom: selectedBottom,
        footwear: selectedShoe,
        accessory: selectedAcc,
      },
      suggestedAdditions,
    };
  });
};

const getFallbackColorHarmonyInsight = (baseItem, harmonyType) => {
  const baseHex = baseItem.colorHex || '#D2B48C';
  const fallbacks = {
    monochromatic: {
      insight: `The ${baseItem.colorName || 'base'} color creates a sophisticated tonal palette. Layering different shades of the same hue delivers a clean, quiet luxury aesthetic that feels intentional and refined.`,
      palette: [baseHex, '#F5EFEB', '#FFFDF9', '#C4A882'],
      tips: ['Layer light to dark tones', 'Vary fabric textures for depth', 'Use accessories as accent breaks'],
    },
    complementary: {
      insight: `Pairing ${baseItem.colorName || 'your base color'} with its complementary opposite creates a bold, high-contrast look. This dynamic tension gives your outfit a modern pop that commands attention.`,
      palette: [baseHex, '#4A4A4A', '#2C2A29', '#E8B4B8'],
      tips: ['Keep one color dominant', 'Use contrast only at key focal points', 'Neutrals bridge complementary tones well'],
    },
    analogous: {
      insight: `Analogous colors adjacent to ${baseItem.colorName || 'your base'} create a serene, harmonious flow. This palette feels naturally balanced — perfect for a polished, effortless look.`,
      palette: [baseHex, '#F8DCCB', '#EFE5DD', '#C4A882'],
      tips: ['Blend tones seamlessly across pieces', 'Natural fabrics enhance analogous palettes', 'Add a subtle print to break monotony'],
    },
  };
  return fallbacks[harmonyType] || fallbacks.analogous;
};
