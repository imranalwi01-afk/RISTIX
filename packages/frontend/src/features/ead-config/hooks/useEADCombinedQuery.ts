import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { bankingAPI } from '@/services/api';
import { eadConfigurationsApi } from '@/services/api/ead-configurations.api';

export function useEADCombinedQuery() {
  return useQuery({
    queryKey: ['ead', 'combined'],
    queryFn: async () => {
      const [configsRes, methodsRes, calcMethodsRes, segmentsRes] = await Promise.all([
        eadConfigurationsApi.getAll(),
        eadConfigurationsApi.getMethods(),
        eadConfigurationsApi.getCalcMethods(),
        bankingAPI.populationSegments.getAll({ active_flag: true, segment_type: 'EAD' })
      ]);

      const toArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      };

      const methods = toArray(methodsRes);
      const calcMethods = toArray(calcMethodsRes);
      const segments = toArray(segmentsRes);
      const eadSegments = segments.filter((s: any) => String(s.segment_type || '').toUpperCase() === 'EAD');

      const configs = toArray(configsRes).map((config: any) => {
        const segment = eadSegments.find((s: any) => String(s.id) === String(config.segment_id));
        return { ...config, segment_name: segment?.segment_name || String(config.segment_id || 'Unknown') };
      });

      return { configs, methods, calcMethods, eadSegments };
    },
    staleTime: 15000,
  });
}
