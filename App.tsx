
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Billing } from './pages/Billing';
import { Inventory } from './pages/Inventory';
import { Invoices } from './pages/Invoices';
import { Reports } from './pages/Reports';
import { GstReports } from './pages/GstReports';
import { UserManagement } from './pages/UserManagement';
import { AuditLogs } from './pages/AuditLogs';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="pt-16 flex-1 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        {user.tier === 'TIER-2' && (
          <>
            <Route path="/gst-reports" element={<GstReports />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
