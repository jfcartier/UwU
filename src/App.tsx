import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { MangaTaggerProvider } from './context/MangaTaggerContext';
import AppLayout from './components/layout/AppLayout';
import './App.css';

function App() {
  // Gérer les routes initiales
  useEffect(() => {
    const handleInitialRoute = () => {
      const path = window.location.pathname;
      if (path === '/') {
        window.history.replaceState({}, '', '/');
      }
    };

    handleInitialRoute();
  }, []);

  return (
    <ThemeProvider>
      <MangaTaggerProvider>
        <AppLayout />
      </MangaTaggerProvider>
    </ThemeProvider>
  );
}

export default App;