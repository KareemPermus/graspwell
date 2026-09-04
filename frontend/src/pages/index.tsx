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

  if (loading) return <div className="p-8 text-zinc-500">Loading…</div>;
  if (error || !data) return <div className="p-8 text-red-500">{error || 'Error'}</div>;

  const kpis = [
    { label: 'Total Contacts', value: data.total_contacts, icon: <FiUsers className="w-5 h-5 text-red-500" /> },
    { label: 'Total Tasks', value: data.total_tasks, icon: <FiCheckSquare className="w-5 h-5 text-red-500" /> },
    { label: 'Tasks Due Today', value: data.tasks_due_today, icon: <FiCalendar className="w-5 h-5 text-red-500" /> },
    { label: 'Recent Contacts', value: data.recent_contacts.length, icon: <FiArrowUpRight className="w-5 h-5 text-red-500" /> },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{k.label}</p>
              {k.icon}
            </div>
            <p className="text-2xl font-bold mt-2">{k.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="font-semibold">Recent Contacts</h2>
            <Link href="/contacts" className="text-sm text-red-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-zinc-400 text-left">
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Company</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_contacts.map(c => (
                <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-6 py-3 font-medium">{c.first_name} {c.last_name}</td>
                  <td className="px-6 py-3 text-zinc-600">{c.company || '—'}</td>
                </tr>
              ))}
              {data.recent_contacts.length === 0 && (
                <tr><td colSpan={2} className="px-6 py-4 text-zinc-400 text-center">No contacts yet</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Upcoming Tasks */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-sm text-red-600 hover:underline">All</Link>
          </div>
          <ul className="space-y-3 text-sm">
            {data.upcoming_tasks.map(t => (
              <li key={t.id} className="flex items-start gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-zinc-400">{t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'} · {t.status}</p>
                </div>
              </li>
            ))}
            {data.upcoming_tasks.length === 0 && (
              <li className="text-zinc-400">No upcoming tasks</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}