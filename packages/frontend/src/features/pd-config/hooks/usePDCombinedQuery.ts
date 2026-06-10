import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { bankingAPI } from '@/services/api';
import { pdConfigurationsApi } from '@/services/api/pd-configurations.api';

export function usePDCombinedQuery() {
  return useQuery({
    queryKey: ['pd', 'combined'],
    queryFn: async () => {
      const [configsRes, methodsRes, popTypesRes, bucketsRes, segmentsRes, flScalarsRes] = await Promise.all([
        pdConfigurationsApi.getAll(),
        pdConfigurationsApi.getMethods(),
        pdConfigurationsApi.getPopulationTypes(),
        bankingAPI.bucketParameter.getHeaders(),
        bankingAPI.populationSegments.getAll({ active_flag: true, segment_type: 'PD' }),
        bankingAPI.flScalar.getAll()
      ]);

      const toArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      };

      const methods = toArray(methodsRes);
      const popTypes = toArray(popTypesRes);
      const buckets = toArray(bucketsRes);
      const segments = toArray(segmentsRes);
      const flScalars = toArray(flScalarsRes);
      const pdSegments = segments.filter((s: any) => String(s.segment_type || '').toUpperCase() === 'PD');

      const configs = toArray(configsRes).map((config: any) => {
        const segment = pdSegments.find((s: any) => String(s.id) === String(config.population_segment_id));
        const method = methods.find((m: any) => String(m.value) === String(config.selected_method));
        return {
          ...config,
          segment_name: segment?.segment_name || config.population_segment_desc || 'Unknown',
          method_name: method?.label || String(config.selected_method),
        };
      });

      return { configs, methods, popTypes, buckets, pdSegments, flScalars };
    },
    staleTime: 15000,
  });
}
