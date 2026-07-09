import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { 
  FiArrowLeft, 
  FiZap, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiInfo, 
  FiLayers 
} from 'react-icons/fi';
import { generateColorHarmonyInsight } from '../utils/geminiService';

export const ColorMatching = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // States
  const [closetItems, setClosetItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [harmonyType, setHarmonyType] = useState('monochromatic');
  const [insightData, setInsightData] = useState(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Sync closet
  useEffect(() => {
    if (!user) return;
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubscribe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        setClosetItems(parsed);
        if (parsed.length > 0) {
          setSelectedItem(parsed[0]);
        }
      } else {
        setClosetItems([]);
      }
      setIsLoadingItems(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Generate color matching
  const handleGenerate = async () => {
    if (!selectedItem) return;
    setGenerating(true);
    try {
      const result = await generateColorHarmonyInsight(selectedItem, harmonyType);
      setInsightData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const harmonyModes = [
    { value: 'monochromatic', label: 'Tonal Harmony', desc: 'Shades & tones of the same hue' },
    { value: 'analogous', label: 'Adjacent Harmony', desc: 'Colors side by side on color wheel' },
    { value: 'complementary', label: 'Contrast Harmony', desc: 'Opposing color opposites for bold pops' }
  ];

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
        
        {/* Left Column Config */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={{ marginBottom: '24px' }}>
              <span style={styles.badge}>Color Theory</span>
              <h2 style={styles.cardTitle}>Color Harmonizer</h2>
            </div>

            {isLoadingItems ? (
              <div style={styles.itemLoader}>
                <div className="animate-spin" style={styles.spinner}></div>
                <p style={{ marginTop: '8px', fontSize: '12px' }}>Syncing wardrobe color profiles...</p>
              </div>
            ) : closetItems.length > 0 ? (
              <div style={styles.form}>
                
                {/* Select Base Garment */}
                <div style={styles.inputGroup}>
                  <p style={styles.sectionLabel}>Select Base Garment</p>
                  <div style={styles.selectorGrid}>
                    {closetItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          style={{
                            ...styles.garmentOption,
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? 'rgba(240, 90, 91, 0.02)' : '#FFFFFF'
                          }}
                        >
                          <img src={item.imageUrl} alt={item.name} style={styles.garmentThumb} />
                          <div style={styles.garmentMeta}>
                            <p style={styles.garmentName}>{item.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span style={{ ...styles.colorDot, backgroundColor: item.colorHex }} />
                              <span style={styles.colorName}>{item.colorName || 'Neutral'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Select Harmony Mode */}
                <div style={styles.inputGroup}>
                  <p style={styles.sectionLabel}>Harmony Mode</p>
                  <div style={styles.modesList}>
                    {harmonyModes.map((mode) => {
                      const isSelected = harmonyType === mode.value;
                      return (
                        <div 
                          key={mode.value}
                          onClick={() => setHarmonyType(mode.value)}
                          style={{
                            ...styles.modeCard,
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? 'rgba(240, 90, 91, 0.02)' : '#FFFFFF'
                          }}
                        >
                          <h4 style={{ ...styles.modeLabel, color: isSelected ? colors.primary : colors.text }}>
                            {mode.label}
                          </h4>
                          <p style={styles.modeDesc}>{mode.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={generating || !selectedItem}
                  style={{
                    ...styles.generateBtn,
                    opacity: (generating || !selectedItem) ? 0.7 : 1
                  }}
                >
                  {generating ? (
                    <>
                      <FiRefreshCw size={16} className="animate-spin" style={{ marginRight: 8 }} />
                      <span>Analyzing harmonies...</span>
                    </>
                  ) : (
                    <>
                      <FiZap size={16} style={{ marginRight: 8 }} />
                      <span>Compute Harmonized Tone</span>
                    </>
                  )}
                </button>

              </div>
            ) : (
              <div style={styles.emptyCloset}>
                <FiLayers size={32} color={colors.textSecondary} style={{ marginBottom: '12px' }} />
                <p>Please upload some garments first to match their colors!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column Output */}
        <div style={styles.rightCol}>
          {generating ? (
            <div style={styles.loaderCard}>
              <div className="animate-spin" style={styles.aiSpinner}></div>
              <h3 style={styles.loaderTitle}>Color theory analyzing</h3>
              <p style={styles.loaderDesc}>Mapping hexadecimal parameters against companion color theory wheels...</p>
            </div>
          ) : insightData ? (
            <div style={styles.resultCard} className="animate-fade-in">
              <div style={styles.resultHeader}>
                <span style={styles.successBadge}>Harmony Completed</span>
                <h3 style={styles.resultTitle}>Companion Palette</h3>
              </div>

              {/* Color Swatches Grid */}
              <div style={styles.paletteGrid}>
                {insightData.palette.map((hex, idx) => (
                  <div key={idx} style={styles.swatchCard}>
                    <div style={{ ...styles.colorBox, backgroundColor: hex }} />
                    <span style={styles.hexCode}>{hex}</span>
                  </div>
                ))}
              </div>

              {/* Insight Text */}
              <div style={styles.insightBox}>
                <FiInfo size={16} color={colors.primary} style={{ marginRight: '10px', marginTop: '2px', flexShrink: 0 }} />
                <p style={styles.insightText}>{insightData.insight}</p>
              </div>

              {/* Styling tips checklist */}
              <div style={styles.tipsSection}>
                <p style={styles.sectionLabel}>Styling Guidelines</p>
                <div style={styles.tipsList}>
                  {insightData.tips.map((tip, idx) => (
                    <div key={idx} style={styles.tipRow}>
                      <FiCheckCircle size={14} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                      <span style={styles.tipText}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyResultCard}>
              <FiZap size={36} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>AI Color Theories</h3>
              <p style={styles.emptyDesc}>Select a clothing base and color harmony mode on the left to compute companion color coordinates.</p>
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
    gridTemplateColumns: '1.3fr 1.7fr',
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
  itemLoader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '30px',
    paddingBottom: '30px',
    color: colors.textSecondary,
  },
  spinner: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #E8E2DC',
    borderTopColor: colors.primary,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  selectorGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '160px',
    overflowY: 'auto',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '10px',
  },
  garmentOption: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid transparent',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  garmentThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover',
    marginRight: '12px',
    border: `1px solid ${colors.border}`,
  },
  garmentMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  garmentName: {
    fontSize: '12px',
    fontWeight: '700',
    color: colors.text,
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    border: `1px solid ${colors.border}`,
  },
  colorName: {
    fontSize: '10px',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modeCard: {
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeLabel: {
    fontSize: '13px',
    fontWeight: '800',
  },
  modeDesc: {
    fontSize: '11px',
    color: colors.textSecondary,
    marginTop: '2px',
    fontWeight: '500',
  },
  generateBtn: {
    width: '100%',
    height: '44px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '22px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
  },
  loaderCard: {
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
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  successBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  resultTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
    marginTop: '6px',
  },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  swatchCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  colorBox: {
    width: '100%',
    height: '70px',
    borderRadius: '12px',
    border: `1.5px solid ${colors.border}`,
  },
  hexCode: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: '8px',
  },
  insightBox: {
    display: 'flex',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
  },
  insightText: {
    fontSize: '13px',
    color: colors.text,
    lineHeight: 1.5,
    fontWeight: '500',
  },
  tipsSection: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: '20px',
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tipRow: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: '13px',
    color: colors.textSecondary,
    fontWeight: '600',
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
  emptyCloset: {
    textAlign: 'center',
    paddingTop: '40px',
    paddingBottom: '40px',
    fontSize: '13px',
    color: colors.textSecondary,
    fontWeight: '500',
  },
};
export default ColorMatching;
