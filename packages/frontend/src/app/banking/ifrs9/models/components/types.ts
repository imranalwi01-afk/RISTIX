'use client';

export type ModelRecord = Record<string, any>;

export interface ModelManagementTableProps {
  loading: boolean;
  rowsPerPage: number;
  paginatedData: ModelRecord[];
  modelType: string;
  totalCount: number;
  page: number;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onViewModel: (model: ModelRecord) => void;
  onEditModel: (model: ModelRecord) => void;
  onDeleteModel: (model: ModelRecord) => void;
}
