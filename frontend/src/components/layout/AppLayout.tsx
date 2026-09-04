import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, CheckSquare, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/' || router.pathname === '/dashboard';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 text-zinc-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static z-50 h-screen w-60 flex flex-col bg-white border-r border-zinc-200
        transform transition-transform lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-5 py-5 flex items-center gap-2 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
            G
          </div>
          <span className="font-bold text-lg tracking-tight">Graspwell</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-red-50 text-red-700 font-medium'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">ME</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Maya Ellison</p>
              <p className="text-xs text-zinc-400 truncate">Sales Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Graspwell CRM</h1>
              <p className="text-sm text-zinc-500 hidden sm:block">Manage contacts, tasks & activities</p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}