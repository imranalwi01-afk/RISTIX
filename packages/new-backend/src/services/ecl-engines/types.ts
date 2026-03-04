
export interface EclCalculationParams {
    pdMethod: string;
    lgdMethod: string;
    eadMethod: string;
}

export interface EclCalculationRequest {
    tenantId: string;
    processDate: string;
    parameters: EclCalculationParams;
}

export interface EclResult {
    total_ecl: number;
    stage_3_ecl: number;
    // We can add more fields as needed later
}

export interface IEclEngine {
    calculate(request: EclCalculationRequest): Promise<{
        success: boolean;
        data?: {
            result: EclResult;
        };
        error?: string;
    }>;
}
