import { describe, expect, test } from 'bun:test'
import { CreateBusinessSettingSchema, UpdateBusinessSettingSchema } from '../../routes/business-settings.routes'

describe('BusinessSettings schemas — input normalization', () => {
  test('CreateBusinessSettingSchema accepts snake_case and normalizes to camelCase with defaults', () => {
    const payload = {
      param_code: 'BIZ0123123',
      param_desc: 'asdasd',
      param_value: 'aaaa',
      param_category: 'B',
      param_type: 'B',
      is_editable: true,
      active_flag: true
    }

    const parsed = CreateBusinessSettingSchema.parse(payload)

    expect(parsed.paramCode).toBe('BIZ0123123')
    expect(parsed.paramName).toBe('asdasd')
    expect(parsed.paramUsage).toBe('')
    expect(parsed.paramType).toBe('B')
    expect(parsed.isActive).toBe(true)
    expect(parsed.requiresApproval).toBe(false)
  })

  test('CreateBusinessSettingSchema accepts camelCase', () => {
    const payload = {
      paramCode: 'C1',
      paramName: 'Camel Name',
      paramUsage: 'usage',
      paramType: 'B',
      bankingType: 'syariah',
      isActive: false,
      requiresApproval: true
    }

    const parsed = CreateBusinessSettingSchema.parse(payload)

    expect(parsed.paramCode).toBe('C1')
    expect(parsed.paramName).toBe('Camel Name')
    expect(parsed.paramUsage).toBe('usage')
    expect(parsed.paramType).toBe('B')
    expect(parsed.isActive).toBe(false)
    expect(parsed.requiresApproval).toBe(true)
  })

  test('UpdateBusinessSettingSchema returns only provided fields (accepts snake_case)', () => {
    const payload = { param_code: 'UP1', active_flag: false }
    const parsed = UpdateBusinessSettingSchema.parse(payload)
    expect(parsed).toEqual({ paramCode: 'UP1', isActive: false })
  })

  test('CreateBusinessSettingSchema rejects when required fields missing after normalization', () => {
    expect(() => CreateBusinessSettingSchema.parse({})).toThrow(/paramCode is required|paramName is required/)
  })
})
