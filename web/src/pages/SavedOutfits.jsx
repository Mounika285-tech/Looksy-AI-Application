import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { 
  FiHeart, 
  FiTrash2, 
  FiGrid, 
  FiLayers, 
  FiSmile 
} from 'react-icons/fi';

export const SavedOutfits = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tabs: 'outfits' or 'items'
  const [activeTab, setActiveTab] = useState('outfits');
  
  // Data States
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Data
  useEffect(() => {
    if (!user) return;

    const outfitsRef = ref(database, `users/${user.uid}/favorite_outfits`);
    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);

    const unsubOutfits = onValue(outfitsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSavedOutfits(Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse());
      } else {
        setSavedOutfits([]);
      }
    });

    const unsubWardrobe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        const filtered = parsed.filter(i => i.isFavorite === true);
        setFavoriteItems(filtered.reverse());
      } else {
        setFavoriteItems([]);
      }
      setIsLoading(false);
    });

    return () => {
      unsubOutfits();
      unsubWardrobe();
    };
  }, [user]);

  // Remove Favorite Outfit
  const handleDeleteOutfit = async (outfitId) => {
    const confirm = window.confirm('Are you sure you want to delete this saved outfit combination?');
    if (!confirm) return;

    try {
      const outfitRef = ref(database, `users/${user.uid}/favorite_outfits/${outfitId}`);
      await remove(outfitRef);
    } catch (e) {
      console.error(e);
    }
  };

  // Unlike Garment Item
  const handleUnlikeGarment = async (itemId) => {
    try {
      const itemRef = ref(database, `users/${user.uid}/wardrobe/${itemId}`);
      await update(itemRef, { isFavorite: false });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Saved Favorites</h1>
        <p style={styles.subtext}>Your personalized collection of curated coordinates and liked garments.</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('outfits')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'outfits' ? 'rgba(240, 90, 91, 0.08)' : 'transparent',
            borderColor: activeTab === 'outfits' ? colors.primary : 'transparent',
            color: activeTab === 'outfits' ? colors.primary : colors.textSecondary,
            fontWeight: activeTab === 'outfits' ? '700' : '600',
          }}
        >
          <FiGrid size={14} style={{ marginRight: 8 }} />
          <span>Curated Outfits ({savedOutfits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'items' ? 'rgba(240, 90, 91, 0.08)' : 'transparent',
            borderColor: activeTab === 'items' ? colors.primary : 'transparent',
            color: activeTab === 'items' ? colors.primary : colors.textSecondary,
            fontWeight: activeTab === 'items' ? '700' : '600',
          }}
        >
          <FiLayers size={14} style={{ marginRight: 8 }} />
          <span>Liked Garments ({favoriteItems.length})</span>
        </button>
      </div>

      {/* Content grid */}
      {isLoading ? (
        <div style={styles.loaderContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: colors.textSecondary }}>Syncing favorites locker...</p>
        </div>
      ) : activeTab === 'outfits' ? (
        savedOutfits.length > 0 ? (
          <div style={styles.outfitsGrid}>
            {savedOutfits.map((outfit) => (
              <div key={outfit.id} style={styles.outfitCard} className="animate-slide-up">
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.outfitName}>{outfit.name}</h3>
                    <span style={styles.outfitType}>{outfit.type}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteOutfit(outfit.id)}
                    style={styles.deleteBtn}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                {/* Grid layout for thumbnails */}
                <div style={styles.thumbGrid}>
                  {Object.keys(outfit.items || {}).map((key) => {
                    const item = outfit.items[key];
                    if (!item) return null;
                    return (
                      <div key={item.id} style={styles.thumbWrapper}>
                        <img src={item.imageUrl} alt={item.name} style={styles.thumbImg} />
                        <span style={styles.thumbLabel}>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyContainer}>
            <FiGrid size={48} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
            <h3 style={styles.emptyTitle}>No Saved Outfits</h3>
            <p style={styles.emptyDesc}>Curate outfits in the styling assistants and click the Heart icon to store them here.</p>
            <button onClick={() => navigate('/outfits')} style={styles.actionBtn}>
              Styling Center
            </button>
          </div>
        )
      ) : (
        favoriteItems.length > 0 ? (
          <div style={styles.itemsGrid}>
            {favoriteItems.map((item) => (
              <div key={item.id} style={styles.itemCard} className="animate-slide-up">
                <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
                <button
                  onClick={() => handleUnlikeGarment(item.id)}
                  style={styles.heartBtn}
                >
                  <FiHeart size={16} color={colors.primary} style={{ fill: colors.primary }} />
                </button>
                <div style={styles.itemMeta}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={styles.itemName}>{item.name}</p>
                    <span style={{ ...styles.colorDot, backgroundColor: item.colorHex || '#CCCCCC' }} />
                  </div>
                  <p style={styles.itemCategory}>{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyContainer}>
            <FiLayers size={48} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
            <h3 style={styles.emptyTitle}>No Liked Garments</h3>
            <p style={styles.emptyDesc}>Heart individual clothing items in your wardrobe grid to see them listed here instantly.</p>
            <button onClick={() => navigate('/wardrobe')} style={styles.actionBtn}>
              Browse Closet
            </button>
          </div>
        )
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
    marginBottom: '32px',
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
  tabsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '8px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid transparent',
    borderRadius: '20px',
    padding: '8px 18px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '100px',
    paddingBottom: '100px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '4px solid #E8E2DC',
    borderTopColor: colors.primary,
  },
  outfitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '16px',
    marginBottom: '16px',
  },
  outfitName: {
    fontSize: '15px',
    fontWeight: '800',
    color: colors.text,
  },
  outfitType: {
    fontSize: '10px',
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: '2px',
    display: 'block',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '4px',
  },
  thumbGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  thumbWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '8px',
  },
  thumbImg: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    objectFit: 'cover',
    marginRight: '8px',
    border: `1px solid ${colors.border}`,
  },
  thumbLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '90px',
  },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '24px',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.01)',
  },
  itemImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: colors.surface,
  },
  heartBtn: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(44, 42, 41, 0.08)',
    zIndex: 10,
  },
  itemMeta: {
    padding: '16px',
  },
  itemName: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '80%',
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
  },
  itemCategory: {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: '4px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '80px',
    paddingBottom: '80px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: colors.textSecondary,
    lineHeight: 1.5,
    maxWidth: '320px',
    marginBottom: '24px',
    fontWeight: '500',
  },
  actionBtn: {
    height: '42px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '21px',
    paddingLeft: '24px',
    paddingRight: '24px',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
  },
};
export default SavedOutfits;
