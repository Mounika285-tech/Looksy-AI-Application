import { GEMINI_API_KEY, GEMINI_ENDPOINT } from '../config/gemini';
import * as FileSystem from 'expo-file-system';

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
      You are LookSy's expert AI Fashion Stylist. Curate a cohesive outfit from the user's digital wardrobe.
      
      Target Curation Type: ${type} (Occasions, Climate, or Core Mix & Match)
      Styling Context: ${parameter}
      
      Base Item that MUST be included in the look:
      ${JSON.stringify(baseItem)}
      
      User's Closet Items to choose from:
      ${JSON.stringify(closetItems)}
      
      Select exactly one Top Wear, one Bottom Wear, and one Footwear, and optionally one Accessories item to complete the look.
      - If the Base Item is a "Top Wear", search the closet items for the perfect bottom, footwear, and accessory.
      - If you find no items of a specific category in the closet list, select one of these premium fallback items:
        * Top Wear fallback: name: 'Ivory Silk Button-Down', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4'
        * Bottom Wear fallback: name: 'Tailored Wide-Leg Trousers', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE'
        * Footwear fallback: name: 'Pointed Leather Pumps', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY'
        * Accessories fallback: name: 'Classic Camel Trench Coat', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tx2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM'

      You must respond with ONLY a valid raw JSON object. No markdown, no backticks.
      
      The JSON object must have exactly these keys:
      {
        "name": "A creative, premium name for this complete outfit styling",
        "type": "Curation Type name",
        "items": {
          "top": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Top Wear" },
          "bottom": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Bottom Wear" },
          "footwear": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Footwear" },
          "accessory": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Accessories" }
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
      - If closet items are missing for a specific category, complete the look using standard fallback garments.

      You must respond with ONLY a valid raw JSON array of 7 objects. No markdown, no backticks.
      
      The JSON array format must match exactly:
      [
        {
          "plannedDate": "Monday",
          "name": "Monday Outfit Name",
          "items": {
            "top": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Top Wear" },
            "bottom": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Bottom Wear" },
            "footwear": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Footwear" },
            "accessory": { "id": "itemId", "name": "Item Name", "imageUrl": "Image URL", "category": "Accessories" }
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
export const generateSuggestions = async (closetItems, stylePreferences) => {
  try {
    const prompt = `
      You are LookSy's elite Personal AI Stylist. The user's style preferences are: ${JSON.stringify(stylePreferences)}.
      
      User's Closet items:
      ${JSON.stringify(closetItems)}
      
      Generate exactly 4 distinct outfit suggestion compositions. Each outfit must have:
      - "name": descriptive premium name (e.g. "Chill Streetwear Fit", "Clean Minimalist Day")
      - "category": which style aesthetic it belongs to (Casual, Formal, Streetwear, Minimalist, Sporty, etc.)
      - "items": array of exactly 3 descriptive garment name strings
      - "color": a light pastel hex color (e.g. '#F8DCCB', '#FFFFFF', '#F5EFEB', '#EFE5DD')

      If wardrobe items exist, base suggestions on items they own.

      You must respond with ONLY a valid raw JSON array of exactly 4 objects. No markdown, no backticks.
      
      [
        {
          "id": "outfit_s1",
          "name": "Outfit Name",
          "category": "Streetwear",
          "items": ["Item 1", "Item 2", "Item 3"],
          "color": "#F8DCCB"
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
    return getFallbackSuggestions(closetItems, stylePreferences);
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
    { name: 'Ivory Silk Ruffle Blouse', category: 'Top Wear', colorName: 'Cream', colorHex: '#FFFDF9', pattern: 'Solid', season: 'All-Season', occasion: 'Casual' },
    { name: 'Tailored Charcoal Trousers', category: 'Bottom Wear', colorName: 'Charcoal', colorHex: '#4A4A4A', pattern: 'Solid', season: 'All-Season', occasion: 'Business' },
    { name: 'Classic Leather Oxford', category: 'Footwear', colorName: 'Tan', colorHex: '#C19A6B', pattern: 'Solid', season: 'All-Season', occasion: 'Formal' },
    { name: 'Warm Sand Knit Cardigan', category: 'Top Wear', colorName: 'Warm Sand', colorHex: '#D2B48C', pattern: 'Textured', season: 'Autumn', occasion: 'Casual' },
    { name: 'Midnight Navy Blazer', category: 'Top Wear', colorName: 'Navy Blue', colorHex: '#2B4C7E', pattern: 'Solid', season: 'All-Season', occasion: 'Business' },
    { name: 'Structured Espresso Tote', category: 'Accessories', colorName: 'Espresso', colorHex: '#3B1C0C', pattern: 'Solid', season: 'All-Season', occasion: 'Formal' },
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const getFallbackOutfitCuration = (baseItem, closetItems, parameter, type) => {
  const tops = closetItems.filter(i => i.category === 'Top Wear');
  const bottoms = closetItems.filter(i => i.category === 'Bottom Wear');
  const shoes = closetItems.filter(i => i.category === 'Footwear');
  const accessories = closetItems.filter(i => i.category === 'Accessories');

  const getRand = (arr, fallback) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : fallback;

  const fbTop = { id: 'fb_top', name: 'Ivory Silk Button-Down', category: 'Top Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4', isFallback: true };
  const fbBottom = { id: 'fb_bottom', name: 'Tailored Wide-Leg Trousers', category: 'Bottom Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE', isFallback: true };
  const fbShoe = { id: 'fb_shoe', name: 'Pointed Leather Pumps', category: 'Footwear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY', isFallback: true };
  const fbAcc = { id: 'fb_acc', name: 'Classic Camel Trench Coat', category: 'Accessories', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tw2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM', isFallback: true };

  const selectedTop = baseItem?.category === 'Top Wear' ? baseItem : getRand(tops, fbTop);
  const selectedBottom = baseItem?.category === 'Bottom Wear' ? baseItem : getRand(bottoms, fbBottom);
  const selectedShoe = baseItem?.category === 'Footwear' ? baseItem : getRand(shoes, fbShoe);
  const selectedAcc = baseItem?.category === 'Accessories' ? baseItem : getRand(accessories, fbAcc);

  return {
    name: `${type || 'Curated'} ${parameter?.split(' ')[0] || 'Look'}`,
    type: type || 'Curated',
    items: {
      top: selectedTop,
      bottom: selectedBottom,
      footwear: selectedShoe,
      accessory: selectedAcc,
    },
  };
};

const getFallbackWeeklyPlanner = (closetItems, vibe) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const fbTop = { id: 'fb_ai_t', name: 'Ivory Silk Slip Dress', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtW5eVHJ9MX0Mc_ooTyQ_Y2dyNu8FFJqtGiOqlGxeG9bd8tST2nw1n4eDIF-QK4I03D1kV9BEsXQAboEbC5prK_GhgYyppFYp1Q0hiOp-CjFGsWg3GMA4XuMob06CIiQUQU-xlg2Zq6nzlpBut8ekgWShAmKRPddxd8DzP_AkseULzeaicuV0nWOpR4Q7Si0lsl0Be6-X3VrtBT7jfP8hxguB0iX-20iGHLmXwEl3EMRVespKpK3I9HjgVlgG3c6x6bgaYqYTmVf4' };
  const fbBottom = { id: 'fb_ai_b', name: 'Wide-Leg White Trousers', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoh0N90yJ5MDl6c1pJQoMgj1_69saIexO5gQiJ4lsrVp-KZQCq0BrnV4-gIf9ut0WGlJsJQh5q_ySJ7NisQE1JNmBYKYG1djb1njjUCdoUaVh059CIizjauo6-mu1Epcd74XMlfb5h5KbI728vclCQuSfooidiDEf8Mt0vSu2ITNU00Dh-eOjbZMotUlmCbQEaGI6de-eJEGGsuKVFo--KbehadqfG_Hfi0dUrZqO6Xn9c1033-hNhkL5YWRvM6QthGfcHxPkgK_Y' };

  return days.map((day, idx) => {
    const tops = closetItems.filter(i => i.category === 'Top Wear');
    const bots = closetItems.filter(i => i.category === 'Bottom Wear');
    return {
      plannedDate: day,
      name: `${day} ${vibe} Look`,
      items: {
        top: tops[idx % Math.max(tops.length, 1)] || fbTop,
        bottom: bots[idx % Math.max(bots.length, 1)] || fbBottom,
      },
    };
  });
};

const getFallbackSuggestions = (closetItems, stylePreferences) => {
  const tops = (closetItems || []).filter(i => i.category === 'Top Wear');
  const bottoms = (closetItems || []).filter(i => i.category === 'Bottom Wear');
  const shoes = (closetItems || []).filter(i => i.category === 'Footwear');

  const baseOutfits = [
    { id: 'outfit_s1', name: 'Chill Streetwear Fit', category: 'Streetwear', items: ['Oversized Graf Tee', 'Baggy Chino Pants', 'Classic Dunks'], color: '#F8DCCB' },
    { id: 'outfit_s2', name: 'Clean Minimalist Day', category: 'Minimalist', items: ['Plain White Tee', 'Dark Indigo Jeans', 'Leather Court Shoes'], color: '#FFFFFF' },
    { id: 'outfit_s3', name: 'Business Casual Smart', category: 'Formal', items: ['Oatmeal Blazer', 'Tailored Beige Pants', 'Suede Loafers'], color: '#F5EFEB' },
    { id: 'outfit_s4', name: 'Warm Weather Casual', category: 'Casual', items: ['Polo Knit Top', 'Drawstring Shorts', 'Espadrilles Slipons'], color: '#EFE5DD' },
  ];

  return baseOutfits.map((outfit, idx) => {
    const updatedItems = [...outfit.items];
    if (tops[idx]) updatedItems[0] = tops[idx].name;
    if (bottoms[idx]) updatedItems[1] = bottoms[idx].name;
    if (shoes[idx]) updatedItems[2] = shoes[idx].name;
    return { ...outfit, items: updatedItems };
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
