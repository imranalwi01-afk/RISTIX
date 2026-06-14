import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AccessRoleTable } from '../AccessRoleTable';
import type { Role } from '../access-management.types';

// Mock SafeDataGrid to avoid complex DataGrid setup
vi.mock('@/components/shared/SafeDataGrid', () => ({
  SafeDataGrid: ({ rows, loading }: { rows: Role[]; loading: boolean }) => (
    <div data-testid="safe-data-grid">
      {loading && <div role="progressbar">Loading...</div>}
      {rows.map((row: Role) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {row.displayName}
        </div>
      ))}
    </div>
  ),
  SafeGridActionsCellItem: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button aria-label={label} onClick={onClick}>{label}</button>
  ),
}));

// Mock getRoleResponsibility
vi.mock('@/components/roles/role-responsibility.utils', () => ({
  getRoleResponsibility: () => ({ label: 'Standard', color: 'default', scope: 'General' }),
}));

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
];

const defaultProps = {
  roles: mockRoles,
  loading: false,
  canViewRoles: true,
  canManageRoles: true,
  onViewRole: vi.fn(),
  onEditRole: vi.fn(),
  onManagePermissions: vi.fn(),
  onToggleRole: vi.fn(),
};

describe('AccessRoleTable', () => {
  it('renders the data grid with roles', () => {
    renderWithTheme(<AccessRoleTable {...defaultProps} />);

    expect(screen.getByTestId('safe-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithTheme(<AccessRoleTable {...defaultProps} roles={[]} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays role count in header', () => {
    renderWithTheme(<AccessRoleTable {...defaultProps} />);

    expect(screen.getByText('Roles (1)')).toBeInTheDocument();
  });

  it('displays multiple roles count', () => {
    const twoRoles = [
      ...mockRoles,
      {
        ...mockRoles[0],
        id: '2',
        name: 'viewer',
        displayName: 'Viewer',
      },
    ];
    renderWithTheme(<AccessRoleTable {...defaultProps} roles={twoRoles} />);

    expect(screen.getByText('Roles (2)')).toBeInTheDocument();
  });
});
