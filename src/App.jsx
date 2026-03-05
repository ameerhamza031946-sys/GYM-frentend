import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Nutrition from './pages/Nutrition';
import FormCheck from './pages/FormCheck';
import Performance from './pages/Performance';
import EquipmentSelection from './pages/EquipmentSelection';
import MobilityTest from './pages/MobilityTest';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fitai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('fitai_user');
    setUser(null);
  };

  const refreshUser = () => {
    try {
      const saved = localStorage.getItem('fitai_user');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      console.error("Error refreshing user:", e);
    }
  };

  console.log("DEBUG: App User State:", user);

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : !user.onboarding_completed ? (
          <>
            <Route path="/onboarding" element={<Onboarding onComplete={refreshUser} />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <>
            {/* Full-screen active workout - no layout header/nav */}
            <Route path="/workout/active" element={<FormCheck />} />
            <Route path="/onboarding" element={<Onboarding onComplete={refreshUser} />} />

            {/* All other routes use the shared layout */}
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<FormCheck />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/insights" element={<Performance />} />
              <Route path="/equipment" element={<EquipmentSelection />} />
              <Route path="/mobility-test" element={<MobilityTest />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
