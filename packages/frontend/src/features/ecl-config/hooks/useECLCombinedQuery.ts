import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { bankingAPI } from '@/services/api';
import { eclConfigurationsApi } from '@/services/api/ecl-configurations.api';

const ECL_PORTFOLIO_SEGMENT_TYPE = 'PF';
const ECL_STAGE_RULE_TYPE = 'STAGE';

function getResponseRows(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function transformEclHeaders(data: any): any[] {
  const resultData = Array.isArray(data) ? data : (data as any).data || [];
  if (!Array.isArray(resultData)) return [];
  return resultData.map((item: any) => ({
    pkid: Number(item.id),
    ecl_model_name: item.model_name,
    module: String(item.module),
    module_name: String(item.module || ''),
    effective_date: item.effective_date,
    active_flag: item.active_flag ?? true,
    last_run_period: item.last_run_period,
    last_run_status: item.last_run_status,
    last_run_date: item.last_run_date,
    createdby: item.created_by,
    createddate: item.created_date,
    details: [],
  }));
}

export function useECLCombinedQuery(bankingMode: string) {
  return useQuery({
    queryKey: ['ecl', 'combined', bankingMode],
    queryFn: async () => {
      const [
        moduleResponse, periodTypeResponse, segmentResponse,
        ruleResponse, pdResponse, lgdResponse, eadResponse, rawHeaders,
      ] = await Promise.all([
        api.banking.businessSetup.getHeaderDetails('B0024'),
        api.banking.businessSetup.getHeaderDetails('B0025'),
        api.banking.populationSegments.getAll({ active_flag: true, segment_type: ECL_PORTFOLIO_SEGMENT_TYPE }),
        bankingAPI.ruleBaseSetting.getHeaders({ limit: 200, active_flag: true, rule_type: ECL_STAGE_RULE_TYPE }),
        api.banking.pdConfigurations.getAll({ is_active: true }),
        api.banking.lgdConfigurations.getAll({ is_active: true }),
        api.banking.eadConfigurations.getAll({ is_active: true }),
        eclConfigurationsApi.getAll(),
      ]);

      return {
        moduleResponse, periodTypeResponse, segmentResponse,
        ruleResponse, pdResponse, lgdResponse, eadResponse,
        headers: transformEclHeaders(rawHeaders),
      };
    },
    staleTime: 15000,
  });
}
