import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Contact } from '@/types';
import { FiSearch, FiPlus, FiX, FiPhone, FiMail, FiBriefcase } from 'react-icons/fi';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', company: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/contacts');
      setContacts(res.data);
    } catch {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return `${c.first_name} ${c.last_name} ${c.email || ''} ${c.company || ''}`.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setForm({ first_name: '', last_name: '', email: '', phone: '', company: '', notes: '' });
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    try {
      await apiClient.post('/api/contacts', form);
      setShowModal(false);
      fetchContacts();
    } catch { setError('Failed to create contact'); }
    finally { setSaving(false); }
  };

  const openDrawer = async (id: number) => {
    try {
      const res = await apiClient.get(`/api/contacts/${id}`);
      setSelectedContact(res.data);
      setDrawerOpen(true);
    } catch { setError('Failed to load contact'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/contacts/${id}`);
      setDrawerOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } catch { setError('Failed to delete contact'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Contacts</h1>
          <p className="text-sm text-zinc-500">{contacts.length} total contacts</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <FiPlus className="w-4 h-4" /> New Contact
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      {/* Table card */}
      <div className="bg-white rounded-xl border border-zinc-200">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
              className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-zinc-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-400 text-sm">No contacts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400 text-left">
                <tr className="border-b border-zinc-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">Phone</th>
                  <th className="px-6 py-3 font-medium hidden lg:table-cell">Company</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => openDrawer(c.id)} className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold shrink-0">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{c.first_name} {c.last_name}</p>
                          <p className="text-xs text-zinc-400 sm:hidden">{c.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-zinc-600 hidden sm:table-cell">{c.email || '—'}</td>
                    <td className="px-6 py-3 text-zinc-600 hidden md:table-cell">{c.phone || '—'}</td>
                    <td className="px-6 py-3 text-zinc-600 hidden lg:table-cell">{c.company || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawerOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-[560px] bg-white h-full shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Gradient header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
              <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white"><FiX className="w-5 h-5" /></button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                  {selectedContact.first_name[0]}{selectedContact.last_name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedContact.first_name} {selectedContact.last_name}</h2>
                  <p className="text-sm text-white/80">{selectedContact.company || 'No company'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                {selectedContact.email && (
                  <div className="flex items-center gap-3 text-sm"><FiMail className="w-4 h-4 text-zinc-400" /><span>{selectedContact.email}</span></div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-3 text-sm"><FiPhone className="w-4 h-4 text-zinc-400" /><span>{selectedContact.phone}</span></div>
                )}
                {selectedContact.company && (
                  <div className="flex items-center gap-3 text-sm"><FiBriefcase className="w-4 h-4 text-zinc-400" /><span>{selectedContact.company}</span></div>
                )}
              </div>
              {selectedContact.notes && (
                <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-sm text-zinc-600">{selectedContact.notes}</div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleDelete(selectedContact.id)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">New Contact</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-zinc-600 mb-1">First name *</label>
                  <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
                <div><label className="block text-zinc-600 mb-1">Last name *</label>
                  <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              </div>
              <div><label className="block text-zinc-600 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              <div><label className="block text-zinc-600 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              <div><label className="block text-zinc-600 mb-1">Company</label>
                <input value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              <div><label className="block text-zinc-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Creating…' : 'Create Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}