import { useState, useEffect } from 'react';
import { School, MapPin, GraduationCap, Plus, Trash2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

const ReferentielManagement = () => {
  const [activeTab, setActiveTab] = useState('campus');
  const [data, setData] = useState({ campus: [], ecoles: [], niveaux: [], filieres: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReferentiel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/referentiel');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferentiel();
  }, []);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#C41E2A] h-8 w-8" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-gray-400">{error}</p>
        </div>
      );
    }

    const currentData = data[activeTab] || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            Aucune donnée disponible pour cette section.
          </div>
        ) : (
          currentData.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#C41E2A]/10 flex items-center justify-center text-[#C41E2A]">
                  {activeTab === 'campus' && <MapPin size={20} />}
                  {activeTab === 'ecoles' && <School size={20} />}
                  {activeTab === 'filieres' && <GraduationCap size={20} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.nom}</p>
                  {activeTab === 'ecoles' && <p className="text-xs text-gray-500">Campus ID: {item.campus_id}</p>}
                  {activeTab === 'filieres' && <p className="text-xs text-gray-500">{item.ecole?.nom || 'Sans école'}</p>}
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
        
        {/* Bouton Ajouter */}
        <button className="border-2 border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/30 transition-all group">
          <Plus size={20} />
          <span className="text-sm font-medium">Ajouter {activeTab === 'campus' ? 'un campus' : activeTab === 'ecoles' ? 'une école' : 'une filière'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <School size={24} className="text-[#C41E2A]" />
            Référentiel ERP
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gérez les structures académiques de l'IUC.</p>
        </div>
        <button 
          onClick={fetchReferentiel}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        {[
          { id: 'campus', label: 'Campus', icon: MapPin },
          { id: 'ecoles', label: 'Écoles', icon: School },
          { id: 'filieres', label: 'Filières', icon: GraduationCap }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-[#C41E2A] text-white bg-[#C41E2A]/5' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {renderTabContent()}
      </div>

      <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-blue-200 font-semibold text-sm">Note Administrative</h4>
          <p className="text-blue-300/70 text-xs mt-1 leading-relaxed">
            Toute modification du référentiel impacte directement les comptes étudiants. 
            Il est recommandé de ne pas supprimer de filière contenant déjà des étudiants inscrits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferentielManagement;
