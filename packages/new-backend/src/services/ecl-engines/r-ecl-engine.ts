
import { IEclEngine, EclCalculationRequest } from './types';
import { env } from '../../config/env';

export class REclEngine implements IEclEngine {
    async calculate(request: EclCalculationRequest) {
        try {
            console.log(`📡 [REclEngine] Calling R Analytics Service for date: ${request.processDate}...`);

            const response = await fetch(`${env.R_SERVICE_URL}/api/ecl/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenant_id: request.tenantId,
                    calculation_date: request.processDate,
                    parameters: {
                        pd_method: request.parameters.pdMethod,
                        lgd_method: request.parameters.lgdMethod,
                        ead_method: request.parameters.eadMethod
                    }
                })
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: `R Service responded with ${response.status}: ${response.statusText}`
                };
            }

            const data: any = await response.json();
            return data;
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to connect to R Analytics Service'
            };
        }
    }
}
