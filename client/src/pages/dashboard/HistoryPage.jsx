import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import api from '../../lib/axios';
import SubjectCard from '../../components/dashboard/SubjectCard';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me/history');
      const favRes = await api.get('/users/me/favorites');
      const favIds = favRes.data.success ? favRes.data.data.map(f => f.subject_id) : [];
      
      if (response.data.success) {
        // Map backend history to SubjectCard props
        const mapped = response.data.data.map(hist => {
          const sub = hist.subjects;
          return {
            id: sub.id,
            title: sub.title,
            type: sub.type_examen === 'NORMAL' ? 'SN' : (sub.type_examen === 'RATTRAPAGE' ? 'RAT' : sub.type_examen),
            matiere: sub.matiere || 'Général',
            annee: sub.annee,
            views: sub.nombre_vues || 0,
            file_url: sub.file_url,
            isFavorite: favIds.includes(sub.id)
          };
        });
        setHistory(mapped);
      }
    } catch (error) {
      console.error("Erreur de chargement de l'historique:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFavoriteToggle = (subjectId, isFav) => {
    setHistory(prev => prev.map(s => s.id === subjectId ? { ...s, isFavorite: isFav } : s));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock className="text-iuc-green" /> Historique
        </h1>
        <p className="text-gray-400">Consultez votre historique de navigation et reprenez vos révisions là où vous vous êtes arrêté.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-iuc-red"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Clock size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Votre historique est vide</h3>
          <p className="text-gray-400 max-w-md">
            Les sujets que vous consulterez apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {history.map((subject) => (
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

export default HistoryPage;
