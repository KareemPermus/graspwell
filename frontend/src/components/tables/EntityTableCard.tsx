import React from 'react';

interface EntityTableCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

export default function EntityTableCard({ title, children, action, searchValue, onSearch }: EntityTableCardProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-zinc-100 gap-3">
        <h2 className="font-semibold">{title}</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onSearch && (
            <input
              type="text"
              placeholder="Search…"
              value={searchValue || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200 w-full sm:w-48"
            />
          )}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}