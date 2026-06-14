import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AccessFilters } from '../AccessFilters';
import type { RoleFilters } from '../access-management.types';

// Mock the Can component to always render children
vi.mock('@/components/rbac/Can', () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const defaultFilters: RoleFilters = {
  type: '',
  level: '',
  searchTerm: '',
};

describe('AccessFilters', () => {
  it('renders filter controls', () => {
    renderWithTheme(
      <AccessFilters
        filters={defaultFilters}
        loading={false}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
        onRefresh={vi.fn()}
        onCreateRole={vi.fn()}
      />,
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Add Role')).toBeInTheDocument();
    // MUI Select labels appear multiple times (label + rendered value); check they exist
    expect(screen.getAllByText('Type').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Level').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
  });

  it('calls onClearFilters when Clear is clicked', async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <AccessFilters
        filters={defaultFilters}
        loading={false}
        onFilterChange={vi.fn()}
        onClearFilters={onClearFilters}
        onRefresh={vi.fn()}
        onCreateRole={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Clear'));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('calls onRefresh when Refresh is clicked', async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <AccessFilters
        filters={defaultFilters}
        loading={false}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
        onRefresh={onRefresh}
        onCreateRole={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Refresh'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables Refresh button when loading', () => {
    renderWithTheme(
      <AccessFilters
        filters={defaultFilters}
        loading={true}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
        onRefresh={vi.fn()}
        onCreateRole={vi.fn()}
      />,
    );

    expect(screen.getByText('Refresh')).toBeDisabled();
  });

  it('calls onFilterChange when search input changes', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <AccessFilters
        filters={defaultFilters}
        loading={false}
        onFilterChange={onFilterChange}
        onClearFilters={vi.fn()}
        onRefresh={vi.fn()}
        onCreateRole={vi.fn()}
      />,
    );

    const searchInput = screen.getByLabelText('Search');
    await user.type(searchInput, 'admin');
    expect(onFilterChange).toHaveBeenCalledWith('searchTerm', expect.any(String));
  });
});
