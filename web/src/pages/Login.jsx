import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-slide-up">
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.brand}>LookSy <span style={{ color: colors.primary }}>AI</span></h1>
          <p style={styles.subtitle}>Log in to curating your digital closet</p>
        </div>

        {/* Error Callout */}
        {error ? (
          <div style={styles.errorBox} className="animate-fade-in">
            <FiAlertCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <FiMail style={styles.inputIcon} size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer link */}
        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: colors.background,
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: `1.5px solid ${colors.border}`,
    padding: '40px',
    boxShadow: '0 8px 30px rgba(44, 42, 41, 0.04)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  brand: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px',
    color: colors.text,
  },
  subtitle: {
    fontSize: '14px',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
    border: `1px solid ${colors.error}`,
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '24px',
    color: colors.error,
    fontSize: '13px',
    fontWeight: '600',
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
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
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
    height: '48px',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '12px',
    paddingLeft: '48px',
    paddingRight: '16px',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    width: '100%',
    height: '48px',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(240, 90, 91, 0.2)',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '13px',
    color: colors.textSecondary,
    marginTop: '24px',
    fontWeight: '500',
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    textDecoration: 'none',
  },
};
