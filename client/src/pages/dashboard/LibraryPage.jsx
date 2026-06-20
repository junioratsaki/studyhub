import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import SubjectCard from '../../components/dashboard/SubjectCard';
import api from '../../lib/axios';

const LibraryPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtres
  const [filters, setFilters] = useState({
    filiere_id: '',
    type: '',
    annee: ''
  });

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const res = await api.get('/subjects/filieres');
        if (res.data.success) {
          setFilieres(res.data.data);
        }
      } catch (err) {
        console.error("Erreur de chargement des filières", err);
      }
    };
    fetchFilieres();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      let response;
      const typeMap = {
        'SN': 'NORMAL',
        'RAT': 'RATTRAPAGE',
        'CC': 'CC',
        'TP': 'TP'
      };
      
      const backendType = filters.type ? typeMap[filters.type] : undefined;

      if (searchTerm.trim() !== '') {
        response = await api.get('/subjects/search', {
          params: {
            q: searchTerm,
            filiere_id: filters.filiere_id || undefined,
            page: currentPage
          }
        });
      } else {
        response = await api.get('/subjects', {
          params: {
            filiere_id: filters.filiere_id || undefined,
            type_examen: backendType,
            annee: filters.annee || undefined,
            page: currentPage
          }
        });
      }

      if (response.data.success) {
        const { data: rawSubjects, totalPages: pages } = response.data.data;
        
        // Récupérer les favoris pour marquer les cartes
        const favRes = await api.get('/users/me/favorites');
        const favIds = favRes.data.success ? favRes.data.data.map(f => f.subject_id) : [];

        const mapped = rawSubjects.map(sub => ({
          id: sub.id,
          title: sub.title,
          type: sub.type_examen === 'NORMAL' ? 'SN' : (sub.type_examen === 'RATTRAPAGE' ? 'RAT' : sub.type_examen),
          matiere: sub.matieres?.nom || sub.matiere || 'Général',
          annee: sub.annee,
          views: sub.nombre_vues || 0,
          file_url: sub.file_url,
          isFavorite: favIds.includes(sub.id)
        }));

        setSubjects(mapped);
        setTotalPages(pages || 1);
      }
    } catch (err) {
      console.error("Erreur de chargement des sujets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [filters, currentPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset page on filter change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubjects();
  };

  const handleFavoriteToggle = (subjectId, isFav) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, isFavorite: isFav } : s));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Bibliothèque de sujets</h1>
        <p className="text-gray-400">Explorez, filtrez et trouvez les anciens sujets d'examens.</p>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-iuc-dark/95 backdrop-blur-md pt-2 pb-6 border-b border-white/5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher un sujet, une matière... (Appuyez sur Entrée)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-iuc-gray border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-iuc-red transition-colors placeholder:text-gray-600"
            />
          </form>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="relative min-w-[160px]">
              <select 
                value={filters.filiere_id}
                onChange={(e) => handleFilterChange('filiere_id', e.target.value)}
                className="w-full appearance-none bg-iuc-gray border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-iuc-red cursor-pointer"
              >
                <option value="">Filière (Toutes)</option>
                {filieres.map(f => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full appearance-none bg-iuc-gray border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-iuc-red cursor-pointer"
              >
                <option value="">Type (Tous)</option>
                <option value="SN">Session Normale</option>
                <option value="CC">Contrôle Continu</option>
                <option value="RAT">Rattrapage</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select 
                value={filters.annee}
                onChange={(e) => handleFilterChange('annee', e.target.value)}
                className="w-full appearance-none bg-iuc-gray border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-iuc-red cursor-pointer"
              >
                <option value="">Année (Toutes)</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
            
            <button type="button" className="md:hidden flex items-center justify-center w-12 bg-iuc-gray border border-white/10 rounded-lg text-white">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Subjects */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-iuc-red"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 my-4">
          <p className="text-gray-400">Aucun sujet trouvé correspondant à vos critères.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              onFavoriteToggle={handleFavoriteToggle} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-colors ${
                  currentPage === page 
                    ? 'bg-iuc-red text-white shadow-lg shadow-iuc-red/20' 
                    : 'border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
