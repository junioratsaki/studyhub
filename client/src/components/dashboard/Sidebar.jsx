import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Heart, User, LogOut, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Accueil' },
    { path: '/library', icon: <BookOpen size={20} />, label: 'Bibliothèque' },
    { path: '/dashboard/favorites', icon: <Heart size={20} />, label: 'Favoris' },
    { path: '/dashboard/profile', icon: <User size={20} />, label: 'Profil' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0">
      <div className="p-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-blue-500 shadow-md">
            <img src="/logoStudyHUb.jfif" alt="StudyHub IUC" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            StudyHub
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
