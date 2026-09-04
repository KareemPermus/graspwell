import React from 'react';
import { render, screen } from '@testing-library/react';
import KpiCard from '@/components/dashboard/KpiCard';
import { Users } from 'lucide-react';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value={42} icon={Users} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});