import { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Info,
  AlertTriangle,
  XOctagon,
} from 'lucide-react';
import api from '../../lib/axios';

// ─── Badge niveau log ──────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const config = {
    INFO: { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', icon: Info },
    WARN: { cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', icon: AlertTriangle },
    WARNING: { cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', icon: AlertTriangle },
    ERROR: { cls: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: XOctagon },
    CRITICAL: { cls: 'bg-red-700/15 text-red-300 border border-red-700/30', icon: Shield },
  };
  const { cls, icon: Icon } = config[level?.toUpperCase()] || config.INFO;
  return (
    <span className={`flex items-center gap-1 w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>
      <Icon size={10} />
      {level}
    </span>
  );
}

// ─── Formatter la date ─────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const LIMIT = 20;
  const totalPages = Math.max(1, Math.ceil(count / LIMIT));

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (levelFilter) params.level = levelFilter;
      const res = await api.get('/admin/logs', { params });
      const d = res.data.data;
      setLogs(d.data || []);
      setCount(d.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les logs');
    } finally {
      setLoading(false);
    }
  }, [page, levelFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText size={22} className="text-[#C41E2A]" />
            Journal d'audit
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {count.toLocaleString('fr-FR')} entrée{count !== 1 ? 's' : ''} enregistrée{count !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Filtre niveau */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <span className="text-sm text-gray-400">Niveau :</span>
        </div>
        {['', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].map(lvl => (
          <button
            key={lvl}
            onClick={() => { setLevelFilter(lvl); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              levelFilter === lvl
                ? 'bg-[#C41E2A]/15 text-[#C41E2A] border border-[#C41E2A]/30'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {lvl || 'Tous'}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#C41E2A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C41E2A]/10 border border-[#C41E2A]/20 text-[#C41E2A] text-sm font-medium hover:bg-[#C41E2A]/20 transition-colors"
            >
              <RefreshCw size={13} /> Réessayer
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ScrollText size={32} className="text-gray-600" />
            <p className="text-gray-500 text-sm">Aucun log trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Niveau', 'Action', 'Utilisateur', 'Détails', 'IP', 'Date'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={log.id || i}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <LevelBadge level={log.level} />
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-white font-medium whitespace-nowrap">
                        {log.action || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm text-gray-300">
                          {log.users?.nom || <span className="text-gray-600">Système</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <p className="text-xs text-gray-400 truncate" title={log.details}>
                        {log.details || <span className="text-gray-600">—</span>}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono text-gray-500">
                        {log.ip_address || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {page} sur {totalPages} ({count.toLocaleString('fr-FR')} entrées)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {/* Pages visibles */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm transition-all ${
                    p === page
                      ? 'bg-[#C41E2A] text-white font-semibold'
                      : 'border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
