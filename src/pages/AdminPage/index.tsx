import { useState, useEffect, useCallback } from 'react';
import { nfcService } from '@/features/nfc/services/nfc.service';
import type { NfcTag } from '@/shared/types';

type ModalMode = 'create' | 'edit' | null;

interface FormState {
  nfc_code: string;
  owner: string;
  enable: boolean;
}

const EMPTY_FORM: FormState = { nfc_code: '', owner: '', enable: true };

export default function AdminPage() {
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingTag, setEditingTag] = useState<NfcTag | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NfcTag | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch] = useState('');

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nfcService.list();
      setTags(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar tarjetas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  const filtered = tags.filter(t =>
    t.nfc_code.toLowerCase().includes(search.toLowerCase()) ||
    t.owner.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingTag(null);
    setModalMode('create');
  };

  const openEdit = (tag: NfcTag) => {
    setForm({ nfc_code: tag.nfc_code, owner: tag.owner, enable: tag.enable });
    setEditingTag(tag);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingTag(null);
  };

  const handleSave = async () => {
    if (!form.nfc_code.trim() || !form.owner.trim()) return;
    setSaving(true);
    try {
      if (modalMode === 'create') {
        const created = await nfcService.create(form);
        setTags(prev => [created, ...prev]);
        showFeedback('success', 'Tarjeta creada correctamente');
      } else if (modalMode === 'edit' && editingTag) {
        const updated = await nfcService.update(editingTag.id, {
          owner: form.owner,
          enable: form.enable,
        });
        setTags(prev => prev.map(t => t.id === updated.id ? updated : t));
        showFeedback('success', 'Tarjeta actualizada correctamente');
      }
      closeModal();
    } catch (e) {
      showFeedback('error', e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await nfcService.remove(deleteTarget.id);
      setTags(prev => prev.filter(t => t.id !== deleteTarget.id));
      showFeedback('success', `Tarjeta "${deleteTarget.nfc_code}" eliminada`);
      setDeleteTarget(null);
    } catch (e) {
      showFeedback('error', e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tarjetas NFC</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? '...' : `${tags.length} tarjeta${tags.length !== 1 ? 's' : ''} registrada${tags.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-blue-dark transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva tarjeta
        </button>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-sm ${
          feedback.type === 'success'
            ? 'bg-brand-green-pale text-brand-green-dark border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {feedback.msg}
        </div>
      )}

      {/* Search */}
      {!loading && !error && tags.length > 0 && (
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por código o propietario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Cargando tarjetas...
        </div>
      ) : error ? (
        <div className="text-center py-24 bg-white rounded-xl border border-gray-100">
          <svg className="w-10 h-10 text-red-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 font-medium mb-1">{error}</p>
          <button onClick={loadTags} className="text-brand-blue hover:underline text-sm mt-2">
            Reintentar
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wide text-xs">ID</th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wide text-xs">Código NFC</th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wide text-xs">Propietario</th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wide text-xs">Estado</th>
                <th className="text-right px-6 py-3.5 font-semibold text-gray-500 uppercase tracking-wide text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    {search ? 'Sin resultados para esa búsqueda' : 'No hay tarjetas registradas'}
                  </td>
                </tr>
              ) : filtered.map(tag => (
                <tr key={tag.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{tag.id}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {tag.nfc_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{tag.owner}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      tag.enable
                        ? 'bg-brand-green-pale text-brand-green-dark'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tag.enable ? 'bg-brand-green' : 'bg-gray-400'}`} />
                      {tag.enable ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(tag)}
                      className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-blue-dark font-medium mr-5 transition-colors text-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tag)}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition-colors text-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === 'create' ? 'Nueva tarjeta NFC' : 'Editar tarjeta'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Código NFC
                </label>
                <input
                  type="text"
                  value={form.nfc_code}
                  onChange={e => setForm(f => ({ ...f, nfc_code: e.target.value.toUpperCase() }))}
                  disabled={modalMode === 'edit'}
                  placeholder="Ej: ABC123"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
                />
                {modalMode === 'edit' && (
                  <p className="text-xs text-gray-400 mt-1">El código no puede modificarse una vez creado</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Propietario
                </label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, enable: !f.enable }))}
                  className="flex items-center gap-3 group"
                >
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    form.enable ? 'bg-brand-green' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      form.enable ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${form.enable ? 'text-brand-green-dark' : 'text-gray-500'}`}>
                    {form.enable ? 'Activa' : 'Inactiva'}
                  </span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nfc_code.trim() || !form.owner.trim()}
                className="px-6 py-2 rounded-lg text-sm font-semibold bg-brand-blue text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">¿Eliminar tarjeta?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Se eliminará <span className="font-mono font-semibold text-gray-700">{deleteTarget.nfc_code}</span> ({deleteTarget.owner}).
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
