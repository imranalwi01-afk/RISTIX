// packages/frontend/src/app/banking/setup/application/components/types.ts
// ============================================================================
// Shared Types for Application Settings Components
// ============================================================================

// Legacy DataTables Response Structure
export interface ApplicationSettingDataTable {
    ID: number;
    CommonCode: string;
    Description: string;
    Value: string;
    ParamType: string;
    CreatedBy: string;
    CreatedDate: string;
    UpdatedBy?: string;
    UpdatedDate?: string;
    pkid?: number;
    param_code?: string;
    param_name?: string;
    param_usage?: string;
    param_type?: string;
    createdby?: string;
    createddate?: string;
}

// Legacy Detail DataTables Response Structure
export interface ApplicationSettingDetailDataTable {
    ID: number;
    SeqNo: number;
    Value1: string;
    Value2: string;
    Value3: string;
    Description: string;
    pkid?: number;
    param_code?: string;
    param_seq?: number;
    value1?: string;
    value2?: string;
    value3?: string;
    paramdesc?: string;
}

// Form Models
export interface ApplicationSettingFormData {
    ParamCode: string;
    ParamName: string;
    ParamUsage: string;
}

export interface DetailFormData {
    ParamCode: string;
    SeqNo: number;
    Value1: string;
    Value2: string;
    Value3: string;
    Description: string;
}
