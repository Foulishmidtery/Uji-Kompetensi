import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import BorrowingPage from './pages/BorrowingPage';
import ReportsPage from './pages/ReportsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import UsersPage from './pages/UsersPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/borrowings" element={<ProtectedRoute><BorrowingPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/activity-log" element={<ProtectedRoute roles={['admin']}><ActivityLogPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', backdropFilter: 'blur(10px)' } }} />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
