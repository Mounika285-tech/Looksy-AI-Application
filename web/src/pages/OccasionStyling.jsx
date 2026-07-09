import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { 
  FiZap, 
  FiHeart, 
  FiRefreshCw, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiHash
} from 'react-icons/fi';
import { curateOutfit } from '../utils/geminiService';

export const OccasionStyling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Styling States
  const [description, setDescription] = useState('');
  const [closetItems, setClosetItems] = useState([]);
  const [curatedOutfit, setCuratedOutfit] = useState(null);
  const [curating, setCurating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hashtags = [
    '#BeachWedding',
    '#BlackTieGala',
    '#TechConference',
    '#FirstDate',
    '#ArtGalleryOpening',
  ];

  // Sync closet
  useEffect(() => {
    if (!user) return;
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClosetItems(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setClosetItems([]);
      }
    });
  }, [user]);

  const handleHashtagPress = (tag) => {
    setDescription(`Curating styling for a ${tag.replace('#', '').replace(/([A-Z])/g, ' $1').trim()}. Needs to feel elegant, modern, and perfectly coordinated.`);
  };

  // Curate Outfit
  const handleCurate = async () => {
    if (!description.trim()) return;
    if (closetItems.length === 0) {
      alert('Your wardrobe is empty! Upload garments to curate outfits.');
      return;
    }

    setCurating(true);
    setSaved(false);
    try {
      // Find a random base item
      const baseItem = closetItems[Math.floor(Math.random() * closetItems.length)];
      
      const result = await curateOutfit(closetItems, baseItem, `Occasion/Vibe Description: ${description}`, 'Occasion Styling');
      setCuratedOutfit(result);
    } catch (e) {
      console.error('Curation error:', e);
    } finally {
      setCurating(false);
    }
  };

  // Save Outfit
  const handleSaveOutfit = async () => {
    if (!curatedOutfit || !user) return;
    setSaving(true);
    try {
      const favRef = ref(database, `users/${user.uid}/favorite_outfits`);
      const newFavRef = push(favRef);
      
      const itemsData = {};
      Object.keys(curatedOutfit.items || {}).forEach((key) => {
        const item = curatedOutfit.items[key];
        if (item) {
          itemsData[key] = {
            id: item.id || '',
            name: item.name || '',
            imageUrl: item.imageUrl || '',
            category: item.category || '',
          };
        }
      });

      await set(newFavRef, {
        name: curatedOutfit.name || 'Occasion Outfit',
        type: 'Occasion Styling',
        createdAt: Date.now(),
        items: itemsData,
      });

      setSaved(true);
      alert('Saved!', 'This look has been added to your Saved Favorites.');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Back button header */}
      <div style={styles.navHeader}>
        <button onClick={() => navigate('/outfits')} style={styles.backBtn}>
          <FiArrowLeft size={16} style={{ marginRight: 8 }} />
          <span>Back to Styling</span>
        </button>
      </div>

      <div style={styles.grid}>
        
        {/* Left config column */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={{ marginBottom: '20px' }}>
              <span style={styles.badge}>Live Assistant</span>
              <h2 style={styles.cardTitle}>Occasion Styling</h2>
            </div>

            {/* Popular hashtag chips */}
            <div style={styles.hashtagBox}>
              <p style={styles.sectionLabel}>Popular Requests</p>
              <div style={styles.chipsContainer}>
                {hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleHashtagPress(tag)}
                    style={styles.hashtagChip}
                  >
                    <FiHash size={12} style={{ marginRight: 2 }} />
                    <span>{tag.replace('#', '')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea description */}
            <div style={styles.inputGroup}>
              <p style={styles.sectionLabel}>Event Description</p>
              <textarea
                rows={5}
                placeholder="Describe the vibe, color palette, or settings (e.g. 'Rooftop cocktail party in summer, aiming for elegant chic')..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <button 
              onClick={handleCurate}
              disabled={!description.trim() || curating}
              style={{
                ...styles.curateBtn,
                opacity: (!description.trim() || curating) ? 0.7 : 1
              }}
            >
              {curating ? (
                <>
                  <FiRefreshCw size={16} className="animate-spin" style={{ marginRight: 8 }} />
                  <span>AI Coordinating Closet...</span>
                </>
              ) : (
                <>
                  <FiZap size={16} style={{ marginRight: 8 }} />
                  <span>Curate Outfit Suggestion</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right curation output column */}
        <div style={styles.rightCol}>
          {curating ? (
            <div style={styles.curatingLoaderCard}>
              <div className="animate-spin" style={styles.aiSpinner}></div>
              <h3 style={styles.loaderTitle}>LookSy AI Curating</h3>
              <p style={styles.loaderDesc}>Running Gemini model analysis on your garment textures and color tones...</p>
            </div>
          ) : curatedOutfit ? (
            <div style={styles.resultCard} className="animate-fade-in">
              <div style={styles.resultHeader}>
                <div>
                  <span style={styles.successBadge}>Coordinate Curated</span>
                  <h3 style={styles.outfitName}>{curatedOutfit.name}</h3>
                </div>
                <button 
                  onClick={handleSaveOutfit}
                  disabled={saved || saving}
                  style={{
                    ...styles.saveBtn,
                    borderColor: saved ? colors.success : colors.border,
                    color: saved ? colors.success : colors.text
                  }}
                >
                  <FiHeart size={14} style={{ marginRight: 6, fill: saved ? colors.success : 'none' }} />
                  <span>{saved ? 'Saved!' : 'Save Favorite'}</span>
                </button>
              </div>

              {/* Composition list */}
              <div style={styles.compositionList}>
                {Object.keys(curatedOutfit.items || {}).map((key) => {
                  const garment = curatedOutfit.items[key];
                  if (garment) {
                    return (
                      <div key={garment.id} style={styles.garmentRow}>
                        <img src={garment.imageUrl} alt={garment.name} style={styles.garmentThumb} />
                        <div style={styles.garmentMeta}>
                          <span style={styles.garmentCat}>{garment.category || key}</span>
                          <p style={styles.garmentName}>{garment.name}</p>
                        </div>
                        <FiCheckCircle size={18} color={colors.primary} />
                      </div>
                    );
                  }
                  
                  // Suggested additions
                  const addition = curatedOutfit.suggestedAdditions?.[key];
                  return (
                    <div key={key} style={{ ...styles.garmentRow, opacity: 0.65 }}>
                      <div style={styles.emptyThumb}>
                        <FiAlertCircle size={16} />
                      </div>
                      <div style={styles.garmentMeta}>
                        <span style={styles.garmentCat}>{key} Wear (Missing)</span>
                        <p style={{ ...styles.garmentName, fontStyle: 'italic' }}>
                          Add {addition || `a matching ${key}`} to your closet
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.emptyResultCard}>
              <FiZap size={36} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>Curate Occasion Outfits</h3>
              <p style={styles.emptyDesc}>Write a details description of your event or click a popular requests tag to start. Our AI handles the rest.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  navHeader: {
    marginBottom: '24px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.8fr',
    gap: '32px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
    marginTop: '4px',
  },
  hashtagBox: {
    marginBottom: '20px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  hashtagChip: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    cursor: 'pointer',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  textarea: {
    width: '100%',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text,
    outline: 'none',
    lineHeight: 1.5,
    resize: 'none',
  },
  curateBtn: {
    width: '100%',
    height: '46px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '23px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
  },
  curatingLoaderCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  aiSpinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '4px solid #E8E2DC',
    borderTopColor: colors.primary,
  },
  loaderTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: colors.text,
    marginTop: '16px',
    marginBottom: '8px',
  },
  loaderDesc: {
    fontSize: '13px',
    color: colors.textSecondary,
    maxWidth: '260px',
    lineHeight: 1.5,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '20px',
    marginBottom: '20px',
  },
  successBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  outfitName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
    marginTop: '6px',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '18px',
    paddingLeft: '14px',
    paddingRight: '14px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  compositionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  garmentRow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '12px',
  },
  garmentThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    objectFit: 'cover',
    marginRight: '12px',
    border: `1px solid ${colors.border}`,
  },
  emptyThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
  },
  garmentMeta: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  garmentCat: {
    fontSize: '9px',
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  garmentName: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.text,
    marginTop: '2px',
  },
  emptyResultCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px dashed ${colors.border}`,
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: colors.text,
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '13px',
    color: colors.textSecondary,
    lineHeight: 1.5,
    maxWidth: '280px',
    fontWeight: '500',
  },
};
export default OccasionStyling;
