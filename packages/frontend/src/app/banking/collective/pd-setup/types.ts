import { PDConfiguration } from '@/services/api/pd-configurations.api';

export interface PDConfigUI extends PDConfiguration {
  segment_name?: string;
  method_name?: string;
}
