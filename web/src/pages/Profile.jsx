import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiCamera, 
  FiEdit, 
  FiCheck, 
  FiX, 
  FiLock 
} from 'react-icons/fi';
import { uploadToCloudinary } from '../utils/imageHelper';

export const Profile = () => {
  const { user, profile, updateProfile } = useAuth();

  // Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age || '');
  const [gender, setGender] = useState(profile?.gender || 'Female');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');

  // Loading states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const secureUrl = await uploadToCloudinary(file);
      setAvatarUrl(secureUrl);
      if (!isEditing) {
        // Automatically save avatar in database if not editing details
        await updateProfile({ avatarUrl: secureUrl });
      }
    } catch (err) {
      console.error(err);
      alert('Avatar upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return;

    setSavingProfile(true);
    try {
      const payload = {
        name,
        age: age || '',
        gender,
        avatarUrl,
        setupCompleted: true,
      };
      await updateProfile(payload);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Profile</h1>
        <p style={styles.subtext}>Manage your LookSy AI style persona details.</p>
      </div>

      <div style={styles.card} className="animate-slide-up">
        {/* Profile picture & avatar picker */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarWrapper}>
            {uploadingImage ? (
              <div style={styles.avatarLoading}>
                <FiRefreshCw size={24} className="animate-spin" color={colors.primary} />
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={name} style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <span style={styles.avatarText}>
                  {name ? name[0].toUpperCase() : 'S'}
                </span>
              </div>
            )}
            
            {/* Camera Upload Icon */}
            <button 
              onClick={() => fileInputRef.current.click()} 
              style={styles.cameraIconBtn}
              title="Change Profile Photo"
            >
              <FiCamera size={12} color="#FFFFFF" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <h2 style={styles.displayName}>{profile?.name || 'Stylist Persona'}</h2>
          <p style={styles.displayRole}>Account Active</p>
        </div>

        {/* Form Body */}
        {isEditing ? (
          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <FiUser style={styles.inputIcon} size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address (Read-only)</label>
              <div style={styles.inputWrapper}>
                <FiLock style={{ ...styles.inputIcon, color: colors.textSecondary }} size={16} />
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  style={{ ...styles.input, backgroundColor: colors.surface, cursor: 'not-allowed' }}
                  disabled
                />
              </div>
            </div>

            <div style={styles.doubleRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Age</label>
                <div style={styles.inputWrapper}>
                  <FiCalendar style={styles.inputIcon} size={16} />
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. 24"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={styles.select}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div style={styles.actionRow}>
              <button 
                type="button" 
                onClick={() => {
                  setName(profile?.name || '');
                  setAge(profile?.age || '');
                  setGender(profile?.gender || 'Female');
                  setIsEditing(false);
                }} 
                style={styles.cancelBtn}
              >
                <FiX size={14} style={{ marginRight: 6 }} />
                <span>Cancel</span>
              </button>
              <button 
                type="submit" 
                disabled={savingProfile}
                style={{
                  ...styles.saveBtn,
                  opacity: savingProfile ? 0.75 : 1
                }}
              >
                <FiCheck size={14} style={{ marginRight: 6 }} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.viewLayout}>
            <div style={styles.infoRow}>
              <div style={styles.infoCol}>
                <span style={styles.infoLabel}>Full Name</span>
                <p style={styles.infoValue}>{profile?.name || '---'}</p>
              </div>
              <div style={styles.infoCol}>
                <span style={styles.infoLabel}>Email address</span>
                <p style={styles.infoValue}>
                  {profile?.email || user?.email || '---'} 
                  <FiLock size={12} style={{ marginLeft: 6, color: colors.textSecondary }} />
                </p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoCol}>
                <span style={styles.infoLabel}>Age Profile</span>
                <p style={styles.infoValue}>{profile?.age || 'Unspecified'}</p>
              </div>
              <div style={styles.infoCol}>
                <span style={styles.infoLabel}>Gender Styling</span>
                <p style={styles.infoValue}>{profile?.gender || 'Female'}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(true)}
              style={styles.editModeBtn}
            >
              <FiEdit size={14} style={{ marginRight: 8 }} />
              <span>Edit Profile Details</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
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
  card: {
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 4px 18px rgba(44, 42, 41, 0.02)',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(44,42,41,0.06)',
  },
  avatarImg: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `2px solid ${colors.border}`,
  },
  avatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: '36px',
    fontWeight: '800',
    color: colors.primary,
  },
  avatarLoading: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.border}`,
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '30px',
    height: '30px',
    borderRadius: '15px',
    backgroundColor: colors.primary,
    border: '2px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(240, 90, 91, 0.3)',
  },
  displayName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: '800',
    color: colors.text,
  },
  displayRole: {
    fontSize: '11px',
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: colors.textSecondary,
  },
  input: {
    width: '100%',
    height: '42px',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '8px',
    paddingLeft: '44px',
    paddingRight: '16px',
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text,
    outline: 'none',
  },
  doubleRow: {
    display: 'flex',
    gap: '20px',
  },
  select: {
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
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    height: '40px',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
    fontSize: '13px',
    fontWeight: '700',
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  saveBtn: {
    height: '40px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
  },
  viewLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoRow: {
    display: 'flex',
    gap: '40px',
  },
  infoCol: {
    flex: 1,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '12px',
  },
  infoLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.text,
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  editModeBtn: {
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
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.15)',
  },
};
export default Profile;
