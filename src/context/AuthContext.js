import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { auth, database } from '../config/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid) => {
    try {
      const profileRef = ref(database, `users/${uid}/profile`);
      const snapshot = await get(profileRef);
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (name, email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const initialProfile = {
        name,
        email,
        createdAt: Date.now(),
        setupCompleted: false,
      };

      await set(ref(database, `users/${firebaseUser.uid}/profile`), initialProfile);
      setProfile(initialProfile);
      return firebaseUser;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('No authenticated user');
    try {
      const profileRef = ref(database, `users/${user.uid}/profile`);
      await update(profileRef, profileData);
      setProfile((prev) => (prev ? { ...prev, ...profileData } : profileData));
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        login,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
