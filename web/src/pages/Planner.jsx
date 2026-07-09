import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { database } from '../config/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { 
  FiCalendar, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiX, 
  FiZap, 
  FiRefreshCw, 
  FiLayers, 
  FiCheckCircle 
} from 'react-icons/fi';
import { generateWeeklyPlanner } from '../utils/geminiService';

export const Planner = () => {
  const { user } = useAuth();

  // States
  const [closetItems, setClosetItems] = useState([]);
  const [plannedOutfits, setPlannedOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Setup Form Modal
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);

  // Form Fields
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [planName, setPlanName] = useState('');
  const [selectedTop, setSelectedTop] = useState('');
  const [selectedBottom, setSelectedBottom] = useState('');
  const [selectedFootwear, setSelectedFootwear] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState('');

  // AI Planner States
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiVibe, setAiVibe] = useState('Casual');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Sync Data
  useEffect(() => {
    if (!user) return;

    const wardrobeRef = ref(database, `users/${user.uid}/wardrobe`);
    const plannerRef = ref(database, `users/${user.uid}/planner`);

    onValue(wardrobeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClosetItems(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setClosetItems([]);
      }
    });

    const unsubPlanner = onValue(plannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlannedOutfits(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setPlannedOutfits([]);
      }
      setIsLoading(false);
    });

    return () => unsubPlanner();
  }, [user]);

  // Open Add/Edit Modal
  const openAddModal = (day) => {
    setSelectedDay(day);
    setPlanName('');
    setSelectedTop('');
    setSelectedBottom('');
    setSelectedFootwear('');
    setSelectedAccessory('');
    setIsEditing(false);
    setShowSetupModal(true);
  };

  const openEditModal = (plan) => {
    setSelectedDay(plan.plannedDate);
    setPlanName(plan.name || '');
    setSelectedTop(plan.items?.top?.id || '');
    setSelectedBottom(plan.items?.bottom?.id || '');
    setSelectedFootwear(plan.items?.footwear?.id || '');
    setSelectedAccessory(plan.items?.accessory?.id || '');
    setIsEditing(true);
    setEditPlanId(plan.id);
    setShowSetupModal(true);
  };

  // Delete planned look
  const handleDeletePlan = async (planId) => {
    const confirm = window.confirm('Are you sure you want to remove this look from your weekly plan?');
    if (!confirm) return;

    try {
      const planRef = ref(database, `users/${user.uid}/planner/${planId}`);
      await remove(planRef);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit planner setup
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    if (!planName) {
      alert('Please enter a schedule look name.');
      return;
    }

    try {
      const topObj = closetItems.find(i => i.id === selectedTop) || null;
      const bottomObj = closetItems.find(i => i.id === selectedBottom) || null;
      const footwearObj = closetItems.find(i => i.id === selectedFootwear) || null;
      const accessoryObj = closetItems.find(i => i.id === selectedAccessory) || null;

      const itemsPayload = {
        top: topObj ? { id: topObj.id, name: topObj.name, imageUrl: topObj.imageUrl, category: topObj.category } : null,
        bottom: bottomObj ? { id: bottomObj.id, name: bottomObj.name, imageUrl: bottomObj.imageUrl, category: bottomObj.category } : null,
        footwear: footwearObj ? { id: footwearObj.id, name: footwearObj.name, imageUrl: footwearObj.imageUrl, category: footwearObj.category } : null,
        accessory: accessoryObj ? { id: accessoryObj.id, name: accessoryObj.name, imageUrl: accessoryObj.imageUrl, category: accessoryObj.category } : null
      };

      const plannedObj = {
        name: planName,
        plannedDate: selectedDay,
        createdAt: Date.now(),
        items: itemsPayload,
      };

      if (isEditing && editPlanId) {
        const planRef = ref(database, `users/${user.uid}/planner/${editPlanId}`);
        await update(planRef, plannedObj);
      } else {
        const plannerRef = ref(database, `users/${user.uid}/planner`);
        const newPlanRef = push(plannerRef);
        await set(newPlanRef, plannedObj);
      }

      setShowSetupModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // AI Weekly Planner Curation
  const handleAIWeeklyCuration = async () => {
    if (closetItems.length === 0) {
      alert('Your closet is empty. Please upload items to schedule looks.');
      return;
    }

    const confirm = window.confirm('This will curate and replace all 7 days with AI configurations. Proceed?');
    if (!confirm) return;

    setGeneratingAI(true);
    try {
      const plans = await generateWeeklyPlanner(closetItems, aiVibe, 'Mild Climate');
      if (plans && plans.length > 0) {
        // Clear previous planned outfits first
        const plannerRef = ref(database, `users/${user.uid}/planner`);
        await set(plannerRef, null);

        // Bulk insert
        for (const plan of plans) {
          const newPlanRef = push(plannerRef);
          await set(newPlanRef, {
            name: plan.name,
            plannedDate: plan.plannedDate,
            createdAt: Date.now(),
            items: plan.items || {},
            suggestedAdditions: plan.suggestedAdditions || {},
          });
        }
        alert('Completed!', 'LookSy AI generated coordinates successfully scheduled!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Categorize closet items
  const tops = closetItems.filter(i => i.category === 'Top Wear');
  const bottoms = closetItems.filter(i => i.category === 'Bottom Wear');
  const footwear = closetItems.filter(i => i.category === 'Footwear');
  const accessories = closetItems.filter(i => i.category === 'Accessories');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Weekly Planner</h1>
          <p style={styles.subtext}>Schedule clothing coordinates for every day of the week.</p>
        </div>
        
        {/* Quick Vibe Auto Generator */}
        <div style={styles.aiSetupBox}>
          <select 
            value={aiVibe}
            onChange={(e) => setAiVibe(e.target.value)}
            style={styles.vibeSelect}
          >
            <option value="Casual">Casual</option>
            <option value="Minimalist">Minimalist</option>
            <option value="Streetwear">Streetwear</option>
            <option value="Formal">Formal</option>
            <option value="Sporty">Sporty</option>
          </select>
          <button 
            onClick={handleAIWeeklyCuration}
            disabled={generatingAI}
            style={{
              ...styles.aiGenBtn,
              opacity: generatingAI ? 0.7 : 1
            }}
          >
            {generatingAI ? (
              <>
                <FiRefreshCw size={14} className="animate-spin" style={{ marginRight: 6 }} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FiZap size={14} style={{ marginRight: 6 }} />
                <span>AI Autofill Week</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Weekdays Row Grid */}
      {isLoading ? (
        <div style={styles.loaderContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: colors.textSecondary }}>Syncing calendar planner...</p>
        </div>
      ) : (
        <div style={styles.plannerGrid}>
          {daysOfWeek.map((day) => {
            const plan = plannedOutfits.find(o => o.plannedDate === day);
            return (
              <div key={day} style={styles.dayCard}>
                <div style={styles.dayHeader}>
                  <h3 style={styles.dayName}>{day}</h3>
                  {plan ? (
                    <div style={styles.actionIcons}>
                      <button onClick={() => openEditModal(plan)} style={styles.iconBtn} title="Edit Plan">
                        <FiEdit size={14} />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} style={{ ...styles.iconBtn, color: colors.error }} title="Delete Plan">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => openAddModal(day)} style={styles.addBtn}>
                      <FiPlus size={14} />
                    </button>
                  )}
                </div>

                {plan ? (
                  <div style={styles.planBody} className="animate-fade-in">
                    <p style={styles.planTitle}>{plan.name}</p>
                    
                    {/* Items stack */}
                    <div style={styles.itemsStack}>
                      {Object.keys(plan.items || {}).map((key) => {
                        const garment = plan.items[key];
                        if (!garment) return null;
                        return (
                          <div key={garment.id} style={styles.stackItem}>
                            <img src={garment.imageUrl} alt={garment.name} style={styles.stackThumb} />
                            <span style={styles.stackLabel}>{garment.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyDayBox}>
                    <p>No look scheduled</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Setup Form Modal */}
      {showSetupModal && (
        <div style={styles.modalOverlay} className="animate-fade-in">
          <div style={styles.modalCard} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{isEditing ? 'Edit Planned Look' : 'Schedule Day Outfit'}</h3>
              <button onClick={() => setShowSetupModal(false)} style={styles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Schedule Day</label>
                <select 
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  style={styles.selectInput}
                  disabled={isEditing}
                >
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Outfit Vibe / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sharp Business Friday"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  style={styles.textInput}
                  required
                />
              </div>

              {/* Garment drop dropdown lists */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Tops</label>
                <select value={selectedTop} onChange={(e) => setSelectedTop(e.target.value)} style={styles.selectInput}>
                  <option value="">-- Choose Top --</option>
                  {tops.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Bottoms</label>
                <select value={selectedBottom} onChange={(e) => setSelectedBottom(e.target.value)} style={styles.selectInput}>
                  <option value="">-- Choose Bottom --</option>
                  {bottoms.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Footwear</label>
                <select value={selectedFootwear} onChange={(e) => setSelectedFootwear(e.target.value)} style={styles.selectInput}>
                  <option value="">-- Choose Shoes --</option>
                  {footwear.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Accessories</label>
                <select value={selectedAccessory} onChange={(e) => setSelectedAccessory(e.target.value)} style={styles.selectInput}>
                  <option value="">-- Choose Accessories --</option>
                  {accessories.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <button type="submit" style={styles.submitBtn}>
                <span>Save Schedule</span>
              </button>
            </form>
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
    marginBottom: '36px',
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
  aiSetupBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  vibeSelect: {
    height: '38px',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
  },
  aiGenBtn: {
    height: '38px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '19px',
    paddingLeft: '16px',
    paddingRight: '16px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
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
  plannerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '20px',
    minHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  dayName: {
    fontSize: '16px',
    fontWeight: '800',
    color: colors.text,
  },
  actionIcons: {
    display: 'flex',
    gap: '8px',
  },
  iconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '4px',
  },
  addBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary,
    cursor: 'pointer',
  },
  planBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  planTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.primary,
    marginBottom: '16px',
  },
  itemsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto',
  },
  stackItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '6px 10px',
  },
  stackThumb: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    objectFit: 'cover',
    marginRight: '10px',
    border: `1px solid ${colors.border}`,
  },
  stackLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  emptyDayBox: {
    flex: 1,
    border: `2px dashed ${colors.border}`,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: colors.textSecondary,
    fontWeight: '600',
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
    maxWidth: '440px',
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
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selectInput: {
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
  textInput: {
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
  submitBtn: {
    width: '100%',
    height: '44px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '22px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.2)',
  },
};
export default Planner;
