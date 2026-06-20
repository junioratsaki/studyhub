import { useState, useRef, useEffect } from 'react';
import { User, Mail, School, Shield, Camera, Loader2, MapPin, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/axios';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Charger le profil complet avec les jointures ERP
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error("Erreur chargement profil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const response = await api.patch('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setProfile(prev => ({ ...prev, avatar_url: response.data.data.avatar_url }));
      }
    } catch (error) {
      alert("Erreur lors de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-iuc-red h-8 w-8" />
      </div>
    );
  }

  const userData = profile || user;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Mon Profil Académique</h1>
        <p className="text-gray-400">Consultez vos informations ERP et gérez votre photo de profil.</p>
      </div>

      <div className="glass-panel p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar Section */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/5 bg-iuc-dark shadow-2xl relative">
              {userData?.avatar_url ? (
                <img src={userData.avatar_url} alt={userData.nom} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-iuc-red to-iuc-green flex items-center justify-center text-white text-4xl font-bold">
                  {userData?.nom?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white h-8 w-8" />
                </div>
              )}
            </div>
            
            <button className="absolute -bottom-2 -right-2 p-2 bg-iuc-red rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          
          <div className="flex-1 space-y-8 w-full">
            {/* Infos Personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-iuc-red font-bold text-sm uppercase tracking-wider border-b border-iuc-red/20 pb-2">Identité</h3>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase">Matricule</label>
                  <p className="text-white font-mono bg-white/5 p-2 rounded-lg border border-white/10 uppercase tracking-widest">
                    {userData?.matricule || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase">Nom Complet</label>
                  <p className="text-white text-lg font-semibold">{userData?.nom}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail size={16} />
                  <span className="text-sm">{userData?.email || 'Pas d\'email renseigné'}</span>
                </div>
              </div>

              {/* Infos Académiques (ERP) */}
              <div className="space-y-4">
                <h3 className="text-iuc-green font-bold text-sm uppercase tracking-wider border-b border-iuc-green/20 pb-2">Scolarité ERP</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <MapPin className="text-iuc-red mt-1" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Campus</p>
                      <p className="text-white font-medium">{userData?.filiere?.ecole?.campus?.nom || 'Non assigné'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <School className="text-iuc-green mt-1" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">École</p>
                      <p className="text-white font-medium">{userData?.filiere?.ecole?.nom || 'Non assignée'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <GraduationCap className="text-iuc-red mt-1" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Filière & Niveau</p>
                      <p className="text-white font-medium">
                        {userData?.filiere?.nom || 'Non assignée'} 
                        {userData?.filiere?.niveau?.nom ? ` (${userData.filiere.niveau.nom})` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${userData?.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                Rôle : {userData?.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${userData?.is_active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                Statut : {userData?.is_active ? 'ACTIF' : 'INACTIF'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
