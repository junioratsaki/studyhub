import { useContext, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  BookOpen,
  Bot,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import api from '../../lib/axios';

// ─── Composant StatsCard ────────────────────────────────────────────────────
function StatsCard({ icon: Icon, value, label, color, trend, trendPositive }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5
        hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30
        transition-all duration-300 cursor-default group"
    >
      {/* Glow effect */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trendPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white tracking-tight">
          {value !== null && value !== undefined
            ? Number(value).toLocaleString('fr-FR')
            : '—'}
        </p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Tooltip personnalisé pour Recharts ────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name} : {Number(entry.value).toLocaleString('fr-FR')}
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#C41E2A', '#2D8E3C', '#3b82f6', '#f59e0b'];

// ─── Dashboard principal ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Données simulées de tendance mensuelle (si le backend ne les fournit pas encore)
  const monthlyData = stats?.monthly_activity || [
    { month: 'Jan', utilisateurs: 120, sujets: 85 },
    { month: 'Fév', utilisateurs: 180, sujets: 120 },
    { month: 'Mar', utilisateurs: 240, sujets: 160 },
    { month: 'Avr', utilisateurs: 310, sujets: 200 },
    { month: 'Mai', utilisateurs: 390, sujets: 265 },
    { month: 'Jun', utilisateurs: 450, sujets: 310 },
  ];

  const roleData = stats?.role_distribution || [
    { name: 'Étudiants', value: Math.max(1, (stats?.total_users || 0) - 5) },
    { name: 'Enseignants', value: 4 },
    { name: 'Admins', value: 1 },
  ];

  const CARDS = [
    {
      icon: Users,
      value: stats?.total_users,
      label: 'Utilisateurs inscrits',
      color: '#3b82f6',
      trend: '+12%',
      trendPositive: true,
    },
    {
      icon: BookOpen,
      value: stats?.total_subjects,
      label: 'Sujets publiés',
      color: '#C41E2A',
      trend: '+8%',
      trendPositive: true,
    },
    {
      icon: Bot,
      value: stats?.total_ai_sessions,
      label: 'Sessions IA actives',
      color: '#a855f7',
      trend: '+24%',
      trendPositive: true,
    },
    {
      icon: CheckCircle2,
      value: stats?.total_corrections,
      label: 'Corrections publiées',
      color: '#2D8E3C',
      trend: '+5%',
      trendPositive: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C41E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Chargement des statistiques…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-white font-semibold">Erreur de chargement</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C41E2A]/10 border border-[#C41E2A]/20 text-[#C41E2A] hover:bg-[#C41E2A]/20 transition-colors text-sm font-medium"
          >
            <RefreshCw size={14} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Tableau de bord administrateur — StudyHub
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart – activité mensuelle */}
        <div className="xl:col-span-2 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Activité mensuelle</h2>
            <p className="text-xs text-gray-500 mt-0.5">Évolution des utilisateurs et sujets</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 16 }}
              />
              <Line
                type="monotone"
                dataKey="utilisateurs"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="sujets"
                stroke="#C41E2A"
                strokeWidth={2.5}
                dot={{ fill: '#C41E2A', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart – répartition des rôles */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Répartition des rôles</h2>
            <p className="text-xs text-gray-500 mt-0.5">Distribution par type d'utilisateur</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {roleData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-[#1a1d27] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
                      <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill }}>
                        {payload[0].name} : {payload[0].value}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {roleData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
