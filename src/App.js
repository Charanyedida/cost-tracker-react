import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ToastProvider } from './context/ToastContext';
import Background3D from './components/Background3D';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AnimatedLayout from './components/AnimatedLayout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <span>Loading Cost Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="app-container">
        <Background3D />

        {/* We key the layout to force a re-mount animation on view switch */}
        <AnimatedLayout key={user ? 'dashboard' : 'auth'}>
          {user ? (
            <Dashboard user={user} onLogout={() => setUser(null)} />
          ) : (
            <Auth onLogin={setUser} />
          )}
        </AnimatedLayout>
      </div>
    </ToastProvider>
  );
}

export default App;
