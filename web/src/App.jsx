import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Wardrobe } from './pages/Wardrobe';
import { Outfits } from './pages/Outfits';
import { WeatherStyling } from './pages/WeatherStyling';
import { OccasionStyling } from './pages/OccasionStyling';
import { ColorMatching } from './pages/ColorMatching';
import { Planner } from './pages/Planner';
import { SavedOutfits } from './pages/SavedOutfits';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/" 
            element={
              <Layout>
                <Dashboard />
              </Layout>
            } 
          />
          <Route 
            path="/wardrobe" 
            element={
              <Layout>
                <Wardrobe />
              </Layout>
            } 
          />
          <Route 
            path="/outfits" 
            element={
              <Layout>
                <Outfits />
              </Layout>
            } 
          />
          <Route 
            path="/outfits/weather" 
            element={
              <Layout>
                <WeatherStyling />
              </Layout>
            } 
          />
          <Route 
            path="/outfits/occasion" 
            element={
              <Layout>
                <OccasionStyling />
              </Layout>
            } 
          />
          <Route 
            path="/outfits/color-match" 
            element={
              <Layout>
                <ColorMatching />
              </Layout>
            } 
          />
          <Route 
            path="/planner" 
            element={
              <Layout>
                <Planner />
              </Layout>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <Layout>
                <SavedOutfits />
              </Layout>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <Layout>
                <Profile />
              </Layout>
            } 
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
