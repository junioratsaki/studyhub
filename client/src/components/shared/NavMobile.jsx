import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Heart, User } from 'lucide-react';

const NavMobile = () => {
  const navItems = [
    { name: 'Accueil', path: '/dashboard', icon: <Home size={24} /> },
    { name: 'Sujets', path: '/library', icon: <BookOpen size={24} /> },
    { name: 'Favoris', path: '/dashboard/favorites', icon: <Heart size={24} /> },
    { name: 'Profil', path: '/dashboard/profile', icon: <User size={24} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-iuc-gray border-t border-white/10 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-iuc-red' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavMobile;
