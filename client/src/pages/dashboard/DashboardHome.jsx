import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Bell, BookOpen, Heart, MessageSquare, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AnnouncementCard = ({ ann }) => (
  <div className="min-w-[300px] p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg snap-start">
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs bg-white/20 px-3 py-1 rounded-full uppercase font-bold tracking-wider">
        {ann.type || 'Info'}
      </span>
      <span className="text-xs opacity-80">{new Date(ann.created_at).toLocaleDateString()}</span>
    </div>
    <h4 className="text-lg font-bold mb-2">{ann.title}</h4>
    <p className="text-sm text-blue-100 line-clamp-2">{ann.content}</p>
  </div>
);

const DashboardHome = () => {
  const [subjects, setSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ subjects: 0, favorites: 0, aiSessions: 0, corrections: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallélisation des appels API pour la performance
        const [subRes, annRes, statRes] = await Promise.all([
          api.get('/subjects?limit=6'),
          api.get('/announcements'),
          api.get('/users/me/stats')
        ]);
        setSubjects(subRes.data.data);
        setAnnouncements(annRes.data.data);
        setStats(statRes.data.data);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-8">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Annonces (Large block) */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="text-blue-600" /> Annonces récentes
          </h3>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {announcements.map((ann) => <AnnouncementCard key={ann.id} ann={ann} />)}
          </div>
        </div>

        {/* Stats (Grid 4 items) */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sujets vus', value: stats.subjects, icon: BookOpen },
            { label: 'Favoris', value: stats.favorites, icon: Heart },
            { label: 'Sessions IA', value: stats.aiSessions, icon: MessageSquare },
            { label: 'Corrections', value: stats.corrections, icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm">{stat.label}</span>
                <stat.icon className="text-blue-500 h-5 w-5" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Sujets Récents (Main block) */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Sujets récemment ajoutés</h3>
            <Link to="/library" className="flex items-center text-blue-600 font-semibold hover:gap-2 transition-all">
              Voir tout <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(sub => (
              <motion.div key={sub.id} whileHover={{ y: -5 }} className="p-5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">{sub.title}</h4>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs bg-white px-2 py-1 rounded border text-gray-600">{sub.matiere}</span>
                  <Link to={`/subject/${sub.id}`} className="text-sm text-blue-600 font-bold hover:underline">Consulter</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
