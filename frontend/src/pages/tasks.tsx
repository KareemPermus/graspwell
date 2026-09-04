import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Task } from '@/types';
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiFlag, FiUser, FiTrash2, FiEdit2, FiX, FiCheckSquare } from 'react-icons/fi';

const priorityColor: Record<string, string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

const statusColor: Record<string, string> = {
  pending: 'bg-zinc-100 text-zinc-600',
  in_progress: 'bg-indigo-50 text-indigo-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

interface TaskRow {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  contact_id: number;
  contact_name: string;
  created_at: string;
}

interface ContactOption {
  id: number;
  first_name: string;
  last_name: string;
}

const emptyForm = { title: '', description: '', status: 'pending', priority: 'medium', due_date: '', contact_id: '' };

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/tasks');
      setTasks(data);
    } catch { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => {
    apiClient.get('/api/contacts').then(r => setContacts(r.data)).catch(() => {});
  }, []);

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.contact_name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = async (id: number) => {
    try {
      const { data } = await apiClient.get(`/api/tasks/${id}`);
      setForm({ title: data.title, description: data.description || '', status: data.status, priority: data.priority, due_date: data.due_date ? data.due_date.slice(0, 10) : '', contact_id: data.contact_id ? String(data.contact_id) : '' });
      setEditId(id);
      setModalOpen(true);
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { ...form, contact_id: form.contact_id ? Number(form.contact_id) : null, due_date: form.due_date || null };
    try {
      if (editId) await apiClient.put(`/api/tasks/${editId}`, body);
      else await apiClient.post('/api/tasks', body);
      setModalOpen(false);
      setLoading(true);
      fetchTasks();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try { await apiClient.delete(`/api/tasks/${id}`); setTasks(p => p.filter(t => t.id !== id)); } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-400">Loading tasks…</div>;
  if (error) return <div className="flex items-center justify-center py-20 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-zinc-500">{tasks.length} total tasks</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <FiPlus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-zinc-200">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-6 py-4 border-b border-zinc-100">
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-zinc-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-zinc-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-200">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-400 text-sm">No tasks found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400 text-left">
                <tr className="border-b border-zinc-100">
                  <th className="px-6 py-3 font-medium">Task</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Due Date</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer" onClick={() => openEdit(t.id)}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <FiCheckSquare className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <span className="font-medium">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[t.status] || 'bg-zinc-100 text-zinc-600'}`}>{t.status.replace('_', ' ')}</span></td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${priorityColor[t.priority] || 'bg-zinc-100 text-zinc-600'}`}>{t.priority}</span></td>
                    <td className="px-6 py-3 text-zinc-600">{t.due_date ? new Date(t.due_date).toLocaleDateString() : <span className="text-zinc-300">—</span>}</td>
                    <td className="px-6 py-3 text-zinc-600">{t.contact_name || <span className="text-zinc-300">—</span>}</td>
                    <td className="px-6 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(t.id)} className="p-1 text-zinc-400 hover:text-zinc-600"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1 text-zinc-400 hover:text-red-600 ml-1"><FiTrash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editId ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-600 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" />
              </div>
              <div>
                <label className="block text-zinc-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 mb-1">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Contact</label>
                  <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200">
                    <option value="">None</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}