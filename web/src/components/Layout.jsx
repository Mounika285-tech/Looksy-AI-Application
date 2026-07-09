import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const Layout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loader}>
        <div className="animate-spin" style={styles.spinner}></div>
        <p style={{ marginTop: '16px', fontWeight: '600', color: '#6E6B64' }}>Loading LookSy AI...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  loader: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#FDFBF7',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '4px solid #E8E2DC',
    borderTopColor: '#F05A5B',
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#FDFBF7',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    padding: '32px 40px',
    minHeight: '100vh',
    width: 'calc(100% - 260px)',
  },
};
