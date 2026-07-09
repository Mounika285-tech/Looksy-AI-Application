import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { 
  FiWind, 
  FiCompass, 
  FiTrendingUp, 
  FiEye, 
  FiClock, 
  FiChevronRight, 
  FiMaximize2, 
  FiX, 
  FiGrid 
} from 'react-icons/fi';
import { inspirationCategories, inspirationGalleries } from '../data/inspirationData';

export const Outfits = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const userGender = profile?.gender?.toLowerCase() || 'female';

  // State
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Sync Recently Viewed
  useEffect(() => {
    if (!user) return;

    const viewsRef = ref(database, `users/${user.uid}/recently_viewed_outfits`);
    const unsubscribe = onValue(viewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort newest first, take top 5
        const sorted = parsed.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 5);
        setRecentlyViewed(sorted);
      } else {
        setRecentlyViewed([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Log viewed outfit (for testing / reuse when viewing lookbook or suggestions)
  const logViewedOutfit = async (outfit) => {
    try {
      if (!user) return;
      const viewRef = ref(database, `users/${user.uid}/recently_viewed_outfits`);
      const newViewRef = push(viewRef);
      await set(newViewRef, {
        name: outfit.name || 'AI Look',
        type: outfit.type || 'Custom Curated',
        viewedAt: Date.now(),
        items: outfit.items || {},
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowGalleryModal(true);
  };

  // Gradients list for lookbook cards
  const getGradient = (idx) => {
    const gradients = [
      'linear-gradient(135deg, #F8DCCB 0%, #EFE5DD 100%)',
      'linear-gradient(135deg, #EFE5DD 0%, #E8E2DC 100%)',
      'linear-gradient(135deg, #FDFBF7 0%, #F8DCCB 100%)',
      'linear-gradient(135deg, #F8DCCB 0%, #E8A598 100%)',
      'linear-gradient(135deg, #F5EFEB 0%, #EFE5DD 100%)',
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Styling & Lookbooks</h1>
        <p style={styles.subtext}>Explore curated looks and curate new styling combinations.</p>
      </div>

      {/* Styling Assistants Cards */}
      <div style={styles.assistantsGrid}>
        
        {/* Weather Assistant */}
        <div onClick={() => navigate('/outfits/weather')} style={styles.assistantCard} className="animate-slide-up">
          <div style={{ ...styles.iconBadge, backgroundColor: 'rgba(240, 90, 91, 0.08)' }}>
            <FiWind size={20} color={colors.primary} />
          </div>
          <h3 style={styles.assistantName}>Climate Styling</h3>
          <p style={styles.assistantDesc}>Fetch live localized forecasts and generate weather-proof outfits instantly.</p>
          <div style={styles.assistantLink}>
            <span>Access Assistant</span>
            <FiChevronRight size={14} />
          </div>
        </div>

        {/* Occasion Assistant */}
        <div onClick={() => navigate('/outfits/occasion')} style={styles.assistantCard} className="animate-slide-up">
          <div style={{ ...styles.iconBadge, backgroundColor: 'rgba(240, 90, 91, 0.08)' }}>
            <FiCompass size={20} color={colors.primary} />
          </div>
          <h3 style={styles.assistantName}>Occasion Curation</h3>
          <p style={styles.assistantDesc}>Describe a custom setting or vibe to generate matching clothing suggestions.</p>
          <div style={styles.assistantLink}>
            <span>Access Assistant</span>
            <FiChevronRight size={14} />
          </div>
        </div>

        {/* Color Match Assistant */}
        <div onClick={() => navigate('/outfits/color-match')} style={styles.assistantCard} className="animate-slide-up">
          <div style={{ ...styles.iconBadge, backgroundColor: 'rgba(240, 90, 91, 0.08)' }}>
            <FiTrendingUp size={20} color={colors.primary} />
          </div>
          <h3 style={styles.assistantName}>Harmonizer</h3>
          <p style={styles.assistantDesc}>Apply color theory harmonies (Analogous, Monochromatic) to any garment base.</p>
          <div style={styles.assistantLink}>
            <span>Access Assistant</span>
            <FiChevronRight size={14} />
          </div>
        </div>

      </div>

      {/* Lookbook Explorer Grid */}
      <div style={styles.lookbookSection}>
        <h2 style={styles.sectionTitle}>Inspiration Lookbooks</h2>
        <div style={styles.lookbookGrid}>
          {inspirationCategories.map((cat, index) => (
            <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat)}
              style={{
                ...styles.lookbookCard,
                background: getGradient(index),
              }}
              className="animate-slide-up"
            >
              <div style={styles.lookbookCardHeader}>
                <span style={styles.lookbookIcon}><FiGrid size={16} color={colors.primary} /></span>
                <span style={styles.arrowIcon}><FiChevronRight size={16} /></span>
              </div>
              <h4 style={styles.lookbookCardTitle}>{cat.name}</h4>
              <p style={styles.lookbookCardSubtitle}>Explore coordinates</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Viewed Outfits Slider Section */}
      <div style={styles.viewedSection}>
        <div style={styles.viewedHeader}>
          <FiClock size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <h2 style={styles.sectionTitle}>Recently Viewed Outfits</h2>
        </div>

        {recentlyViewed.length > 0 ? (
          <div style={styles.viewedSlider}>
            {recentlyViewed.map((outfit) => (
              <div key={outfit.id} style={styles.viewedCard} className="animate-slide-up">
                <div style={styles.viewedCardHeader}>
                  <h4 style={styles.viewedOutfitName}>{outfit.name}</h4>
                  <span style={styles.viewedOutfitType}>{outfit.type}</span>
                </div>
                <div style={styles.viewedThumbnails}>
                  {Object.keys(outfit.items || {}).map((key) => {
                    const garment = outfit.items[key];
                    if (!garment) return null;
                    return (
                      <img 
                        key={garment.id} 
                        src={garment.imageUrl} 
                        alt={garment.name} 
                        style={styles.viewedThumbImg}
                        title={garment.name}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyViewed}>
            <p>You haven't viewed any curated outfits recently. Your viewed configurations will list here.</p>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && selectedCategory && (
        <div style={styles.modalOverlay} className="animate-fade-in">
          <div style={styles.modalCard} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>{selectedCategory.name} Lookbook</h3>
                <p style={styles.modalSub}>{userGender.toUpperCase()} visual coordinates</p>
              </div>
              <button onClick={() => setShowGalleryModal(false)} style={styles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <div style={styles.galleryGrid}>
              {(inspirationGalleries[userGender]?.[selectedCategory.id] || []).map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setPreviewImage(imgUrl)}
                  style={styles.galleryImgWrapper}
                >
                  <img src={imgUrl} alt="Lookbook" style={styles.galleryImg} />
                  <div style={styles.imageHoverOverlay}>
                    <FiMaximize2 size={20} color="#FFFFFF" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Overlay */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={styles.previewOverlay}
          className="animate-fade-in"
        >
          <img src={previewImage} alt="Fullscreen coordinate" style={styles.previewImg} />
          <button style={styles.closePreviewBtn}>
            <FiX size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '36px',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: '800',
    color: colors.text,
  },
  subtext: {
    fontSize: '14px',
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: '4px',
  },
  assistantsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '48px',
  },
  assistantCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.01)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    height: '220px',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(44, 42, 41, 0.04)',
    }
  },
  iconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  assistantName: {
    fontSize: '15px',
    fontWeight: '800',
    color: colors.text,
    marginBottom: '8px',
  },
  assistantDesc: {
    fontSize: '12px',
    color: colors.textSecondary,
    lineHeight: 1.4,
    marginBottom: 'auto',
    fontWeight: '500',
  },
  assistantLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: colors.primary,
    marginTop: '16px',
  },
  lookbookSection: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
    marginBottom: '20px',
  },
  lookbookGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
  },
  lookbookCard: {
    borderRadius: '20px',
    border: `1.5px solid ${colors.border}`,
    padding: '20px',
    height: '140px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    position: 'relative',
    transition: 'transform 0.2s',
  },
  lookbookCardHeader: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    right: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lookbookIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    color: colors.textSecondary,
  },
  lookbookCardTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: colors.text,
  },
  lookbookCardSubtitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: '2px',
  },
  viewedSection: {
    borderTop: `1.5px solid ${colors.border}`,
    paddingTop: '32px',
    marginBottom: '40px',
  },
  viewedHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  viewedSlider: {
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '16px',
  },
  viewedCard: {
    minWidth: '220px',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '16px',
  },
  viewedCardHeader: {
    marginBottom: '12px',
  },
  viewedOutfitName: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  viewedOutfitType: {
    fontSize: '10px',
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: '2px',
    display: 'block',
  },
  viewedThumbnails: {
    display: 'flex',
    gap: '6px',
  },
  viewedThumbImg: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: `1px solid ${colors.border}`,
  },
  emptyViewed: {
    padding: '24px',
    border: `1.5px dashed ${colors.border}`,
    borderRadius: '16px',
    textAlign: 'center',
    fontSize: '13px',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(44, 42, 41, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalCard: {
    width: '100%',
    maxWidth: '720px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: `1.5px solid ${colors.border}`,
    padding: '32px',
    boxShadow: '0 12px 40px rgba(44, 42, 41, 0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  modalTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.primary,
    marginTop: '2px',
    textTransform: 'uppercase',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.textSecondary,
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  galleryImgWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
    height: '180px',
    cursor: 'pointer',
    position: 'relative',
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageHoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(44, 42, 41, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 1,
    }
  },
  previewOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    cursor: 'pointer',
  },
  previewImg: {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '12px',
    objectFit: 'contain',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};
export default Outfits;
