import { useQuery } from '@tanstack/react-query';
import { bankingAPI } from '@/services/api';
import { lgdConfigurationsApi } from '@/services/api/lgd-configurations.api';

export function useLGDCombinedQuery() {
  return useQuery({
    queryKey: ['lgd', 'combined'],
    queryFn: async () => {
      const [configsRes, methodsRes, popTypesRes, segmentsRes, flScalarsRes] = await Promise.all([
        lgdConfigurationsApi.getAll(),
        lgdConfigurationsApi.getMethods(),
        lgdConfigurationsApi.getPopulationTypes(),
        bankingAPI.populationSegments.getAll({ active_flag: true, segment_type: 'LGD' }),
        bankingAPI.flScalar.getAll()
      ]);

      const toArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      };

      const methods = toArray(methodsRes);
      const popTypes = toArray(popTypesRes);
      const segments = toArray(segmentsRes);
      const flScalars = toArray(flScalarsRes);

      const lgdSegments = segments.filter((s: any) => String(s.segment_type || '').toUpperCase() === 'LGD');

      const configs = toArray(configsRes).map((config: any) => {
        const segment = lgdSegments.find((s: any) => String(s.id) === String(config.segment_id));
        const method = methods.find((m: any) => String(m.value) === String(config.lgd_method));
        const popType = popTypes.find((m: any) => String(m.value) === String(config.population_type));
        const scalar = flScalars.find((s: any) => String(s.pkid) === String(config.fl_scalar_id));
        return {
          ...config,
          segment_name: segment?.segment_name || String(config.segment_id || 'Unknown'),
          method_name: method?.label || String(config.lgd_method),
          population_type_name: popType?.label || String(config.population_type || ''),
          scalar_name: scalar?.scalar_name,
        };
      });

      return { configs, methods, popTypes, lgdSegments, flScalars };
    },
    staleTime: 15000,
  });
}
