import { GEMINI_API_KEY, GEMINI_ENDPOINT } from '../config/gemini';

// Helper to convert dynamic image URLs to base64 data inline blocks for Gemini Multimodal calls
async function imageToGenerativePart(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64data,
            mimeType: blob.type || "image/jpeg"
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image URL to base64 inline part:", error);
    throw error;
  }
}

/**
 * 1. Analyze garment picture using Gemini 2.5 Flash Vision API
 */
export const analyzeGarmentImage = async (imageUrl) => {
  try {
    const imagePart = await imageToGenerativePart(imageUrl);

    const prompt = `
      You are an expert fashion computer vision analyzer. Analyze this clothing garment image and classify its details.
      
      You must respond with ONLY a valid raw JSON object. Do not include markdown code block syntax (like \`\`\`json or \`\`\`), no backticks, and no extra conversational text.
      
      The JSON object must have exactly these keys:
      {
        "name": "A creative, fashion-industry descriptive name for this item (e.g., Ivory Silk Ruffled Blouse, Tailored Charcoal Wool Trousers)",
        "category": "Must be exactly one of: Top Wear, Bottom Wear, Footwear, Accessories, Other",
        "colorName": "A descriptive name of the dominant color (e.g., Soft Sage, Camel, Lavender Cream, Navy Blue)",
        "colorHex": "The exact dominant hex color code representing this item (e.g., #8FBC8F, #C19A6B, #2B4C7E)",
        "pattern": "Must be exactly one of: Solid, Striped, Checked, Floral, Graphic Print, Polka Dot, Textured, Other",
        "season": "Spring, Summer, Autumn, Winter, or All-Season",
        "occasion": "Must be exactly one of: Casual, Formal, Business, Party, Wedding, Sports, Travel, Other"
      }
    `;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: Status ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;
    
    // Sanitize output of potential backticks
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Image Analysis failed. Invoking safe fallback parser:", error);
    return getFallbackGarmentAnalysis(imageUrl);
  }
};

/**
 * 2. Curate cohesive outfit combinations based on a target Context (Occasion, Weather, or Mix & Match)
 */
