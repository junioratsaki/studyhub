import { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ScrollText,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Bell,
  ChevronRight,
  School,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/referentiel', label: 'Référentiel ERP', icon: School },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/validation', label: 'Queue Validation', icon: ClipboardList },
  { to: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-white overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-gradient-to-b from-[#12151f] to-[#0a0d14]
          border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C41E2A] to-[#8B0000] flex items-center justify-center shadow-lg shadow-red-900/30">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-wide">StudyHub</p>
            <p className="text-[10px] text-[#C41E2A] font-semibold uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-3 mb-3">
            Navigation
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#C41E2A]/15 text-[#C41E2A] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C41E2A] rounded-r-full" />
                  )}
                  <Icon
                    size={17}
                    className={`transition-colors ${isActive ? 'text-[#C41E2A]' : 'text-gray-500 group-hover:text-gray-300'}`}
                  />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={13} className="ml-auto text-[#C41E2A]/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profil admin */}
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E2A] to-[#8B0000] flex items-center justify-center text-xs font-bold text-white shadow">
              {user?.nom?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.nom || 'Administrateur'}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={15} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#0F1117]/80 backdrop-blur-sm shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-400">
              Bienvenue,{' '}
              <span className="text-white font-semibold">{user?.nom || 'Admin'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C41E2A] rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E2A] to-[#8B0000] flex items-center justify-center text-xs font-bold text-white">
              {user?.nom?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
