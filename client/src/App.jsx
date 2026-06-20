import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import LibraryPage from './pages/dashboard/LibraryPage';
import SubjectDetailPage from './pages/dashboard/SubjectDetailPage';
import FavoritesPage from './pages/dashboard/FavoritesPage';
import HistoryPage from './pages/dashboard/HistoryPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReferentielManagement from './pages/admin/ReferentielManagement';
import UsersManagement from './pages/admin/UsersManagement';
import ValidationQueue from './pages/admin/ValidationQueue';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Routes Protégées - Étudiant */}
          <Route element={<ProtectedRoute requiredRole="ETUDIANT" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/dashboard/favorites" element={<FavoritesPage />} />
              <Route path="/dashboard/history" element={<HistoryPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
            </Route>
            {/* Subject Detail is outside DashboardLayout because it uses full screen width/height */}
            <Route path="/subject/:id" element={<SubjectDetailPage />} />
          </Route>

          {/* Routes Protégées - Admin */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/referentiel" element={<ReferentielManagement />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/validation" element={<ValidationQueue />} />
              <Route path="/admin/logs" element={<AuditLogs />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
