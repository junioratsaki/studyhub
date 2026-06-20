import axios from 'axios';

// URL de base du backend
const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token d'accès
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et le rafraîchissement du token (à implémenter si besoin de refresh token rotation, pour l'instant on déconnecte sur 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on a une erreur 401 (Non autorisé) et qu'on n'a pas déjà essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Pour l'instant, on purge simplement le token et on redirige vers le login
      // Dans une version plus avancée, on pourrait appeler /auth/refresh ici
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // On évite de rediriger si on est déjà sur la page de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
