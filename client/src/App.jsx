import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Budget from './pages/Budget.jsx';
import Goals from './pages/Goals.jsx';
import Recurring from './pages/Recurring.jsx';
import Analytics from './pages/Analytics.jsx';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import LoginPage from './pages/LoginPage.jsx';

function AppInner() {
  const { activePage } = useApp();
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  if (activePage === 'admin' && !adminLoggedIn) {
    return (
      <>
        <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </>
    );
  }

  const pages = {
    dashboard: <Dashboard />,
    expenses: <Expenses />,
    budget: <Budget />,
    goals: <Goals />,
    recurring: <Recurring />,
    analytics: <Analytics />,
    admin: <Admin onLogout={() => setAdminLoggedIn(false)} />,
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          {pages[activePage] || <Dashboard />}
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3000,
        }}
      />
    </div>
  );
}

export default function App() {
  // Check if user is already logged in (from localStorage)
  const savedUser = localStorage.getItem('user');
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  // If not logged in, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // If logged in, show the full app
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
