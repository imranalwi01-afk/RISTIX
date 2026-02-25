[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Variable: STAKEHOLDER\_PERMISSIONS

> `const` **STAKEHOLDER\_PERMISSIONS**: `object`

Defined in: [utils/permissions.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/permissions.ts#L34)

## Type Declaration

### bank\_admin

> `readonly` **bank\_admin**: readonly \[`"tenant:manage:users"`, `"tenant:manage:ifrs9"`, `"tenant:view:reports"`, `"tenant:manage:consultants"`, `"tenant:view:portfolio"`, `"tenant:calculate:ecl"`, `"tenant:manage:accounts"`\]

### bank\_user

> `readonly` **bank\_user**: readonly \[`"tenant:view:portfolio"`, `"tenant:calculate:ecl"`, `"tenant:manage:accounts"`\]

### consultant

> `readonly` **consultant**: readonly \[`"consultant:access:projects"`, `"consultant:perform:validation"`, `"consultant:submit:deliverables"`, `"consultant:access:tenant_data"`\]

### platform\_admin

> `readonly` **platform\_admin**: readonly \[`"platform:manage:all"`, `"platform:view:all_tenants"`, `"platform:manage:users"`, `"platform:manage:institutions"`, `"platform:manage:consultants"`\]

### regulator

> `readonly` **regulator**: readonly \[`"regulator:view:all_banks"`, `"regulator:audit:compliance"`, `"regulator:view:consultant_work"`, `"tenant:view:reports"`, `"tenant:view:portfolio"`\]