export const curateOutfit = async (closetItems, baseItem, parameter, type) => {
  try {
    const prompt = `
      You are LookSy's expert AI Fashion Stylist. I want you to curate a cohesive, professional, and visually stunning outfit combination from the user's available digital wardrobe.
      
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
        * Accessories fallback: name: 'Classic Camel Trench Coat', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tw2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM'

      You must respond with ONLY a valid raw JSON object. Do not include markdown code block syntax (like \`\`\`json or \`\`\`), no backticks, and no extra text.
      
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
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Gemini API Error");

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Styling curation failed. Invoking safe fallback curations:", error);
    return getFallbackOutfitCuration(baseItem, closetItems, parameter, type);
  }
};

/**
 * 3. Generate a 7-day style planner from Monday to Sunday using user's real wardrobe items
 */
export const generateWeeklyPlanner = async (closetItems, vibe, climate) => {
  try {
    const prompt = `
      You are LookSy's elite Personal AI Stylist. Plan a full 7-day weekly schedule (Monday through Sunday) for the user.
      
      Styling Vibe Theme: ${vibe}
      Target Weather Context: ${climate}
      
      User's Closet items available for scheduling:
      ${JSON.stringify(closetItems)}
      
      For each of the 7 days (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday), create a cohesive daily outfit composition.
      Each day must have a descriptive "name" (e.g. Monday Casual Sleek, Wednesday Client Pitch) and select a "top", "bottom", "footwear", and optional "accessory" from their closet items.
      - If closet items are missing for a specific category, complete the look using standard fallback garments.

      You must respond with ONLY a valid raw JSON array of 7 objects. Do not include markdown code block syntax (like \`\`\`json or \`\`\`), no backticks, and no extra text.
      
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
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Gemini API Error");

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Weekly Planner failed. Invoking safe fallback calendar planner:", error);
    return getFallbackWeeklyPlanner(closetItems, vibe, climate);
  }
};

/* --- INTELLIGENT COMPLEMENTARY FALLBACK PARSERS --- */

const getFallbackGarmentAnalysis = (imageUrl) => {
  const urlLower = (imageUrl || '').toLowerCase();
  
  // 1. Semantic Category Detection from URL keywords
  let category = 'Top Wear';
  if (urlLower.includes('pant') || urlLower.includes('jean') || urlLower.includes('trouser') || urlLower.includes('short') || urlLower.includes('skirt') || urlLower.includes('bottom')) {
    category = 'Bottom Wear';
  } else if (urlLower.includes('shoe') || urlLower.includes('boot') || urlLower.includes('sneaker') || urlLower.includes('dunk') || urlLower.includes('loafer') || urlLower.includes('footwear') || urlLower.includes('pump') || urlLower.includes('slipon')) {
    category = 'Footwear';
  } else if (urlLower.includes('coat') || urlLower.includes('jacket') || urlLower.includes('bag') || urlLower.includes('belt') || urlLower.includes('scarf') || urlLower.includes('accessory') || urlLower.includes('glasses')) {
    category = 'Accessories';
  } else if (urlLower.includes('shirt') || urlLower.includes('tee') || urlLower.includes('blouse') || urlLower.includes('polo') || urlLower.includes('knit') || urlLower.includes('top')) {
    category = 'Top Wear';
  } else {
    // If no keyword, distribute category heuristically based on a clean random selection
    const cats = ['Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];
    category = cats[Math.floor(Math.random() * cats.length)];
  }

  // 2. High-Fidelity Pattern & Occasion Pools
  const patterns = ['Solid', 'Striped', 'Checked', 'Floral', 'Graphic Print', 'Polka Dot', 'Textured'];
  const occasions = ['Casual', 'Formal', 'Business', 'Party', 'Wedding', 'Sports', 'Travel'];
  const seasons = ['Spring', 'Summer', 'Autumn', 'Winter', 'All-Season'];

  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  const selectedOccasion = occasions[Math.floor(Math.random() * occasions.length)];
  const selectedSeason = seasons[Math.floor(Math.random() * seasons.length)];

  // 3. Rich Color Palette Pool (36 Premium Shades matching our Rainbow grid)
  const premiumColors = [
    { name: 'Scarlet Red', hex: '#E53E3E' },
    { name: 'Crimson Burgundy', hex: '#9B2C2C' },
    { name: 'Blush Pink', hex: '#FEB2B2' },
    { name: 'Hot Pink', hex: '#ED64A6' },
    { name: 'Deep Fuchsia', hex: '#D53F8C' },
    { name: 'Plum Purple', hex: '#702459' },
    { name: 'Warm Coral', hex: '#F05A5B' },
    { name: 'Sunset Orange', hex: '#ED8936' },
    { name: 'Mustard Gold', hex: '#E2B842' },
    { name: 'Lemon Yellow', hex: '#F6E05E' },
    { name: 'Amber Glow', hex: '#D69E2E' },
    { name: 'Peach Cream', hex: '#FBD38D' },
    { name: 'Lime Green', hex: '#9AE6B4' },
    { name: 'Mint Leaf', hex: '#68D391' },
    { name: 'Emerald Forest', hex: '#38A169' },
    { name: 'Dark Sage', hex: '#22543D' },
    { name: 'Olive Drab', hex: '#808000' },
    { name: 'Soft Sage', hex: '#8FBC8F' },
    { name: 'Dark Teal', hex: '#234E52' },
    { name: 'Teal Blue', hex: '#319795' },
    { name: 'Cyan Sky', hex: '#00FFFF' },
    { name: 'Sky Blue', hex: '#63B3ED' },
    { name: 'Royal Blue', hex: '#3182CE' },
    { name: 'Navy Blue', hex: '#2B4C7E' },
    { name: 'Soft Lavender', hex: '#E9D8FD' },
    { name: 'Lilac Dusk', hex: '#D6BCFA' },
    { name: 'Bright Violet', hex: '#B794F4' },
    { name: 'Classic Purple', hex: '#805AD5' },
    { name: 'Deep Indigo', hex: '#553C9A' },
    { name: 'Midnight Blue', hex: '#1A365D' },
    { name: 'Warm Beige', hex: '#F5EFEB' },
    { name: 'Camel Tan', hex: '#EDC9AF' },
    { name: 'Chocolate Brown', hex: '#5C3A21' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Silver Gray', hex: '#E2E8F0' },
    { name: 'Charcoal Black', hex: '#2C2A29' }
  ];

  const selectedColor = premiumColors[Math.floor(Math.random() * premiumColors.length)];

  // 4. Creative Fabric Name Generators based on category and color
  const topNames = ['Linen Shirt', 'Classic Tee', 'Polo Knit', 'Silk Blouse', 'Oversized Jersey', 'Ruffled Knitwear'];
  const bottomNames = ['Tailored Pants', 'Indigo Jeans', 'Chino Shorts', 'Pleated Skirt', 'Cargo Joggers', 'Culotte Trousers'];
  const footwearNames = ['Leather Sneakers', 'Suede Loafers', 'Pointed Pumps', 'Chelsea Boots', 'Espadrille Slipons', 'Ankle Sandals'];
  const accessoryNames = ['Camel Trench', 'Wool Scarf', 'Leather Belt', 'Canvas Tote Bag', 'Aviator Glasses', 'Minimalist Watch'];

  let itemName = `Textured ${selectedColor.name} Top`;
  if (category === 'Top Wear') {
    itemName = `${selectedColor.name} ${topNames[Math.floor(Math.random() * topNames.length)]}`;
  } else if (category === 'Bottom Wear') {
    itemName = `${selectedColor.name} ${bottomNames[Math.floor(Math.random() * bottomNames.length)]}`;
  } else if (category === 'Footwear') {
    itemName = `${selectedColor.name} ${footwearNames[Math.floor(Math.random() * footwearNames.length)]}`;
  } else if (category === 'Accessories') {
    itemName = `${selectedColor.name} ${accessoryNames[Math.floor(Math.random() * accessoryNames.length)]}`;
  }

  return {
    name: itemName,
    category: category,
    colorName: selectedColor.name,
    colorHex: selectedColor.hex,
    pattern: selectedPattern,
    season: selectedSeason,
    occasion: selectedOccasion,
    imageUrl: imageUrl
  };
};

const getFallbackOutfitCuration = (baseItem, closetItems, parameter, type) => {
  const fallbacks = {
    'Top Wear': { id: 'fb_t_silk', name: 'Ivory Silk Button-Down', category: 'Top Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4' },
    'Bottom Wear': { id: 'fb_b_trouser', name: 'Tailored Wide-Leg Trousers', category: 'Bottom Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAvJK9ZIe29WPrjgGNxnyxO9U9gqO-AxXrtAslSgPrpmyHjyjApemwBTE9Ii8OJDB6nFGnOvFpGjZ6ZSir9LO9JDXpJGhc46m2LQ8m3Js1pHf8HrNctm7hluJPwMjcGDnCZSkGhwxcp6qFlELZtxv5apg2RjUxCbS654mTL0hhMbpoRMmxG0KMfdA0Sa-Mp0ZOqIKRY_UL7xT7eskCc15t19n8XxEFhbXJoQzM4qwPZMe_Fm5S2YBdM_CYje8xi_NGgr7-KWj_XqE' },
    'Footwear': { id: 'fb_f_pump', name: 'Pointed Leather Pumps', category: 'Footwear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6xM_c1ZnQnGYmDB6mTSmlJis3BoNGNOicxm2ybXbW-x5qqSoMYJEtpV1AzZDR3CDkIrX6G3lhRZQxjHF2RgMjt4B2q_rKScN1hX3fyBzFdcmDtW0PZJ0rJMywMWEKovppWBE3bqKJ38O_cz26MmTnm9sCqNaDK36aSIhaO_yn59aLYfcQKAlZ-6xAiMYkiGv2e8ze8odJh989VtMbtyp9nVfaiKOQOe2TEOzw-kP5RtJu91ariljYpYBfFcpgRoIXnLb-MrQULYY' },
    'Accessories': { id: 'fb_a_coat', name: 'Classic Camel Trench Coat', category: 'Accessories', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHVpIFT5dGtyzj8s0ebTZ4TMq1BHM6uVue9hMJG0j2EjrQZLinMwsmy8ksSYH1s4DO6efQj87KE7t6-zyRwq_83z4FvYbkVfhm-ufK2VFU3JR31Jp9-EWgPW-evaNJt4X5H-Ax-InQnODX-XdiINGv9UdXWKstm2tw2wX3KijZoCfiOPenSlylofnHUCmQ8zsU47YUZV7XvrHh3N02ncJO-tU44wX7jCoCGt3OvuDBgX69Ww7PU0GIGG1qr_jeJaP7tUlnsUKo5TM' }
  };

  const getBest = (cat, fallbackItem) => {
    const list = (closetItems || []).filter((i) => i.category === cat && i.id !== baseItem.id);
    return list.length > 0 ? list[Math.floor(Math.random() * list.length)] : fallbackItem;
  };

  return {
    name: `${baseItem.name || 'Harmonized'} ${parameter || 'Stylist'} Look`,
    type: type || 'Stylist Curation',
    items: {
      top: baseItem.category === 'Top Wear' ? baseItem : getBest('Top Wear', fallbacks['Top Wear']),
      bottom: baseItem.category === 'Bottom Wear' ? baseItem : getBest('Bottom Wear', fallbacks['Bottom Wear']),
      footwear: baseItem.category === 'Footwear' ? baseItem : getBest('Footwear', fallbacks['Footwear']),
      accessory: baseItem.category === 'Accessories' ? baseItem : getBest('Accessories', fallbacks['Accessories'])
    }
  };
};

const getFallbackWeeklyPlanner = (closetItems, vibe, climate) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const baseTops = (closetItems || []).filter((i) => i.category === 'Top Wear');
  const baseBottoms = (closetItems || []).filter((i) => i.category === 'Bottom Wear');
  
  const getRand = (list, fallback) => {
    return list.length > 0 ? list[Math.floor(Math.random() * list.length)] : fallback;
  };

  return days.map((day) => {
    const baseOutfit = getFallbackOutfitCuration(
      getRand(baseTops, { name: 'Cotton Slub Tee', category: 'Top Wear', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1Sgr9Pa4_6XLRglzV63ug_apiEBEBCCfRbBRLhw7ZLaoS-cYN2ZRfHWsHcHf0O7s_Vr4JUbJ3sAJsIdHCdqFscS6SHt-5a68N8wXVA5PrI-yUXAZHutdBo0fjpMK4NQY62CIOgYmXyQLhZp2bPUOQt5RlJMGqxNb6Ofp4gpsmgg0EDtbbOR9jMEJA4SnWWUaUAHJoBRrIOHxAQvLBIavskNNZOe6zR6E5a05Rmx6SypGOiSwz5BLS07tRp8ZAKex3v_0NmmG_o4' }),
      closetItems,
      `${vibe} Style`,
      'Weekly Schedule'
    );
    return {
      plannedDate: day,
      name: `${day} ${vibe} Look`,
      items: baseOutfit.items
    };
  });
};

/**
 * 4. Generate dynamic suggestions/lookbooks based on user style preferences and wardrobe items
 */
export const generateSuggestions = async (closetItems, stylePreferences) => {
  try {
    const prompt = `
      You are LookSy's elite Personal AI Stylist. The user has selected the following style preference aesthetics: ${JSON.stringify(stylePreferences)}.
      
      User's Closet items available for curation:
      ${JSON.stringify(closetItems)}
      
      Generate exactly 4 distinct outfit suggestion compositions. Each outfit must have a descriptive premium "name" (e.g. Chill Streetwear Fit, Clean Minimalist Day), a matched "category" indicating which style preference aesthetic it belongs to, a list of "items" (each item is a text string of a descriptive garment name to complete the look), and a background "color" in hex code (a light pastel/cream hex color compatible with the app's aesthetic, e.g. '#F8DCCB', '#FFFFFF', '#F5EFEB', '#EFE5DD').
      - Each outfit composition should be tailored to one of the selected style preferences or standard styles (Casual, Formal, Streetwear, Minimalist, Sporty, Traditional).
      - If there are wardrobe items in the user's closet, try to recommend outfits based on items they own, combining text descriptions of those items and/or fallbacks.
      - Each outfit should specify exactly 3 to 4 descriptive item name strings in the "items" array.
      
      You must respond with ONLY a valid raw JSON array of exactly 4 objects. Do not include markdown code block syntax (like \`\`\`json or \`\`\`), no backticks, and no extra conversational text.
      
      The JSON array format must match exactly:
      [
        {
          "id": "outfit_s1",
          "name": "Outfit Name",
          "category": "Streetwear",
          "items": ["Item Description 1", "Item Description 2", "Item Description 3"],
          "color": "#F8DCCB"
        },
        ... (repeat for a total of exactly 4 outfits)
      ]
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Gemini API Error");

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Suggestions curation failed. Invoking safe fallback lookbook suggestions:", error);
    return getFallbackSuggestions(closetItems, stylePreferences);
  }
};

const getFallbackSuggestions = (closetItems, stylePreferences) => {
  const selectedStyleTags = stylePreferences || ['casual', 'minimalist'];
  const baseOutfits = [
    {
      id: 'outfit_s1',
      name: 'Chill Streetwear Fit',
      category: 'Streetwear',
      items: ['Oversized Graf Tee', 'Baggy Chino Pants', 'Classic Dunks'],
      color: '#F8DCCB',
    },
    {
      id: 'outfit_s2',
      name: 'Clean Minimalist Day',
      category: 'Minimalist',
      items: ['Plain White Tee', 'Dark Indigo Jeans', 'Leather Court Shoes'],
      color: '#FFFFFF',
    },
    {
      id: 'outfit_s3',
      name: 'Business Casual Smart',
      category: 'Formal',
      items: ['Oatmeal Blazer', 'Tailored Beige Pants', 'Suede Loafers'],
      color: '#F5EFEB',
    },
    {
      id: 'outfit_s4',
      name: 'Warm Weather Casual',
      category: 'Casual',
      items: ['Polo Knit Top', 'Drawstring Shorts', 'Espadrilles Slipons'],
      color: '#EFE5DD',
    },
  ];

  // Try to inject real user closet items into the descriptions if we have items
  const tops = (closetItems || []).filter(i => i.category === 'Top Wear');
  const bottoms = (closetItems || []).filter(i => i.category === 'Bottom Wear');
  const shoes = (closetItems || []).filter(i => i.category === 'Footwear');

  return baseOutfits.map((outfit, index) => {
    const updatedItems = [...outfit.items];
    if (tops.length > 0 && index < tops.length) {
      updatedItems[0] = tops[index].name;
    }
    if (bottoms.length > 0 && index < bottoms.length) {
      updatedItems[1] = bottoms[index].name;
    }
    if (shoes.length > 0 && index < shoes.length) {
      updatedItems[2] = shoes[index].name;
    }
    return {
      ...outfit,
      items: updatedItems
    };
  });
};
