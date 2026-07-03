import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage, LoginPage } from './Landing.jsx';
import CitizenPortal from './CitizenPortal.jsx';
import OfficerDashboard from './OfficerDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import PublicDashboard from './PublicDashboard.jsx';
import HelpTutorial from './HelpTutorial.jsx';
import { useTranslation } from 'react-i18next';
import { runSLAMonitor } from './backgroundAgent.js';
import { syncWithSupabase } from './data.js';

const DEFAULT_VIEW_BY_ROLE = {
  citizen: 'file',
  officer: 'assignments',
  admin: 'overview',
};

// Views are tracked through role + activeView so browser history can follow
// dashboard page changes without touching the underlying business logic.
export default function App() {
  const { i18n } = useTranslation();
  const [currentRole, setCurrentRole] = useState(null);
  const [activeView, setActiveView] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const hasMountedRef = useRef(false);
  const skipNextHistoryPushRef = useRef(false);

  useEffect(() => {
    // Attempt to sync with Supabase on app load
    syncWithSupabase().catch(console.error);

    // Autonomous SLA Monitor background loop
    const monitorInterval = setInterval(() => {
      runSLAMonitor((escalation) => {
        setLiveFeed(prev => [{
          message: `AUTO-ESCALATED: ${escalation.ticketId} — ${escalation.reason}`,
          timestamp: escalation.timestamp,
          type: 'escalation'
        }, ...prev]);
      });
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(monitorInterval);
  }, []);

  useEffect(() => {
    // Sync document direction for RTL support
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    window.history.replaceState({ view: 'landing' }, '', '');

    const handlePopState = (event) => {
      skipNextHistoryPushRef.current = true;

      if (event.state) {
        if (event.state.view === 'landing') {
          setCurrentRole(null);
          setActiveView(null);
        } else {
          setCurrentRole(event.state.role || null);
          setActiveView(event.state.view || null);
        }
      } else {
        setCurrentRole(null);
        setActiveView(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (skipNextHistoryPushRef.current) {
      skipNextHistoryPushRef.current = false;
      return;
    }

    if (activeView === null) {
      window.history.pushState({ view: 'landing' }, '', '');
      return;
    }

    window.history.pushState({ role: currentRole, view: activeView }, '', '');
  }, [currentRole, activeView]);

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    setActiveView('login');
  };

  const handleLogin = (role) => {
    setCurrentRole(role);
    setActiveView(DEFAULT_VIEW_BY_ROLE[role] || 'overview');
  };

  const handleLogout = () => {
    window.history.pushState({ view: 'landing' }, '', '');
    skipNextHistoryPushRef.current = true;
    setCurrentRole(null);
    setActiveView(null);
  };

  const handlePublicDash = () => {
    setActiveView('public');
  };

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const handleBackToLanding = () => {
    setCurrentRole(null);
    setActiveView(null);
  };

  const screen = useMemo(() => {
    if (activeView === null) {
      return (
        <LandingPage
          onPublicDash={handlePublicDash}
          onSelectRole={handleSelectRole}
        />
      );
    }

    if (activeView === 'login' && currentRole) {
      return <LoginPage role={currentRole} onBack={handleBackToLanding} onLogin={handleLogin} />;
    }

    if (activeView === 'public') {
      return <PublicDashboard onBack={handleBackToLanding} />;
    }

    if (currentRole === 'citizen') {
      return (
        <CitizenPortal
          page={activeView}
          onNavigate={setActiveView}
          onLogout={handleLogout}
          onPublicDash={handlePublicDash}
          onBack={handleBackToLanding}
        />
      );
    }

    if (currentRole === 'officer') {
      return (
        <OfficerDashboard
          onBack={handleBackToLanding}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          page={activeView}
        />
      );
    }

    if (currentRole === 'admin') {
      return (
        <AdminDashboard
          onBack={handleBackToLanding}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          page={activeView}
          liveFeed={liveFeed}
        />
      );
    }

    return (
      <LandingPage
        onPublicDash={handlePublicDash}
        onSelectRole={handleSelectRole}
      />
    );
  }, [activeView, currentRole]);

  const routeKey =
    activeView === null
      ? 'landing'
      : activeView === 'login'
        ? `login:${currentRole || 'guest'}`
        : activeView === 'public'
          ? `public:${currentRole || 'guest'}`
          : `dashboard:${currentRole || 'guest'}`;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.995 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {screen}
        </motion.div>
      </AnimatePresence>
      <HelpTutorial />
    </>
  );
}

