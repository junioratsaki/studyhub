import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Lock, Mail, Loader2, School, ArrowLeft, MapPin, GraduationCap } from 'lucide-react';
import api from '../../lib/axios';

const registerSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  matricule: z.string().min(3, "Le matricule est obligatoire"),
  email: z.string().email("Format d'email invalide").optional().or(z.literal('')),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  filiere_id: z.string().min(1, "Veuillez sélectionner votre filière"),
});

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // États pour le référentiel ERP
  const [referentiel, setReferentiel] = useState({
    campus: [],
    ecoles: [],
    niveaux: [],
    filieres: []
  });
  
  // États pour les sélections dépendantes
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedEcole, setSelectedEcole] = useState('');

  // Récupération de tout le référentiel au chargement
  useEffect(() => {
    const fetchReferentiel = async () => {
      try {
        const response = await api.get('/referentiel');
        if (response.data.success) {
          setReferentiel(response.data.data);
        }
      } catch (error) {
        console.error("Erreur de chargement du référentiel ERP", error);
      }
    };
    fetchReferentiel();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  // Filtrage des écoles selon le campus choisi
  const availableEcoles = referentiel.ecoles.filter(e => e.campus_id === selectedCampus);
  
  // Filtrage des filières selon l'école choisie
  const availableFilieres = referentiel.filieres.filter(f => f.ecole_id === selectedEcole);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    // On force le rôle ETUDIANT pour l'inscription publique ERP
    const result = await registerAuth({ ...data, role: 'ETUDIANT' });
    setIsLoading(false);
    
    if (result.success) {
      navigate('/login'); // Redirection vers login pour se connecter avec le matricule
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-iuc-dark px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-iuc-green/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-iuc-red/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <div className="glass-panel p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Inscription ERP</h2>
            <p className="text-gray-400">Enregistrez votre matricule pour accéder à StudyHub</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    {...register('nom')}
                    className={`w-full bg-iuc-gray/50 border ${errors.nom ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                    placeholder="Jean Dupont"
                  />
                </div>
                {errors.nom && <p className="text-iuc-red text-xs mt-1.5">{errors.nom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Matricule IUC</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    {...register('matricule')}
                    className={`w-full bg-iuc-gray/50 border ${errors.matricule ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600 uppercase`}
                    placeholder="24IUC001"
                  />
                </div>
                {errors.matricule && <p className="text-iuc-red text-xs mt-1.5">{errors.matricule.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email (optionnel)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full bg-iuc-gray/50 border ${errors.email ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                  placeholder="jean.dupont@myiuc.com"
                />
              </div>
              {errors.email && <p className="text-iuc-red text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélection Campus */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Campus</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <select
                    onChange={(e) => {
                      setSelectedCampus(e.target.value);
                      setSelectedEcole(''); // Reset école si campus change
                    }}
                    value={selectedCampus}
                    className="w-full bg-iuc-gray/50 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 outline-none appearance-none"
                  >
                    <option value="">Choisir campus</option>
                    {referentiel.campus.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sélection École */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">École</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <select
                    onChange={(e) => setSelectedEcole(e.target.value)}
                    value={selectedEcole}
                    disabled={!selectedCampus}
                    className="w-full bg-iuc-gray/50 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 outline-none appearance-none disabled:opacity-50"
                  >
                    <option value="">Choisir école</option>
                    {availableEcoles.map(e => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sélection Filière */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Filière & Niveau</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <select
                  {...register('filiere_id')}
                  disabled={!selectedEcole}
                  className={`w-full bg-iuc-gray/50 border ${errors.filiere_id ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none appearance-none disabled:opacity-50`}
                >
                  <option value="">Sélectionnez votre filière</option>
                  {availableFilieres.map(f => (
                    <option key={f.id} value={f.id}>{f.nom} ({f.niveau?.nom})</option>
                  ))}
                </select>
              </div>
              {errors.filiere_id && <p className="text-iuc-red text-xs mt-1.5">{errors.filiere_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full bg-iuc-gray/50 border ${errors.password ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-iuc-red text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-iuc-red/10 border border-iuc-red/20 text-red-200 text-sm p-3 rounded-lg text-center">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-iuc-red hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-iuc-red/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Finaliser l'inscription"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline decoration-iuc-red underline-offset-4 transition-all">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
