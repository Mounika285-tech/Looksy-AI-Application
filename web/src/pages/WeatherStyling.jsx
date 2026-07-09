import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { 
  FiMapPin, 
  FiNavigation, 
  FiEdit2, 
  FiZap, 
  FiHeart, 
  FiRefreshCw, 
  FiX, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { fetchLocationByIP, fetchLocationByCity, fetchWeather } from '../utils/weatherService';
import { curateOutfit } from '../utils/geminiService';

export const WeatherStyling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Climate States
  const [temperature, setTemperature] = useState(18);
  const [condition, setCondition] = useState('Partly Cloudy');
  const [weatherIconName, setWeatherIconName] = useState('cloud');
  const [weatherLocation, setWeatherLocation] = useState('Current Location');
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Curation States
  const [closetItems, setClosetItems] = useState([]);
  const [curatedOutfit, setCuratedOutfit] = useState(null);
  const [curating, setCurating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  // Load weather
  const loadWeather = async (cityName = '') => {
    setIsLoadingWeather(true);
    try {
      let coords;
      let locName = 'Mumbai, India';
      
      if (cityName) {
        coords = await fetchLocationByCity(cityName);
        locName = `${coords.city}, ${coords.country}`;
        setWeatherLocation(locName);
      } else {
        coords = await fetchLocationByIP();
        locName = `${coords.city}, ${coords.country}`;
        setWeatherLocation('Current Location');
      }

      const forecast = await fetchWeather(coords.latitude, coords.longitude);
      setTemperature(forecast.temp);
      setCondition(forecast.condition);
      setWeatherIconName(forecast.icon);
    } catch (error) {
      console.error('Weather styling search error:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  // Curate Outfit
  const handleCurate = async () => {
    if (closetItems.length === 0) {
      alert('Your wardrobe is empty! Upload garments to curate outfits.');
      return;
    }

    setCurating(true);
    setSaved(false);
    try {
      // Find a random base item
      const baseItem = closetItems[Math.floor(Math.random() * closetItems.length)];
      
      const parameter = `Weather Temperature: ${temperature}°C, Condition: ${condition}, Location: ${weatherLocation}`;
      const result = await curateOutfit(closetItems, baseItem, parameter, 'Climate Curation');
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
        name: curatedOutfit.name || 'Climate Outfit',
        type: 'Climate Curation',
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
            <div style={styles.locationHeader}>
              <div>
                <span style={styles.badge}>Live Assistant</span>
                <h2 style={styles.cardTitle}>{weatherLocation}</h2>
              </div>
              <button 
                onClick={() => setShowLocationInput(!showLocationInput)}
                style={styles.editBtn}
              >
                <FiEdit2 size={14} style={{ marginRight: 6 }} />
                <span>Search City</span>
              </button>
            </div>

            {showLocationInput && (
              <div style={styles.searchForm} className="animate-fade-in">
                <input
                  type="text"
                  placeholder="Enter city (e.g. Paris)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  style={styles.searchInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchCity.trim()) {
                      loadWeather(searchCity.trim());
                      setShowLocationInput(false);
                      setSearchCity('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (searchCity.trim()) {
                      loadWeather(searchCity.trim());
                      setShowLocationInput(false);
                      setSearchCity('');
                    }
                  }}
                  style={styles.searchSubmit}
                >
                  Search
                </button>
                <button 
                  onClick={() => {
                    loadWeather();
                    setShowLocationInput(false);
                  }}
                  style={styles.gpsBtn}
                >
                  <FiNavigation size={14} />
                </button>
              </div>
            )}

            {isLoadingWeather ? (
              <div style={styles.weatherLoading}>
                <div className="animate-spin" style={styles.spinner}></div>
                <p>Syncing micro-climate variables...</p>
              </div>
            ) : (
              <div style={styles.weatherRow}>
                <div style={styles.weatherMain}>
                  <h1 style={styles.tempText}>{temperature}°C</h1>
                  <p style={styles.conditionText}>{condition}</p>
                </div>
                <div style={styles.iconCircle}>
                  <FiMapPin size={24} color={colors.primary} />
                </div>
              </div>
            )}

            <button 
              onClick={handleCurate}
              disabled={isLoadingWeather || curating}
              style={{
                ...styles.curateBtn,
                opacity: (isLoadingWeather || curating) ? 0.7 : 1
              }}
            >
              {curating ? (
                <>
                  <FiRefreshCw size={16} className="animate-spin" style={{ marginRight: 8 }} />
                  <span>Curating Layered Coordinate...</span>
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
              <p style={styles.loaderDesc}>Analyzing your digital closet fabric weights and temperature metrics...</p>
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
              <FiSparkles size={36} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>Curate Climate Outfits</h3>
              <p style={styles.emptyDesc}>Choose a city or use your location above, then click Curate to fetch matching closet matches instantly.</p>
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
  locationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
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
  editBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.primary,
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
  },
  searchForm: {
    display: 'flex',
    gap: '6px',
    borderTop: `1px solid ${colors.border}`,
    paddingTop: '16px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    height: '38px',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
  },
  searchSubmit: {
    height: '38px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    paddingLeft: '14px',
    paddingRight: '14px',
    fontSize: '12px',
    fontWeight: '700',
  },
  gpsBtn: {
    width: '38px',
    height: '38px',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary,
  },
  weatherLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px',
    paddingBottom: '20px',
    gap: '12px',
    fontSize: '13px',
    color: colors.textSecondary,
  },
  spinner: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2.5px solid #E8E2DC',
    borderTopColor: colors.primary,
  },
  weatherRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  weatherMain: {
    display: 'flex',
    flexDirection: 'column',
  },
  tempText: {
    fontSize: '40px',
    fontWeight: '800',
    color: colors.text,
  },
  conditionText: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: '4px',
  },
  iconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '26px',
    backgroundColor: colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
