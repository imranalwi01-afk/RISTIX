import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AccessStatCards } from '../AccessStatCards';
import type { Role } from '../access-management.types';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full access',
    type: 'SYSTEM',
    level: 'PLATFORM',
    isActive: true,
    isBuiltIn: true,
    permissions: [],
    assignedUsers: 5,
    createdBy: 'system',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'bank_manager',
    displayName: 'Bank Manager',
    description: 'Banking access',
    type: 'BANKING',
    level: 'TENANT',
    isActive: true,
    isBuiltIn: false,
    permissions: [],
    assignedUsers: 3,
    createdBy: 'admin',
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'analyst',
    displayName: 'Analyst',
    description: 'Custom role',
    type: 'CUSTOM',
    level: 'DEPARTMENT',
    isActive: false,
    isBuiltIn: false,
    permissions: [],
    assignedUsers: 10,
    createdBy: 'admin',
    createdAt: '2025-03-01T00:00:00Z',
  },
];

describe('AccessStatCards', () => {
  it('renders all 4 stat cards', () => {
    renderWithTheme(<AccessStatCards roles={mockRoles} />);

    expect(screen.getByText('Total Roles')).toBeInTheDocument();
    expect(screen.getByText('System Roles')).toBeInTheDocument();
    expect(screen.getByText('Banking Roles')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('displays correct values from props', () => {
    renderWithTheme(<AccessStatCards roles={mockRoles} />);

    // All values are rendered; use getAllByText for duplicates
    expect(screen.getByText('3')).toBeInTheDocument(); // Total Roles
    expect(screen.getAllByText('1')).toHaveLength(2);   // System Roles + Banking Roles
    expect(screen.getByText('18')).toBeInTheDocument(); // Total Users
  });

  it('handles empty roles array', () => {
    renderWithTheme(<AccessStatCards roles={[]} />);

    // All values should be 0
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });
});
