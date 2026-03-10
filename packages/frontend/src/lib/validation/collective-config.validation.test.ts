import { describe, expect, test } from 'bun:test';
import {
  eadConfigurationSchema,
  eclConfigurationSchema,
  eclDetailConfigurationSchema,
  lgdConfigurationSchema,
  pdConfigurationSchema,
  validateWithSchema,
} from './collective-config.validation';

describe('collective config validation', () => {
  test('PD validation requires non-proxy fields', () => {
    const result = validateWithSchema(pdConfigurationSchema, {
      model_name: 'PD Model',
      population_segment_id: 'SEG-1',
      selected_method: '1',
      bucket: 'BUCKET-1',
      population_type: 'MONTHLY',
      fl_flag: false,
    });

    expect(result.success).toBe(false);
    expect(result.errors.migration_interval).toBe('Migration Interval is required');
    expect(result.errors.historical_month).toBe('Historical Month is required');
    expect(result.errors.first_historical_date).toBe('First Historical Date is required');
    expect(result.errors.multiplication).toBe('Multiplication is required');
  });

  test('PD validation skips non-proxy fields for proxy method', () => {
    const result = validateWithSchema(pdConfigurationSchema, {
      model_name: 'PD Proxy',
      population_segment_id: 'SEG-1',
      selected_method: '3',
      bucket: 'BUCKET-1',
      population_type: 'MONTHLY',
      fl_flag: false,
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('LGD validation requires FL scalar when FL flag is active', () => {
    const result = validateWithSchema(lgdConfigurationSchema, {
      model_name: 'LGD Model',
      segment_id: 10,
      lgd_method: '1',
      population_type: 'MONTHLY',
      observation_period: '12',
      observation_start_date: '2026-01-01',
      fl_flag: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors.fl_scalar_id).toBe('FL Scalar is required when FL Flag is active');
  });

  test('EAD validation enforces required dropdowns', () => {
    const result = validateWithSchema(eadConfigurationSchema, {
      model_name: 'EAD Model',
      segment_id: undefined,
      ead_method: '',
      calc_method: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors.segment_id).toBe('Population Segment is required');
    expect(result.errors.ead_method).toBe('EAD Method is required');
    expect(result.errors.calc_method).toBe('Calc Method is required');
  });

  test('ECL header validation requires at least one segment configuration', () => {
    const result = validateWithSchema(eclConfigurationSchema, {
      ecl_model_name: 'ECL Model',
      module: 'TREASURY',
      effective_date: '2026-02-01',
      details: [],
    });

    expect(result.success).toBe(false);
    expect(result.errors.details).toBe('At least one segment configuration is required');
  });

  test('ECL detail validation requires model selections and stage rule', () => {
    const result = validateWithSchema(eclDetailConfigurationSchema, {
      pf_segment_id: 17,
      stage_rule_id: 0,
      pd_model_id: '',
      lgd_model_id: '',
      ead_model_id: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors.stage_rule_id).toBe('Stage Rule is required');
    expect(result.errors.pd_model_id).toBe('PD Model is required');
    expect(result.errors.lgd_model_id).toBe('LGD Model is required');
    expect(result.errors.ead_model_id).toBe('EAD Model is required');
  });
});
