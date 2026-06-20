import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  Filter,
  X,
} from 'lucide-react';
import api from '../../lib/axios';

// ─── Badge rôle ────────────────────────────────────────────────────────────
const ROLE_STYLES = {
  ADMIN: 'bg-[#C41E2A]/15 text-[#C41E2A] border border-[#C41E2A]/20',
  ENSEIGNANT: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  ETUDIANT: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

function RoleBadge({ role }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${ROLE_STYLES[role] || 'bg-gray-500/10 text-gray-400'}`}>
      {role}
    </span>
  );
}

// ─── Modal confirmation ─────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1a1d27] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#C41E2A] hover:bg-[#a31824] text-white'
            }`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ligne utilisateur ──────────────────────────────────────────────────────
function UserRow({ user, onBlock, onDelete }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E2A]/40 to-[#8B0000]/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.nom?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.nom}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-5 py-3.5 text-sm text-gray-400">
        {user.filieres?.nom || <span className="text-gray-600">—</span>}
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            user.is_active
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {user.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
          {user.is_active ? 'Actif' : 'Bloqué'}
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-400">
        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onBlock(user)}
            title={user.is_active ? 'Bloquer' : 'Débloquer'}
            className={`p-1.5 rounded-lg transition-colors ${
              user.is_active
                ? 'text-yellow-500 hover:bg-yellow-500/10'
                : 'text-emerald-500 hover:bg-emerald-500/10'
            }`}
          >
            {user.is_active ? <ShieldOff size={15} /> : <Shield size={15} />}
          </button>
          <button
            onClick={() => onDelete(user)}
            title="Supprimer"
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      const d = res.data.data;
      setUsers(d.data || []);
      setCount(d.count || 0);
      setTotalPages(d.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlockConfirm = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    const { user } = confirmModal;
    try {
      await api.patch(`/admin/users/${user.id}/block`, { block: user.is_active });
      showToast(user.is_active ? `${user.nom} bloqué` : `${user.nom} débloqué`);
      fetchUsers();
    } catch {
      showToast('Action échouée', 'error');
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    const { user } = confirmModal;
    try {
      await api.delete(`/admin/users/${user.id}`);
      showToast(`${user.nom} supprimé`);
      fetchUsers();
    } catch {
      showToast('Suppression échouée', 'error');
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-900/80 border-red-500/30 text-red-200'
              : 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Modal confirmation */}
      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        danger={confirmModal?.danger}
        onCancel={() => setConfirmModal(null)}
        onConfirm={confirmModal?.type === 'delete' ? handleDeleteConfirm : handleBlockConfirm}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-[#C41E2A]" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {count.toLocaleString('fr-FR')} utilisateur{count !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setPage(1);
              }
            }}
            placeholder="Rechercher par nom…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C41E2A]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="pl-8 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C41E2A]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a1d27]">Tous les rôles</option>
            <option value="ETUDIANT" className="bg-[#1a1d27]">Étudiants</option>
            <option value="ENSEIGNANT" className="bg-[#1a1d27]">Enseignants</option>
            <option value="ADMIN" className="bg-[#1a1d27]">Admins</option>
          </select>
        </div>
        {(search || roleFilter) && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setRoleFilter(''); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <X size={13} /> Effacer
          </button>
        )}
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
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={32} className="text-gray-600" />
            <p className="text-gray-500 text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Utilisateur', 'Rôle', 'Filière', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onBlock={user =>
                      setConfirmModal({
                        type: 'block',
                        user,
                        title: user.is_active ? 'Bloquer l\'utilisateur ?' : 'Débloquer l\'utilisateur ?',
                        message: user.is_active
                          ? `${user.nom} ne pourra plus se connecter.`
                          : `${user.nom} pourra à nouveau se connecter.`,
                        danger: user.is_active,
                      })
                    }
                    onDelete={user =>
                      setConfirmModal({
                        type: 'delete',
                        user,
                        title: 'Supprimer l\'utilisateur ?',
                        message: `Cette action est irréversible. Le compte de ${user.nom} sera définitivement supprimé.`,
                        danger: true,
                      })
                    }
                  />
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
            Page {page} sur {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-white/5 text-sm text-white font-medium">
              {page}
            </span>
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
