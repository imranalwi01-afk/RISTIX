export interface FLScalarHeader {
  pkid: number;
  scalar_name: string;
  active_flag: boolean;
  created_by: string;
  created_date: string;
  created_host: string;
  updated_by?: string;
  updated_date?: string;
  updated_host?: string;
}

export interface FLScalarDetail {
  pkid: number;
  scalar_id: number;
  period: number;
  weighted_scalar: number;
  created_by: string;
  created_date: string;
  created_host: string;
  updated_by?: string;
  updated_date?: string;
  updated_host?: string;
}

export interface FLScalarWithDetails extends FLScalarHeader {
  details: FLScalarDetail[];
}

export interface DialogState {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  data: Partial<FLScalarWithDetails>;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
