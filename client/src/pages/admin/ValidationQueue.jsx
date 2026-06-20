import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  FileText,
  User,
  Calendar,
  BookOpen,
  Eye,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/axios';

// ─── Badge statut ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    EN_ATTENTE: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    PUBLIE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    REJETE: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };
  const labels = { EN_ATTENTE: 'En attente', PUBLIE: 'Publié', REJETE: 'Rejeté' };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${styles[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Modal de confirmation ─────────────────────────────────────────────────
function ConfirmModal({ open, title, message, onConfirm, onCancel, danger, loading }) {
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
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Carte de sujet en attente ─────────────────────────────────────────────
function SubjectCard({ subject, onValidate, onReject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#C41E2A]/10 border border-[#C41E2A]/20 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={18} className="text-[#C41E2A]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                {subject.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <User size={10} />
                  {subject.users?.nom || 'Inconnu'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <BookOpen size={10} />
                  {subject.filieres?.nom || subject.filiere_id || '—'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Calendar size={10} />
                  {subject.annee}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={subject.status} />
            <span className="text-[10px] text-gray-500">
              {new Date(subject.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Description */}
        {subject.description && (
          <p className="mt-3 text-xs text-gray-400 line-clamp-2 pl-13">{subject.description}</p>
        )}

        {/* AI Scan Info */}
        {subject.ai_scan_report && (
          <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/5 p-3">
            <p className="text-[11px] font-semibold text-gray-300 mb-2">📊 Rapport IA</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {subject.ai_scan_report.score_coherence !== undefined && (
                <span>
                  Cohérence :{' '}
                  <strong
                    className={
                      subject.ai_scan_report.score_coherence >= 70
                        ? 'text-emerald-400'
                        : subject.ai_scan_report.score_coherence >= 40
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }
                  >
                    {subject.ai_scan_report.score_coherence}%
                  </strong>
                </span>
              )}
              {subject.ai_scan_report.is_duplicate !== undefined && (
                <span>
                  Doublon :{' '}
                  <strong className={subject.ai_scan_report.is_duplicate ? 'text-red-400' : 'text-emerald-400'}>
                    {subject.ai_scan_report.is_duplicate ? 'Oui' : 'Non'}
                  </strong>
                </span>
              )}
            </div>
            {subject.ai_scan_report.comment && (
              <p className="mt-1.5 text-[11px] text-gray-500 italic">
                "{subject.ai_scan_report.comment}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center gap-2">
        <button
          onClick={() => onValidate(subject)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
        >
          <CheckCircle2 size={14} />
          Valider
        </button>
        <button
          onClick={() => onReject(subject)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
        >
          <XCircle size={14} />
          Rejeter
        </button>
        {subject.file_url && (
          <a
            href={subject.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all"
          >
            <ExternalLink size={13} />
            PDF
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function ValidationQueue() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/subjects-validation');
      setSubjects(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement de la queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleAction = async (status) => {
    if (!confirmModal) return;
    setActionLoading(true);
    const { subject } = confirmModal;
    try {
      await api.patch(`/admin/subjects/${subject.id}/status`, { status });
      showToast(
        status === 'PUBLIE'
          ? `“${subject.title}” validé et publié !`
          : `“${subject.title}” rejeté.`,
        status === 'PUBLIE' ? 'success' : 'error'
      );
      fetchPending();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action échouée', 'error');
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

      {/* Modal */}
      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        danger={confirmModal?.danger}
        loading={actionLoading}
        onCancel={() => !actionLoading && setConfirmModal(null)}
        onConfirm={() => handleAction(confirmModal?.action)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={22} className="text-[#C41E2A]" />
            Queue de validation
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {subjects.length} sujet{subjects.length !== 1 ? 's' : ''} en attente de validation
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#C41E2A] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Chargement des sujets…</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-white font-semibold">Erreur de chargement</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={fetchPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C41E2A]/10 border border-[#C41E2A]/20 text-[#C41E2A] hover:bg-[#C41E2A]/20 text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} /> Réessayer
          </button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <p className="text-white font-semibold">Queue vide</p>
          <p className="text-gray-400 text-sm">Tous les sujets ont été traités.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onValidate={s =>
                setConfirmModal({
                  subject: s,
                  action: 'PUBLIE',
                  title: 'Valider ce sujet ?',
                  message: `"${s.title}" sera publié et visible par tous les étudiants.`,
                  danger: false,
                })
              }
              onReject={s =>
                setConfirmModal({
                  subject: s,
                  action: 'REJETE',
                  title: 'Rejeter ce sujet ?',
                  message: `"${s.title}" sera marqué comme rejeté et retiré de la file.`,
                  danger: true,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
