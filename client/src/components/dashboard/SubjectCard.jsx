import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const SubjectCard = ({ subject, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = useState(subject.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/users/me/favorites/${subject.id}`);
      } else {
        await api.post(`/users/me/favorites/${subject.id}`);
      }
      setIsFavorite(!isFavorite);
      if (onFavoriteToggle) {
        onFavoriteToggle(subject.id, !isFavorite);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-iuc-gray rounded-xl border border-white/5 overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 group flex flex-col h-full relative"
    >
      <div className="h-32 bg-gradient-to-br from-[#1E212B] to-[#0F1117] flex items-center justify-center relative border-b border-white/5">
        <BookOpen size={40} className="text-white/10 group-hover:scale-110 transition-transform" />
        
        {/* Type d'examen Badge */}
        <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white shadow-md ${
          subject.type === 'SN' ? 'bg-iuc-green' : 
          subject.type === 'CC' ? 'bg-blue-600' : 'bg-orange-500'
        }`}>
          {subject.type}
        </span>

        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
            isFavorite 
              ? 'bg-iuc-red/20 text-iuc-red hover:bg-iuc-red/30' 
              : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
          }`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} className={isLoading ? "animate-pulse" : ""} />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-iuc-green text-xs font-bold uppercase tracking-wider">{subject.matiere}</p>
          <span className="text-gray-500 text-xs font-medium">{subject.annee}</span>
        </div>
        
        <h3 className="text-white font-semibold text-lg leading-tight mb-4 line-clamp-2">
          {subject.title}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-gray-500 text-xs flex items-center gap-1.5 font-medium">
            <Eye size={14} /> {subject.views}
          </span>
          <Link 
            to={`/subject/${subject.id}`}
            className="px-4 py-2 bg-iuc-red/10 text-iuc-red hover:bg-iuc-red hover:text-white rounded-lg text-sm font-bold transition-colors"
          >
            Consulter
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
