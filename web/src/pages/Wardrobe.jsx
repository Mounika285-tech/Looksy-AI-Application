import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { 
  FiPlus, 
  FiHeart, 
  FiTrash2, 
  FiX, 
  FiLayers, 
  FiCheck, 
  FiSliders, 
  FiRefreshCw, 
  FiCamera, 
  FiInfo 
} from 'react-icons/fi';
import { uploadToCloudinary } from '../utils/imageHelper';
import { analyzeGarmentImage } from '../utils/geminiService';

export const Wardrobe = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Upload Form State
  const [uploading, setUploading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Top Wear');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const filters = ['All', 'Top Wear', 'Bottom Wear', 'Footwear', 'Accessories'];

  // Sync closet items
  useEffect(() => {
    if (!user) return;

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const unsubscribe = onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(parsed.reverse());
      } else {
        setItems([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Toggle favorite
  const handleToggleFavorite = async (e, item) => {
    e.stopPropagation(); // Prevent opening details modal
    try {
      if (!user) return;
      const itemRef = ref(database, `users/${user.uid}/wardrobe/${item.id}`);
      const nextStatus = !item.isFavorite;
      await update(itemRef, { isFavorite: nextStatus });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    const confirm = window.confirm('Are you sure you want to remove this garment from your closet?');
    if (!confirm) return;

    try {
      if (!user) return;
      const itemRef = ref(database, `users/${user.uid}/wardrobe/${itemId}`);
      await remove(itemRef);
      setShowDetailsModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Upload Actions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select or capture a garment image.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Cloudinary
      const secureUrl = await uploadToCloudinary(imageFile);

      // 2. Classify via Gemini
      let analysis = {
        name: customName || 'Closet Garment',
        category: selectedCategory,
        colorName: 'Neutral',
        colorHex: '#CCCCCC',
        pattern: 'Solid',
        season: 'All-Season',
        occasion: 'Casual'
      };

      try {
        const geminiResult = await analyzeGarmentImage(secureUrl);
        if (geminiResult) {
          analysis = {
            ...geminiResult,
            name: customName || geminiResult.name || 'AI Classified Garment'
          };
        }
      } catch (geminiErr) {
        console.warn('Gemini vision model failed, using default metadata:', geminiErr);
      }

      // 3. Write to Realtime Database
      const closetRef = ref(database, `users/${user.uid}/wardrobe`);
      const newItemRef = push(closetRef);
      await set(newItemRef, {
        ...analysis,
        imageUrl: secureUrl,
        isFavorite: false,
        createdAt: Date.now(),
      });

      // Reset
      setShowUploadModal(false);
      setCustomName('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check your network and try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = activeFilter === 'All'
    ? items
    : items.filter(item => item.category === activeFilter);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Closet Grid</h1>
          <p style={styles.subtext}>Manage, categorize, and liked your garments.</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} style={styles.uploadBtn}>
          <FiPlus size={18} style={{ marginRight: 8 }} />
          <span>Add Garment</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div style={styles.filterBar}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                ...styles.filterTab,
                backgroundColor: isActive ? 'rgba(240, 90, 91, 0.08)' : 'transparent',
                borderColor: isActive ? colors.primary : 'transparent',
                color: isActive ? colors.primary : colors.textSecondary,
                fontWeight: isActive ? '700' : '600',
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Main Grid Content */}
      {isLoading ? (
        <div style={styles.loaderContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: colors.textSecondary }}>Syncing closet archive...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div style={styles.grid}>
          {filteredItems.map((item) => {
            const isLiked = item.isFavorite === true;
            return (
              <div 
                key={item.id} 
                onClick={() => { setSelectedItem(item); setShowDetailsModal(true); }}
                style={styles.itemCard}
                className="animate-slide-up"
              >
                <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
                
                {/* Heart Button Overlay */}
                <button
                  onClick={(e) => handleToggleFavorite(e, item)}
                  style={styles.heartBtn}
                >
                  <FiHeart 
                    size={16} 
                    color={isLiked ? colors.primary : colors.textSecondary}
                    style={{ fill: isLiked ? colors.primary : 'none' }}
                  />
                </button>

                <div style={styles.itemMeta}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={styles.itemName}>{item.name}</p>
                    <span style={{ 
                      ...styles.colorDot, 
                      backgroundColor: item.colorHex || '#CCCCCC' 
                    }} title={item.colorName} />
                  </div>
                  <p style={styles.itemCategory}>{item.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyCloset}>
          <FiLayers size={48} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
          <h3 style={styles.emptyTitle}>Your Wardrobe is Empty</h3>
          <p style={styles.emptyDesc}>Start uploading your tops, bottoms, and accessories to receive smart curation suggestions.</p>
          <button onClick={() => setShowUploadModal(true)} style={styles.uploadBtn}>
            Upload First Item
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay} className="animate-fade-in">
          <div style={styles.modalCard} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Upload New Garment</h3>
              <button onClick={() => { setShowUploadModal(false); setImagePreview(null); }} style={styles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={styles.form}>
              {/* Image Picker */}
              <div 
                onClick={() => fileInputRef.current.click()} 
                style={styles.imagePickerArea}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={styles.pickerImgPreview} />
                ) : (
                  <div style={styles.pickerPlaceholder}>
                    <FiCamera size={32} color={colors.textSecondary} style={{ marginBottom: '12px' }} />
                    <p style={styles.pickerText}>Click to select clothing image</p>
                    <p style={styles.pickerHint}>Supports JPG, PNG</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Form Input fields */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Garment Custom Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Denim Jacket"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={styles.textInput}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="Top Wear">Top Wear</option>
                  <option value="Bottom Wear">Bottom Wear</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  ...styles.submitBtn,
                  opacity: uploading ? 0.75 : 1
                }}
              >
                {uploading ? (
                  <>
                    <FiRefreshCw size={16} className="animate-spin" style={{ marginRight: 8 }} />
                    <span>AI Vision Classifying...</span>
                  </>
                ) : (
                  <span>Upload & Classify</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div style={styles.modalOverlay} className="animate-fade-in">
          <div style={styles.detailsCard} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Garment Properties</h3>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <div style={styles.detailsLayout}>
              <img src={selectedItem.imageUrl} alt={selectedItem.name} style={styles.detailsImg} />
              
              <div style={styles.detailsMeta}>
                <h4 style={styles.detailsName}>{selectedItem.name}</h4>
                <span style={styles.categoryLabel}>{selectedItem.category}</span>
                
                <div style={styles.specsGrid}>
                  <div style={styles.specItem}>
                    <span style={styles.specLabel}>Color shade</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ ...styles.colorSwatch, backgroundColor: selectedItem.colorHex }} />
                      <span style={styles.specValue}>{selectedItem.colorName || 'Neutral'}</span>
                    </div>
                  </div>

                  <div style={styles.specItem}>
                    <span style={styles.specLabel}>Fabric pattern</span>
                    <span style={styles.specValue}>{selectedItem.pattern || 'Solid'}</span>
                  </div>

                  <div style={styles.specItem}>
                    <span style={styles.specLabel}>Seasonal vibe</span>
                    <span style={styles.specValue}>{selectedItem.season || 'All-Season'}</span>
                  </div>

                  <div style={styles.specItem}>
                    <span style={styles.specLabel}>Occasion suitability</span>
                    <span style={styles.specValue}>{selectedItem.occasion || 'Casual'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteItem(selectedItem.id)}
                  style={styles.deleteBtn}
                >
                  <FiTrash2 size={16} style={{ marginRight: 8 }} />
                  <span>Remove Item</span>
                </button>
              </div>
            </div>
          </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  uploadBtn: {
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '24px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  filterTab: {
    border: '1.5px solid transparent',
    borderRadius: '20px',
    padding: '8px 18px',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '24px',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.01)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(44, 42, 41, 0.04)',
    }
  },
  itemImage: {
    width: '100%',
    height: '210px',
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
    fontSize: '14px',
    fontWeight: '700',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '80%',
  },
  colorDot: {
    width: '14px',
    height: '14px',
    borderRadius: '7px',
    border: `1px solid ${colors.border}`,
  },
  itemCategory: {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: '4px',
  },
  emptyCloset: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    maxWidth: '340px',
    lineHeight: 1.5,
    marginBottom: '24px',
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
    maxWidth: '460px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: `1.5px solid ${colors.border}`,
    padding: '32px',
    boxShadow: '0 12px 40px rgba(44, 42, 41, 0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  imagePickerArea: {
    height: '180px',
    backgroundColor: colors.background,
    border: `2px dashed ${colors.border}`,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  pickerImgPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  pickerPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.text,
  },
  pickerHint: {
    fontSize: '11px',
    color: colors.textSecondary,
    marginTop: '4px',
    fontWeight: '500',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  textInput: {
    height: '42px',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
  },
  selectInput: {
    height: '42px',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    height: '46px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '23px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.2)',
  },
  detailsCard: {
    width: '100%',
    maxWidth: '680px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: `1.5px solid ${colors.border}`,
    padding: '32px',
    boxShadow: '0 12px 40px rgba(44, 42, 41, 0.15)',
  },
  detailsLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.8fr',
    gap: '32px',
  },
  detailsImg: {
    width: '100%',
    height: '260px',
    borderRadius: '16px',
    objectFit: 'cover',
    border: `1.5px solid ${colors.border}`,
    backgroundColor: colors.surface,
  },
  detailsMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailsName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: '800',
    color: colors.text,
  },
  categoryLabel: {
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: colors.background,
    color: colors.primary,
    border: `1px solid ${colors.border}`,
    padding: '4px 10px',
    borderRadius: '12px',
    alignSelf: 'flex-start',
    marginTop: '8px',
    textTransform: 'uppercase',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px 24px',
    marginTop: '24px',
    marginBottom: '28px',
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  specLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  specValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.text,
    marginTop: '4px',
  },
  colorSwatch: {
    width: '14px',
    height: '14px',
    borderRadius: '7px',
    border: `1px solid ${colors.border}`,
  },
  deleteBtn: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.error}`,
    color: colors.error,
    borderRadius: '20px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    marginTop: 'auto',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.03)',
    }
  },
};
