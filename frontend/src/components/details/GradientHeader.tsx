import React from 'react';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function GradientHeader({ title, subtitle, children }: GradientHeaderProps) {
  return (
    <div className="rounded-xl p-6 text-white mb-6" style={{ background: 'var(--gradient-header-primary)' }}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}