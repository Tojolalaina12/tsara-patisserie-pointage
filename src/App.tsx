import React, { useState, useEffect } from 'react';
import { User } from './types';
import { initStorage, getCurrentUser, setCurrentUserSession } from './utils/storage';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { VendeuseDashboard } from './components/VendeuseDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DemoToolbar } from './components/DemoToolbar';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Time Ticker State
  const [nowDate, setNowDate] = useState(new Date());
  const [overrideTime, setOverrideTime] = useState<string | null>(null);

  useEffect(() => {
    initStorage();
    const savedUser = getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format current display time
  const realTimeStr = nowDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const currentTimeStr = overrideTime || realTimeStr;

  // Login Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAdminLoggedIn(false);
    setCurrentUserSession(user);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentUser(null);
    setCurrentUserSession(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    setCurrentUserSession(null);
  };

  const handleResetData = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de l\'application avec les données démo ?')) {
      localStorage.clear();
      initStorage();
      handleLogout();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-800 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Outer Shell - Mobile Frame Container or Full Viewport */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md min-h-[850px] sm:min-h-[880px] bg-slate-100 sm:rounded-[48px] shadow-2xl shadow-indigo-950/80 border-0 sm:border-[10px] sm:border-slate-800 overflow-hidden relative flex flex-col'
            : 'max-w-4xl min-h-screen bg-slate-100 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col'
        }`}
      >
        {/* Top Camera Notch Decorator for Mobile Frame */}
        {isMobileFrame && (
          <div className="hidden sm:flex justify-center items-center pt-2 pb-1 bg-slate-900">
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-950"></span>
            </div>
          </div>
        )}

        {/* HEADER */}
        <Header
          currentUser={currentUser}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
          isMobileFrame={isMobileFrame}
          toggleFrameMode={() => setIsMobileFrame(!isMobileFrame)}
          currentTimeStr={currentTimeStr}
        />

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {!currentUser && !isAdminLoggedIn && (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onAdminLoginSuccess={handleAdminLoginSuccess}
            />
          )}

          {currentUser && !isAdminLoggedIn && (
            <VendeuseDashboard
              currentUser={currentUser}
              simulatedTimeStr={currentTimeStr}
            />
          )}

          {isAdminLoggedIn && (
            <AdminDashboard
              onLogoutAdmin={handleLogout}
              onSetSimulatedTime={(time) => setOverrideTime(time)}
              simulatedTimeStr={currentTimeStr}
            />
          )}
        </main>

        {/* Bottom Home Indicator Decorator for Mobile Frame */}
        {isMobileFrame && (
          <div className="hidden sm:block py-2 bg-slate-100 text-center shrink-0">
            <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto"></div>
          </div>
        )}
      </div>

      {/* DEMO TIME TESTER TOOLBAR */}
      <DemoToolbar
        simulatedTimeStr={currentTimeStr}
        onSetSimulatedTime={(time) => setOverrideTime(time)}
        onResetData={handleResetData}
      />
    </div>
  );
}
