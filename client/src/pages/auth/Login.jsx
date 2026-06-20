import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, User, Loader2, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  matricule: z.string().min(3, "Le matricule est requis"),
  email: z.string().email("Format d'email invalide"),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    // Connexion via Matricule + Email (Standard ERP IUC)
    const result = await login(data.matricule, data.email);
    setIsLoading(false);
    
    if (result.success) {
      if (result.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-iuc-dark px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-iuc-red/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-iuc-green/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour au site
        </Link>

        <div className="glass-panel p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-iuc-red shadow-lg mx-auto mb-4">
              <img src="/logoStudyHUb.jfif" alt="StudyHub IUC Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Portail Académique</h2>
            <p className="text-gray-400">Authentifiez-vous pour accéder à vos ressources</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Matricule IUC</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  {...register('matricule')}
                  type="text"
                  className={`w-full bg-iuc-gray/50 border ${errors.matricule ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600 uppercase`}
                  placeholder="Ex: 24IUC001"
                />
              </div>
              {errors.matricule && <p className="text-iuc-red text-xs mt-1.5">{errors.matricule.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Étudiant</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full bg-iuc-gray/50 border ${errors.email ? 'border-iuc-red focus:border-iuc-red' : 'border-white/10 focus:border-white/30'} text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                  placeholder="nom.prenom@myiuc.com"
                />
              </div>
              {errors.email && <p className="text-iuc-red text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {serverError && (
              <div className="bg-iuc-red/10 border border-iuc-red/20 text-red-200 text-sm p-3 rounded-lg text-center">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-iuc-red hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-iuc-red/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Veuillez utiliser vos identifiants officiels fournis par l'IUC.<br/>
              Contactez la scolarité pour toute assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
