export type EnterprisePaginationMode = 'client' | 'offset' | 'cursor';
export type EnterpriseSortDirection = 'asc' | 'desc';
export type EnterpriseDensity = 'compact' | 'standard' | 'comfortable' | 'dense';

export type EnterpriseSort = {
  field: string;
  direction: EnterpriseSortDirection;
};

export type EnterpriseFilterType = 'text' | 'date' | 'number' | 'enum' | 'boolean';
export type EnterpriseFilterOperator = 'contains' | 'equals' | 'from' | 'to' | 'min' | 'max';

export type EnterpriseFilterOption = {
  label: string;
  value: string | number | boolean;
};

export type EnterpriseFilterDefinition = {
  field: string;
  label?: string;
  type: EnterpriseFilterType;
  operators?: EnterpriseFilterOperator[];
  options?: EnterpriseFilterOption[];
};

export type EnterpriseColumnFilterValue =
  | string
  | number
  | boolean
  | string[]
  | { from?: string; to?: string; min?: number | string; max?: number | string; value?: string | number | boolean };

export type EnterprisePaginationModel = {
  page: number;
  pageSize: number;
};

export type EnterpriseTableQueryState = {
  paginationMode: EnterprisePaginationMode;
  paginationModel: EnterprisePaginationModel;
  cursor?: string | null;
  previousCursor?: string | null;
  nextCursor?: string | null;
  search?: string;
  columnFilters: Record<string, EnterpriseColumnFilterValue>;
  sort: EnterpriseSort[];
  columnVisibilityModel: Record<string, boolean>;
  density: EnterpriseDensity;
};

export type EnterpriseTableQueryParams = {
  page?: number;
  offset?: number;
  limit: number;
  cursor?: string;
  search?: string;
  filters?: string;
  sort?: string;
  paginationMode: 'client' | 'offset' | 'cursor';
};

export type EnterpriseListResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    mode: 'offset' | 'cursor';
    limit: number;
    total?: number;
    page?: number;
    offset?: number;
    totalPages?: number;
    nextCursor?: string | null;
    previousCursor?: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  appliedQuery: {
    search?: string;
    filters: Record<string, unknown>;
    sort: EnterpriseSort[];
  };
  filterDefinitions?: Record<string, EnterpriseFilterDefinition>;
};

export type EnterpriseExportScope = 'current-page' | 'filtered-view' | 'all-matching';

export type EnterpriseExportParams = EnterpriseTableQueryParams & {
  exportScope: EnterpriseExportScope;
};

export type EnterpriseSavedTableView = {
  id?: string;
  scope: string;
  viewKey: string;
  name?: string | null;
  isDefault?: boolean;
  state: Partial<EnterpriseTableQueryState> & {
    pageSize?: number;
    columns?: Record<string, boolean>;
    filters?: Record<string, EnterpriseColumnFilterValue>;
  };
};
