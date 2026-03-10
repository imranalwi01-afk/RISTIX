import { z, type ZodTypeAny } from 'zod';

const hasValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const isValidNumberInput = (value: unknown): boolean => {
  if (!hasValue(value)) return false;
  return !Number.isNaN(Number(value));
};

const hasSelectedValue = (value: unknown): boolean => {
  if (!hasValue(value)) return false;
  return Number(value) !== 0;
};

export const pdConfigurationSchema = z.object({
  model_name: z.unknown(),
  population_segment_id: z.unknown(),
  selected_method: z.unknown(),
  migration_interval: z.unknown().optional(),
  population_type: z.unknown().optional(),
  historical_month: z.unknown().optional(),
  first_historical_date: z.unknown().optional(),
  multiplication: z.unknown().optional(),
  fl_flag: z.boolean().optional(),
  fl_scalar_id: z.unknown().optional(),
  bucket: z.unknown(),
}).superRefine((data, ctx) => {
  if (!hasValue(data.model_name)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['model_name'], message: 'Model Name is required' });
  }

  if (!hasValue(data.population_segment_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['population_segment_id'], message: 'Population Segment is required' });
  }

  if (!hasValue(data.selected_method)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selected_method'], message: 'Method is required' });
  }

  if (!hasValue(data.bucket)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bucket'], message: 'Bucket Group is required' });
  }

  if (!hasValue(data.population_type)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['population_type'], message: 'Population Type is required' });
  }

  const isProxyMethod = String(data.selected_method ?? '') === '3';
  if (!isProxyMethod) {
    if (!isValidNumberInput(data.migration_interval)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['migration_interval'], message: 'Migration Interval is required' });
    }

    if (!isValidNumberInput(data.historical_month)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['historical_month'], message: 'Historical Month is required' });
    }

    if (!hasValue(data.first_historical_date)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['first_historical_date'], message: 'First Historical Date is required' });
    }

    if (!isValidNumberInput(data.multiplication)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['multiplication'], message: 'Multiplication is required' });
    }
  }

  if (Boolean(data.fl_flag) && !hasValue(data.fl_scalar_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fl_scalar_id'], message: 'FL Scalar is required when FL Flag is active' });
  }
});

export const lgdConfigurationSchema = z.object({
  model_name: z.unknown(),
  segment_id: z.unknown(),
  lgd_method: z.unknown(),
  population_type: z.unknown(),
  observation_period: z.unknown(),
  observation_start_date: z.unknown(),
  fl_flag: z.boolean().optional(),
  fl_scalar_id: z.unknown().optional(),
}).superRefine((data, ctx) => {
  if (!hasValue(data.model_name)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['model_name'], message: 'Model Name is required' });
  }

  if (!hasValue(data.segment_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['segment_id'], message: 'Population Segment is required' });
  }

  if (!hasValue(data.lgd_method)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lgd_method'], message: 'Method is required' });
  }

  if (!hasValue(data.population_type)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['population_type'], message: 'Population Type is required' });
  }

  if (!hasValue(data.observation_period)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['observation_period'], message: 'Observation Period is required' });
  }

  if (!hasValue(data.observation_start_date)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['observation_start_date'], message: 'Observation Start Date is required' });
  }

  if (Boolean(data.fl_flag) && !hasValue(data.fl_scalar_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fl_scalar_id'], message: 'FL Scalar is required when FL Flag is active' });
  }
});

export const eadConfigurationSchema = z.object({
  model_name: z.unknown(),
  segment_id: z.unknown(),
  ead_method: z.unknown(),
  calc_method: z.unknown(),
}).superRefine((data, ctx) => {
  if (!hasValue(data.model_name)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['model_name'], message: 'Model Name is required' });
  }

  if (!hasValue(data.segment_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['segment_id'], message: 'Population Segment is required' });
  }

  if (!hasValue(data.ead_method)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ead_method'], message: 'EAD Method is required' });
  }

  if (!hasValue(data.calc_method)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['calc_method'], message: 'Calc Method is required' });
  }
});

export const eclConfigurationSchema = z.object({
  ecl_model_name: z.unknown(),
  module: z.unknown(),
  effective_date: z.unknown(),
  details: z.array(z.unknown()).optional(),
}).superRefine((data, ctx) => {
  if (!hasValue(data.ecl_model_name)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ecl_model_name'], message: 'ECL Model Name is required' });
  }

  if (!hasValue(data.module)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['module'], message: 'Module is required' });
  }

  if (!hasValue(data.effective_date)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['effective_date'], message: 'Effective Date is required' });
  }

  if (!Array.isArray(data.details) || data.details.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['details'], message: 'At least one segment configuration is required' });
  }
});

export const eclDetailConfigurationSchema = z.object({
  pf_segment_id: z.unknown(),
  stage_rule_id: z.unknown(),
  pd_model_id: z.unknown(),
  lgd_model_id: z.unknown(),
  ead_model_id: z.unknown(),
}).superRefine((data, ctx) => {
  if (!hasSelectedValue(data.pf_segment_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pf_segment_id'], message: 'Segment is required' });
  }

  if (!hasSelectedValue(data.stage_rule_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stage_rule_id'], message: 'Stage Rule is required' });
  }

  if (!hasValue(data.pd_model_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pd_model_id'], message: 'PD Model is required' });
  }

  if (!hasValue(data.lgd_model_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lgd_model_id'], message: 'LGD Model is required' });
  }

  if (!hasValue(data.ead_model_id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ead_model_id'], message: 'EAD Model is required' });
  }
});

export const getZodFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!path || fieldErrors[path]) continue;
    fieldErrors[path] = issue.message;
  }

  return fieldErrors;
};

export const validateWithSchema = <TSchema extends ZodTypeAny>(schema: TSchema, value: unknown) => {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      success: true as const,
      data: result.data,
      errors: {} as Record<string, string>,
    };
  }

  return {
    success: false as const,
    errors: getZodFieldErrors(result.error),
  };
};
