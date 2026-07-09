import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { 
  FiMapPin, 
  FiNavigation, 
  FiEdit3, 
  FiCalendar, 
  FiLayers, 
  FiStar, 
  FiSun, 
  FiCloud, 
  FiWind, 
  FiDroplet, 
  FiEye, 
  FiCheckCircle,
  FiTrendingUp,
  FiZap
} from 'react-icons/fi';
import { fetchLocationByIP, fetchLocationByCity, fetchWeather } from '../utils/weatherService';
import { generateSuggestions } from '../utils/geminiService';

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const userName = profile?.name || 'Stylist';
  const prefStyle = profile?.stylePreferences?.[0] || 'Casual';

  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [plannedOutfits, setPlannedOutfits] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  // Weather States
  const [weather, setWeather] = useState({ 
    temp: 28, 
    condition: 'Partly Cloudy', 
    icon: 'cloud', 
    location: 'Mumbai, India', 
    humidity: '72%', 
    wind: '12 km/h', 
    visibility: '8 km', 
    feelsLike: '31°C' 
  });
  const [weatherLocation, setWeatherLocation] = useState('Current Location');
  const [searchCity, setSearchCity] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Sync Database
  useEffect(() => {
    if (!user) return;

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const plannerRef = ref(database, `users/${user.uid}/planner`);

    const unsubWardrobe = onValue(wardrobeRef, (snap) => {
      const val = snap.val();
      if (val) {
        setWardrobeItems(Object.keys(val).map(key => ({ id: key, ...val[key] })));
      } else {
        setWardrobeItems([]);
      }
      setIsLoadingData(false);
    });

    const unsubPlanner = onValue(plannerRef, (snap) => {
      const val = snap.val();
      if (val) {
        setPlannedOutfits(Object.keys(val).map(key => ({ id: key, ...val[key] })));
      } else {
        setPlannedOutfits([]);
      }
    });

    return () => {
      unsubWardrobe();
      unsubPlanner();
    };
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
      const newWeather = { ...forecast, location: locName };
      setWeather(newWeather);
      
      if (wardrobeItems.length > 0) {
        triggerSuggestions(newWeather);
      }
    } catch (e) {
      console.error('Weather load error:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Suggestions
  const triggerSuggestions = async (activeWeather) => {
    setIsLoadingAI(true);
    try {
      const stylePrefs = profile?.stylePreferences || [prefStyle];
      const results = await generateSuggestions(wardrobeItems, stylePrefs, profile?.gender, activeWeather);
      if (results && results.length > 0) {
        setAiSuggestions(results.slice(0, 4));
      }
    } catch (err) {
      console.error('Gemini suggestions error:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWeather();
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingData && wardrobeItems.length > 0) {
      triggerSuggestions(weather);
    }
  }, [isLoadingData, wardrobeItems.length]);

  // Date planning helpers
  const getPlanStatus = (plan) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const createdDate = new Date(plan.createdAt);
    createdDate.setHours(0, 0, 0, 0);

    const diffTime = today - createdDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dateStr = plan.plannedDate?.toUpperCase();

    if (dateStr === 'TODAY') return 'today';
    if (dateStr === 'TOMORROW') return diffDays <= 1 ? 'future' : 'expired';
    
    if (dateStr === 'THIS WEEKEND') {
      const todayDay = today.getDay();
      const isTodayWeekend = todayDay === 0 || todayDay === 6;
      return isTodayWeekend ? 'today' : (diffDays <= 0 ? 'future' : 'expired');
    }

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    if (weekDays.includes(dateStr)) {
      const planDayIndex = weekDays.indexOf(dateStr);
      const todayDayIndex = today.getDay();
      if (planDayIndex === todayDayIndex) return 'today';
      if (planDayIndex > todayDayIndex) return 'future';
    }
    return 'expired';
  };

  const getActivePlan = () => {
    const todayPlan = plannedOutfits.find(o => getPlanStatus(o) === 'today');
    if (todayPlan) return { plan: todayPlan, isToday: true };
    const upcomingPlan = plannedOutfits.find(o => getPlanStatus(o) === 'future');
    if (upcomingPlan) return { plan: upcomingPlan, isToday: false };
    return null;
  };

  const activePlanInfo = getActivePlan();

  return (
    <div style={styles.container}>
      {/* Top Welcome Title */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.title}>{getGreeting()}, {userName} ✨</h1>
          <p style={styles.subtext}>Here is your personalized styling schedule for today.</p>
        </div>
        
        {/* Quick Stats Pills */}
        <div style={styles.statsPills}>
          <div style={styles.pill}>
            <FiLayers size={14} color={colors.primary} />
            <span>{wardrobeItems.length} Garments</span>
          </div>
          <div style={styles.pill}>
            <FiCalendar size={14} color={colors.primary} />
            <span>{plannedOutfits.length} Scheduled</span>
          </div>
          <div style={styles.pill}>
            <FiStar size={14} color={colors.primary} />
            <span>{prefStyle} Mode</span>
          </div>
        </div>
      </div>

      {/* Split Column Layout */}
      <div style={styles.grid}>
        
        {/* Left Main Stream */}
        <div style={styles.leftColumn}>
          
          {/* Live Geocoded Weather Card */}
          <div style={styles.weatherCard}>
            <div style={styles.cardHeader}>
              <div style={styles.locationGroup}>
                <FiMapPin size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <span style={styles.locationText}>{weather.location}</span>
              </div>
              <button 
                onClick={() => setShowLocationInput(!showLocationInput)}
                style={styles.changeCityBtn}
              >
                Change City
              </button>
            </div>

            {showLocationInput && (
              <div style={styles.locationForm} className="animate-fade-in">
                <input
                  type="text"
                  placeholder="Enter city name (e.g. London)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  style={styles.cityInput}
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
                  style={styles.searchBtn}
                >
                  Search
                </button>
                <button 
                  onClick={() => {
                    loadWeather();
                    setShowLocationInput(false);
                  }}
                  style={styles.gpsBtn}
                  title="Current Location"
                >
                  <FiNavigation size={14} />
                </button>
              </div>
            )}

            {isLoadingWeather ? (
              <div style={styles.weatherLoading}>
                <div className="animate-spin" style={styles.weatherSpinner}></div>
                <p>Syncing micro-climate details...</p>
              </div>
            ) : (
              <div style={styles.weatherBody}>
                <div style={styles.weatherMain}>
                  <h2 style={styles.temp}>{weather.temp}°C</h2>
                  <p style={styles.condition}>{weather.condition}</p>
                </div>
                
                {/* Weather Metrics Grid */}
                <div style={styles.weatherMetrics}>
                  <div style={styles.metricItem}>
                    <FiWind size={14} />
                    <span>Wind: {weather.wind}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <FiDroplet size={14} />
                    <span>Humidity: {weather.humidity}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <FiEye size={14} />
                    <span>Visibility: {weather.visibility}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.divider} />
            <p style={styles.weatherTip}>
              💡 Perfect day for a <span style={{ fontWeight: '700', color: colors.primary }}>{prefStyle}</span> look! Comfort meets style.
            </p>
          </div>

          {/* AI Suggestions Row */}
          <div style={styles.suggestionsContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.sectionHeading}>LookSy AI Curations</h3>
              <span style={styles.modelBadge}><FiZap size={12} style={{ marginRight: 4 }} /> Gemini Active</span>
            </div>

            {isLoadingAI ? (
              <div style={styles.loaderContainer}>
                <div className="animate-spin" style={styles.aiSpinner}></div>
                <p style={{ marginTop: '12px', fontSize: '13px', color: colors.textSecondary }}>LookSy is curating outfit coordinates...</p>
              </div>
            ) : aiSuggestions.length > 0 ? (
              <div style={styles.suggestionsGrid}>
                {aiSuggestions.map((item, idx) => (
                  <div key={item.id || idx} style={styles.suggestionCard} className="animate-slide-up">
                    <div style={{ ...styles.cardColorBand, backgroundColor: item.color || colors.accent }} />
                    <div style={styles.cardContent}>
                      <span style={styles.categoryBadge}>{item.category}</span>
                      <h4 style={styles.cardTitle}>{item.name}</h4>
                      <p style={styles.cardDesc}>{item.desc}</p>
                      
                      {/* Items Row */}
                      <div style={styles.coordThumbnails}>
                        {Object.keys(item.items || {}).map((key) => {
                          const garment = item.items[key];
                          if (!garment) return null;
                          return (
                            <img 
                              key={garment.id} 
                              src={garment.imageUrl} 
                              alt={garment.name} 
                              style={styles.coordImg} 
                              title={garment.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptySuggestions}>
                <p>Upload clothing to your Wardrobe to unlock live AI suggestions!</p>
                <button onClick={() => navigate('/wardrobe')} style={styles.emptyActionBtn}>
                  Go to Wardrobe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Planner Column */}
        <div style={styles.rightColumn}>
          
          <div style={styles.scheduleCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.sectionHeading}>
                {activePlanInfo ? (activePlanInfo.isToday ? "Today's Schedule" : "Upcoming Look") : "Scheduled Look"}
              </h3>
              <button onClick={() => navigate('/planner')} style={styles.plannerLinkBtn}>
                {activePlanInfo ? 'View Planner' : 'Schedule Look'}
              </button>
            </div>

            {activePlanInfo ? (
              <div style={styles.plannedOutfit}>
                <div style={styles.outfitTitleHeader}>
                  <h4 style={styles.outfitName}>{activePlanInfo.plan.name}</h4>
                  <span style={styles.dateLabel}>{activePlanInfo.plan.plannedDate}</span>
                </div>

                <div style={styles.outfitGrid}>
                  {Object.keys(activePlanInfo.plan.items || {}).map((key) => {
                    const garment = activePlanInfo.plan.items[key];
                    if (!garment) return null;
                    return (
                      <div key={garment.id} style={styles.garmentBox}>
                        <img src={garment.imageUrl} alt={garment.name} style={styles.garmentImg} />
                        <div style={styles.garmentMeta}>
                          <span style={styles.garmentType}>{garment.category || key}</span>
                          <p style={styles.garmentName}>{garment.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={styles.emptyPlannerCard}>
                <FiCalendar size={36} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
                <h4 style={styles.emptyPlannerTitle}>No Outfit Scheduled</h4>
                <p style={styles.emptyPlannerDesc}>You have no looks scheduled for today. Add a plan in the Daily Planner to coordinate your week.</p>
                <button onClick={() => navigate('/planner')} style={styles.planNowBtn}>
                  Plan Outfit Now
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px',
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
  statsPills: {
    display: 'flex',
    gap: '12px',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '700',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(44,42,41,0.02)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1.2fr',
    gap: '32px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: `1.5px solid ${colors.border}`,
    padding: '24px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  locationGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  locationText: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  changeCityBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.primary,
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
  },
  locationForm: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderTop: `1px solid ${colors.border}`,
    paddingTop: '16px',
  },
  cityInput: {
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
  searchBtn: {
    height: '38px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    paddingLeft: '16px',
    paddingRight: '16px',
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
    justifyContent: 'center',
    paddingTop: '20px',
    paddingBottom: '20px',
    gap: '12px',
    color: colors.textSecondary,
    fontSize: '13px',
  },
  weatherSpinner: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2.5px solid #E8E2DC',
    borderTopColor: colors.primary,
  },
  weatherBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  weatherMain: {
    display: 'flex',
    flexDirection: 'column',
  },
  temp: {
    fontSize: '44px',
    fontWeight: '800',
    lineHeight: 1,
    color: colors.text,
  },
  condition: {
    fontSize: '15px',
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: '6px',
  },
  weatherMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  divider: {
    height: '1px',
    backgroundColor: colors.border,
    marginTop: '20px',
    marginBottom: '16px',
  },
  weatherTip: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  sectionHeading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '800',
    color: colors.text,
  },
  modelBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(240, 90, 91, 0.08)',
    color: colors.primary,
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '60px',
    paddingBottom: '60px',
  },
  aiSpinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #E8E2DC',
    borderTopColor: colors.primary,
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  suggestionCard: {
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardColorBand: {
    height: '6px',
    width: '100%',
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: colors.text,
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '12px',
    color: colors.textSecondary,
    lineHeight: 1.4,
    marginBottom: '16px',
    fontWeight: '500',
  },
  coordThumbnails: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  coordImg: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: `1px solid ${colors.border}`,
  },
  emptySuggestions: {
    textAlign: 'center',
    paddingTop: '40px',
    paddingBottom: '40px',
    fontSize: '14px',
    color: colors.textSecondary,
    fontWeight: '500',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  emptyActionBtn: {
    height: '38px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '19px',
    paddingLeft: '20px',
    paddingRight: '20px',
    fontSize: '13px',
    fontWeight: '700',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: `1.5px solid ${colors.border}`,
    padding: '28px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  plannerLinkBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.primary,
    fontWeight: '700',
    fontSize: '12px',
  },
  plannedOutfit: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  outfitTitleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '12px',
  },
  outfitName: {
    fontSize: '16px',
    fontWeight: '800',
    color: colors.text,
  },
  dateLabel: {
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  outfitGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  garmentBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '10px',
  },
  garmentImg: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    marginRight: '12px',
    border: `1px solid ${colors.border}`,
  },
  garmentMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  garmentType: {
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
  emptyPlannerCard: {
    textAlign: 'center',
    paddingTop: '40px',
    paddingBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyPlannerTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: colors.text,
    marginBottom: '8px',
  },
  emptyPlannerDesc: {
    fontSize: '13px',
    color: colors.textSecondary,
    lineHeight: 1.5,
    marginBottom: '24px',
    maxWidth: '280px',
    fontWeight: '500',
  },
  planNowBtn: {
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
