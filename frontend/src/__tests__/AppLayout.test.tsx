import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppLayout from '@/components/layout/AppLayout';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>;
});

describe('AppLayout', () => {
  it('renders brand name and nav items', () => {
    render(<AppLayout><div>child</div></AppLayout>);
    expect(screen.getByText('Graspwell')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});