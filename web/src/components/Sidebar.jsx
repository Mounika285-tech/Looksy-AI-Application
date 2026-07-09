import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { 
  FiHome, 
  FiLayers, 
  FiGrid, 
  FiCalendar, 
  FiHeart, 
  FiUser, 
  FiSettings, 
  FiLogOut 
} from 'react-icons/fi';

export const Sidebar = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { to: '/', label: 'Home Dashboard', icon: FiHome },
    { to: '/wardrobe', label: 'My Wardrobe', icon: FiLayers },
    { to: '/outfits', label: 'AI Lookbook & Styling', icon: FiGrid },
    { to: '/planner', label: 'Daily Planner', icon: FiCalendar },
    { to: '/favorites', label: 'Saved Favorites', icon: FiHeart },
    { to: '/profile', label: 'Profile Settings', icon: FiUser },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* App Branding */}
      <div style={styles.branding} onClick={() => navigate('/')}>
        <span style={styles.logoText}>LookSy <span style={{ color: colors.primary }}>AI</span></span>
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? 'rgba(240, 90, 91, 0.08)' : 'transparent',
                borderLeft: isActive ? `4px solid ${colors.primary}` : '4px solid transparent',
                color: isActive ? colors.primary : colors.text,
                fontWeight: isActive ? '700' : '500',
              })}
            >
              <Icon size={18} style={{ marginRight: 12, flexShrink: 0 }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout footer */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatarPlaceholder}>
            {profile?.name ? profile.name[0].toUpperCase() : 'U'}
          </div>
          <div style={styles.userMeta}>
            <p style={styles.userName}>{profile?.name || 'Stylist User'}</p>
            <p style={styles.userRole}>{profile?.gender || 'Custom Style'}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FiLogOut size={16} style={{ marginRight: 8 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    paddingTop: '24px',
  },
  branding: {
    padding: '0 24px 32px 24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: colors.text,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  footer: {
    padding: '20px',
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.background,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: colors.accent,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
    marginRight: '12px',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  logoutBtn: {
    width: '100%',
    height: '38px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    backgroundColor: '#FFFFFF',
    color: colors.textSecondary,
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
