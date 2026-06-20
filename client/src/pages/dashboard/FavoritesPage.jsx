import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../../lib/axios';
import SubjectCard from '../../components/dashboard/SubjectCard';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me/favorites');
      if (response.data.success) {
        // Map backend favorites to SubjectCard props
        const mapped = response.data.data.map(fav => {
          const sub = fav.subjects;
          return {
            id: sub.id,
            title: sub.title,
            type: sub.type_examen === 'NORMAL' ? 'SN' : (sub.type_examen === 'RATTRAPAGE' ? 'RAT' : sub.type_examen),
            matiere: sub.matiere || 'Général',
            annee: sub.annee,
            views: sub.nombre_vues || 0,
            file_url: sub.file_url,
            isFavorite: true
          };
        });
        setFavorites(mapped);
      }
    } catch (error) {
      console.error("Erreur de chargement des favoris:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (subjectId, isFav) => {
    // Si retiré des favoris, on le retire de la liste affichée
    if (!isFav) {
      setFavorites(prev => prev.filter(s => s.id !== subjectId));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Heart className="text-iuc-red fill-current" /> Mes Favoris
        </h1>
        <p className="text-gray-400">Retrouvez ici tous les sujets que vous avez sauvegardés pour vos révisions.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-iuc-red"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Heart size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun favori pour le moment</h3>
          <p className="text-gray-400 max-w-md">
            Explorez la bibliothèque et cliquez sur le cœur d'un sujet pour l'ajouter à vos favoris et y accéder rapidement plus tard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {favorites.map((subject) => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
