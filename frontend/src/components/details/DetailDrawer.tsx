import React from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function DetailDrawer({ open, onClose, title, subtitle, children }: DetailDrawerProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[560px] lg:w-[680px] max-w-[100vw] bg-white z-50 flex flex-col shadow-xl">
        <div className="sticky top-0 z-10 p-6 text-white" style={{ background: 'var(--gradient-header-primary)' }}>
          <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}