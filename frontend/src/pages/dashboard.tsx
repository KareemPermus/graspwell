import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import Link from 'next/link';
import { FiUsers, FiCheckSquare, FiCalendar, FiArrowUpRight } from 'react-icons/fi';

interface DashboardData {
  total_contacts: number;
  total_tasks: number;
  tasks_due_today: number;
  recent_contacts: { id: number; first_name: string; last_name: string; company: string }[];
  upcoming_tasks: { id: number; title: string; status: string; due_date: string }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/api/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-500">Loading…</div>;
  if (error) return <div className="flex items-center justify-center py-20 text-red-500">{error}</div>;
  if (!data) return null;

  const kpis = [
    { label: 'Total Contacts', value: data.total_contacts, icon: <FiUsers className="w-5 h-5" />, color: 'text-red-500' },
    { label: 'Total Tasks', value: data.total_tasks, icon: <FiCheckSquare className="w-5 h-5" />, color: 'text-red-500' },
    { label: 'Tasks Due Today', value: data.tasks_due_today, icon: <FiCalendar className="w-5 h-5" />, color: 'text-red-500' },
  ];

  const statusColor: Record<string, string> = {
    todo: 'bg-zinc-100 text-zinc-600',
    in_progress: 'bg-amber-50 text-amber-600',
    done: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Overview of your CRM activity.</p>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{k.label}</p>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className="text-2xl font-bold mt-2">{k.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Recent Contacts</h2>
            <Link href="/contacts" className="text-sm text-red-600 hover:underline flex items-center gap-1">View all <FiArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-zinc-400 text-left">
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Company</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_contacts.length === 0 && (
                <tr><td colSpan={2} className="px-6 py-4 text-zinc-400 text-center">No contacts yet</td></tr>
              )}
              {data.recent_contacts.map(c => (
                <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-6 py-3 font-medium">{c.first_name} {c.last_name}</td>
                  <td className="px-6 py-3 text-zinc-600">{c.company || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Upcoming Tasks */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-sm text-red-600 hover:underline">All</Link>
          </div>
          <ul className="space-y-3 text-sm">
            {data.upcoming_tasks.length === 0 && <li className="text-zinc-400">No upcoming tasks</li>}
            {data.upcoming_tasks.map(t => (
              <li key={t.id} className="flex items-start gap-3">
                <FiCheckSquare className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[t.status] || 'bg-zinc-100 text-zinc-600'}`}>{t.status}</span>
                    {t.due_date && <span className="text-xs text-zinc-400">{new Date(t.due_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}