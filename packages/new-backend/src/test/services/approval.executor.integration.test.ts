import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'
import { fileURLToPath } from 'node:url'

type UserRow = { id: string; tenantId: string; fullName?: string; isActive?: boolean }
type RoleRow = { id: string; tenantId: string; roleCode?: string; roleName?: string }
type RoleAssignmentRow = { userId: string; roleId: string; tenantId: string }
type ParameterHeaderRow = { paramCode: string; paramName?: string; paramType?: string; updatedby?: string; createdby?: string }
type ParameterDetailRow = { pkid: number; paramCode: string; paramSeq?: number; value1?: string; value2?: string; value3?: string; paramdesc?: string }
type GenericNumericRow = Record<string, any> & { id?: number }

const approvalRepositoryPath = '@/repositories/approval.repository'
const rbacRepositoryPath = '@/repositories/rbac.repository'
const configDatabaseAliasPath = '@/config/database'
const approvalHelpersPath = '@/lib/approval-helpers'
const notificationSocketPath = '@/socket/notification.socket'
const notificationRepositoryPath = '@/repositories/notification.repository'
const notificationsServicePath = '@/services/notifications.service'
const dbSchemaAliasPath = '@/db/schema'
const configIndexPath = fileURLToPath(new URL('../../config/index.ts', import.meta.url))
const dbSchemaIndexPath = fileURLToPath(new URL('../../db/schema/index.ts', import.meta.url))
const usersServicePath = fileURLToPath(new URL('../../services/users.service.ts', import.meta.url))
const rbacServicePath = fileURLToPath(new URL('../../services/rbac.service.ts', import.meta.url))
const parametersServicePath = fileURLToPath(new URL('../../services/parameters.service.ts', import.meta.url))
const pdConfigurationsServicePath = fileURLToPath(new URL('../../services/pd-configurations.service.ts', import.meta.url))
const lgdConfigurationsServicePath = fileURLToPath(new URL('../../services/lgd-configurations.service.ts', import.meta.url))
const eclConfigurationsServicePath = fileURLToPath(new URL('../../services/ecl-configurations.service.ts', import.meta.url))
const bucketParametersServicePath = fileURLToPath(new URL('../../services/bucket-parameters.service.ts', import.meta.url))
const ruleBaseSettingsServicePath = fileURLToPath(new URL('../../services/rule-base-settings.service.ts', import.meta.url))
const productParametersServicePath = fileURLToPath(new URL('../../services/product-parameters.service.ts', import.meta.url))
const journalParametersServicePath = fileURLToPath(new URL('../../services/journal-parameters.service.ts', import.meta.url))

const stores = {
  users: new Map<string, UserRow>(),
  roles: new Map<string, RoleRow>(),
  roleAssignments: [] as RoleAssignmentRow[],
  rolePermissions: new Map<string, string[]>(),
  parameterHeaders: new Map<string, ParameterHeaderRow>(),
  parameterDetails: new Map<number, ParameterDetailRow>(),
  pdConfigurations: new Map<number, GenericNumericRow>(),
  lgdConfigurations: new Map<number, GenericNumericRow>(),
  eclConfigurations: new Map<number, GenericNumericRow>(),
  bucketHeaders: new Map<number, GenericNumericRow>(),
  ruleHeaders: new Map<number, GenericNumericRow>(),
  ruleDetails: new Map<number, GenericNumericRow>(),
  productParameters: new Map<number, GenericNumericRow>(),
  journalParameters: new Map<number, GenericNumericRow>(),
  eadConfigurations: [] as Array<Record<string, any>>,
  segmentationHeaders: [] as Array<Record<string, any>>,
  segmentationDetails: [] as Array<Record<string, any>>,
  flScalarHeaders: [] as Array<Record<string, any>>,
  flScalarDetails: [] as Array<Record<string, any>>,
}

const idCounters = {
  parameterDetail: 100,
  ead: 200,
  segmentHeader: 300,
  segmentDetail: 400,
  flScalarHeader: 500,
  flScalarDetail: 600,
}

const table = <T extends string>(name: T, columns: string[]) =>
  Object.assign({ __table: name }, Object.fromEntries(columns.map((column) => [column, column])))

const schema = {
  approvalRequests: table('approvalRequests', ['id', 'tenantId', 'status', 'entityType', 'completedAt', 'createdAt']),
  userRoles: table('userRoles', ['userId']),
  frs9ImpCaEadConfig: table('eadConfigurations', ['pkid']),
  frs9ParamSegmenth: table('segmentationHeaders', ['pkid']),
  frs9ParamSegmentd: table('segmentationDetails', ['pkid', 'segmentId']),
  frs9ImpCaFlScalarh: table('flScalarHeaders', ['pkid']),
  frs9ImpCaFlScalard: table('flScalarDetails', ['pkid', 'scalarId']),
}

function resetStores() {
  stores.users.clear()
  stores.roles.clear()
  stores.roleAssignments = []
  stores.rolePermissions.clear()
  stores.parameterHeaders.clear()
  stores.parameterDetails.clear()
  stores.pdConfigurations.clear()
  stores.lgdConfigurations.clear()
  stores.eclConfigurations.clear()
  stores.bucketHeaders.clear()
  stores.ruleHeaders.clear()
  stores.ruleDetails.clear()
  stores.productParameters.clear()
  stores.journalParameters.clear()
  stores.eadConfigurations = []
  stores.segmentationHeaders = []
  stores.segmentationDetails = []
  stores.flScalarHeaders = []
  stores.flScalarDetails = []

  idCounters.parameterDetail = 100
  idCounters.ead = 200
  idCounters.segmentHeader = 300
  idCounters.segmentDetail = 400
  idCounters.flScalarHeader = 500
  idCounters.flScalarDetail = 600
}

function mapStore(tableName: string): Array<Record<string, any>> {
  switch (tableName) {
    case 'eadConfigurations':
      return stores.eadConfigurations
    case 'segmentationHeaders':
      return stores.segmentationHeaders
    case 'segmentationDetails':
      return stores.segmentationDetails
    case 'flScalarHeaders':
      return stores.flScalarHeaders
    case 'flScalarDetails':
      return stores.flScalarDetails
    default:
      throw new Error(`Unknown table ${tableName}`)
  }
}

function nextId(tableName: string): number {
  switch (tableName) {
    case 'eadConfigurations':
      return idCounters.ead++
    case 'segmentationHeaders':
      return idCounters.segmentHeader++
    case 'segmentationDetails':
      return idCounters.segmentDetail++
    case 'flScalarHeaders':
      return idCounters.flScalarHeader++
    case 'flScalarDetails':
      return idCounters.flScalarDetail++
    default:
      throw new Error(`No id counter for ${tableName}`)
  }
}

function buildQuery<T>(executor: () => T | Promise<T>) {
  let hasRun = false
  let cached: Promise<T> | null = null
  const run = () => {
    if (!hasRun) {
      cached = Promise.resolve(executor())
      hasRun = true
    }
    return cached as Promise<T>
  }
  return {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return run().then(onfulfilled ?? undefined, onrejected ?? undefined)
    },
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null) {
      return run().catch(onrejected ?? undefined)
    },
    returning(selection?: Record<string, string>) {
      return run().then((rows: any) => {
        if (!Array.isArray(rows)) return rows
        if (!selection) return rows
        return rows.map((row) =>
          Object.fromEntries(Object.entries(selection).map(([key, column]) => [key, row[column]]))
        )
      })
    },
  }
}

function createLegacyDb() {
  const db: any = {
    insert(tableRef: Record<string, any>) {
      return {
        values(payload: Record<string, any> | Array<Record<string, any>>) {
          return buildQuery(() => {
            const rows = Array.isArray(payload) ? payload : [payload]
            const store = mapStore(String(tableRef.__table))
            const inserted = rows.map((row) => {
              const nextRow = { ...row }
              if ('pkid' in tableRef && (nextRow.pkid === undefined || nextRow.pkid === null)) {
                nextRow.pkid = nextId(String(tableRef.__table))
              }
              store.push(nextRow)
              return nextRow
            })
            return inserted
          })
        },
      }
    },
    update(tableRef: Record<string, any>) {
      return {
        set(payload: Record<string, any>) {
          return {
            where(condition: { column: string; value: unknown }) {
              return buildQuery(() => {
                const store = mapStore(String(tableRef.__table))
                const updated: Array<Record<string, any>> = []
                for (const row of store) {
                  if (row[condition.column] === condition.value) {
                    Object.assign(row, payload)
                    updated.push({ ...row })
                  }
                }
                return updated
              })
            },
          }
        },
      }
    },
    delete(tableRef: Record<string, any>) {
      return {
        where(condition: { column: string; value: unknown }) {
          return buildQuery(() => {
            const store = mapStore(String(tableRef.__table))
            const removed: Array<Record<string, any>> = []
            for (let index = store.length - 1; index >= 0; index -= 1) {
              if (store[index][condition.column] === condition.value) {
                removed.push(...store.splice(index, 1))
              }
            }
            return removed
          })
        },
      }
    },
    transaction: async (callback: (tx: typeof db) => Promise<void>) => {
      await callback(db)
    },
  }

  return db
}

const fakeLegacyDb = createLegacyDb()

mock.module('drizzle-orm', () => ({
  and: (...parts: unknown[]) => parts,
  or: (...parts: unknown[]) => parts,
  gte: (...parts: unknown[]) => parts,
  lte: (...parts: unknown[]) => parts,
  isNull: (...parts: unknown[]) => parts,
  eq: (column: string, value: unknown) => ({ column, value }),
}))

mock.module(approvalRepositoryPath, () => ({
  ApprovalRepository: {},
}))

mock.module(rbacRepositoryPath, () => ({
  userRolesRepository: {
    findByUser: () => Effect.succeed([]),
  },
}))

mock.module(configDatabaseAliasPath, () => ({
  getDatabase: () => ({
    query: {
      userRoles: {
        findMany: async () => [],
      },
    },
  }),
}))

mock.module(approvalHelpersPath, () => ({}))

mock.module(notificationSocketPath, () => ({
  getNotificationSocket: () => ({
    broadcastApprovalNotificationToUsers: () => undefined,
    broadcastApprovalNotification: () => undefined,
  }),
}))

mock.module(notificationRepositoryPath, () => ({
  NotificationRepository: {
    createWithDeliveries: async () => ({ id: 'notification-1' }),
  },
}))

mock.module(notificationsServicePath, () => ({
  deriveNotificationCategory: () => 'approval',
  filterNotificationRecipientsByPreferences: async ({ userIds }: { userIds: string[] }) => userIds,
}))

mock.module(dbSchemaAliasPath, () => ({
  userRoles: schema.userRoles,
  approvalRequests: schema.approvalRequests,
}))

mock.module(configIndexPath, () => ({
  legacyDb: fakeLegacyDb,
  tenantDb: {},
  closeDatabase: async () => undefined,
}))

mock.module(dbSchemaIndexPath, () => ({
  userRoles: schema.userRoles,
  approvalRequests: schema.approvalRequests,
  frs9ImpCaEadConfig: schema.frs9ImpCaEadConfig,
  frs9ParamSegmenth: schema.frs9ParamSegmenth,
  frs9ParamSegmentd: schema.frs9ParamSegmentd,
  frs9ImpCaFlScalarh: schema.frs9ImpCaFlScalarh,
  frs9ImpCaFlScalard: schema.frs9ImpCaFlScalard,
}))

mock.module(usersServicePath, () => ({
  createUser: (payload: any) =>
    Effect.sync(() => {
      stores.users.set(payload.id, { ...payload })
      return { id: payload.id }
    }),
  updateUser: (userId: string, payload: any) =>
    Effect.sync(() => {
      const existing = stores.users.get(userId) ?? { id: userId }
      stores.users.set(userId, { ...existing, ...payload, id: userId })
      return { id: userId }
    }),
  deleteUser: (userId: string) =>
    Effect.sync(() => {
      stores.users.delete(userId)
    }),
  enableUser: (userId: string) =>
    Effect.sync(() => {
      const existing = stores.users.get(userId) ?? { id: userId, tenantId: 'tenant-1' }
      stores.users.set(userId, { ...existing, isActive: true })
    }),
  disableUser: (userId: string) =>
    Effect.sync(() => {
      const existing = stores.users.get(userId) ?? { id: userId, tenantId: 'tenant-1' }
      stores.users.set(userId, { ...existing, isActive: false })
    }),
}))

mock.module(rbacServicePath, () => ({
  createRole: (payload: any) =>
    Effect.sync(() => {
      stores.roles.set(payload.id, { ...payload })
      return { id: payload.id }
    }),
  updateRole: (roleId: string, payload: any) =>
    Effect.sync(() => {
      const existing = stores.roles.get(roleId) ?? { id: roleId, tenantId: payload.tenantId }
      stores.roles.set(roleId, { ...existing, ...payload, id: roleId })
      return { id: roleId }
    }),
  deleteRole: (roleId: string) =>
    Effect.sync(() => {
      stores.roles.delete(roleId)
    }),
  assignRole: (payload: any) =>
    Effect.sync(() => {
      stores.roleAssignments.push({ userId: payload.userId, roleId: payload.roleId, tenantId: payload.tenantId })
    }),
  removeRole: (userId: string, roleId: string, tenantId: string) =>
    Effect.sync(() => {
      stores.roleAssignments = stores.roleAssignments.filter(
        (row) => !(row.userId === userId && row.roleId === roleId && row.tenantId === tenantId)
      )
    }),
  getAvailablePermissions: () =>
    Effect.succeed([
      { id: 'perm-approve', code: 'approval.requests.approve' },
      { id: 'perm-audit', code: 'admin.system.view' },
    ]),
  updateRolePermissions: (roleId: string, permissionIds: string[]) =>
    Effect.sync(() => {
      stores.rolePermissions.set(roleId, [...permissionIds])
    }),
}))

mock.module(parametersServicePath, () => ({
  ParametersService: {
    createAppSetting: (payload: any, actorId: string) =>
      Effect.sync(() => {
        stores.parameterHeaders.set(payload.paramCode, { ...payload, createdby: actorId, updatedby: actorId })
      }),
    updateAppSetting: (paramCode: string, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.parameterHeaders.get(paramCode) ?? { paramCode }
        stores.parameterHeaders.set(paramCode, { ...existing, ...payload, updatedby: actorId })
      }),
    deleteAppSetting: (paramCode: string) =>
      Effect.sync(() => {
        stores.parameterHeaders.delete(paramCode)
      }),
    createAppSettingDetail: (payload: any) =>
      Effect.sync(() => {
        const id = Number(payload.id ?? idCounters.parameterDetail++)
        stores.parameterDetails.set(id, { pkid: id, ...payload })
      }),
    updateAppSettingDetail: (detailId: number, payload: any) =>
      Effect.sync(() => {
        const existing = stores.parameterDetails.get(detailId) ?? { pkid: detailId, paramCode: payload.paramCode }
        stores.parameterDetails.set(detailId, { ...existing, ...payload, pkid: detailId })
      }),
    deleteAppSettingDetail: (detailId: number) =>
      Effect.sync(() => {
        stores.parameterDetails.delete(detailId)
      }),
  },
}))

function mockNumericConfigService(
  servicePath: string,
  target: Map<number, GenericNumericRow>
) {
  mock.module(servicePath, () => ({
    [servicePath === pdConfigurationsServicePath
      ? 'PdConfigurationsService'
      : servicePath === lgdConfigurationsServicePath
        ? 'LgdConfigurationsService'
        : 'EclConfigurationsService']: {
      create: (payload: any, actorId: string) =>
        Effect.sync(() => {
          const id = Number(payload.id ?? payload.pkid ?? target.size + 1)
          target.set(id, { ...payload, id, createdby: actorId, updatedby: actorId })
          return { id }
        }),
      update: (id: number, payload: any, actorId: string) =>
        Effect.sync(() => {
          const existing = target.get(id) ?? { id }
          target.set(id, { ...existing, ...payload, id, updatedby: actorId })
          return { id }
        }),
      delete: (id: number) =>
        Effect.sync(() => {
          target.delete(id)
        }),
    },
  }))
}

mockNumericConfigService(pdConfigurationsServicePath, stores.pdConfigurations)
mockNumericConfigService(lgdConfigurationsServicePath, stores.lgdConfigurations)
mockNumericConfigService(eclConfigurationsServicePath, stores.eclConfigurations)

mock.module(bucketParametersServicePath, () => ({
  BucketParametersService: {
    createHeader: (payload: any, actorId: string) =>
      Effect.sync(() => {
        const id = Number(payload.id ?? stores.bucketHeaders.size + 1)
        stores.bucketHeaders.set(id, { ...payload, id, createdby: actorId, updatedby: actorId })
        return { id }
      }),
    updateHeader: (id: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.bucketHeaders.get(id) ?? { id }
        stores.bucketHeaders.set(id, { ...existing, ...payload, id, updatedby: actorId })
        return { id }
      }),
    deleteHeader: (id: number) =>
      Effect.sync(() => {
        stores.bucketHeaders.delete(id)
      }),
  },
}))

mock.module(ruleBaseSettingsServicePath, () => ({
  RuleBaseSettingsService: {
    createHeader: (payload: any, actorId: string) =>
      Effect.sync(() => {
        const id = Number(payload.id ?? stores.ruleHeaders.size + 1)
        stores.ruleHeaders.set(id, { ...payload, id, createdby: actorId, updatedby: actorId })
        return { id }
      }),
    updateHeader: (id: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.ruleHeaders.get(id) ?? { id }
        stores.ruleHeaders.set(id, { ...existing, ...payload, id, updatedby: actorId })
        return { id }
      }),
    deleteHeader: (id: number) =>
      Effect.sync(() => {
        stores.ruleHeaders.delete(id)
      }),
    createDetail: (ruleId: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const id = Number(payload.id ?? stores.ruleDetails.size + 1)
        stores.ruleDetails.set(id, { ...payload, id, ruleId, createdby: actorId, updatedby: actorId })
        return { id }
      }),
    updateDetail: (id: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.ruleDetails.get(id) ?? { id }
        stores.ruleDetails.set(id, { ...existing, ...payload, id, updatedby: actorId })
        return { id }
      }),
    deleteDetail: (id: number) =>
      Effect.sync(() => {
        stores.ruleDetails.delete(id)
      }),
  },
}))

mock.module(productParametersServicePath, () => ({
  ProductParametersService: {
    create: (payload: any, actorId: string) =>
      Effect.sync(() => {
        const id = Number(payload.id ?? stores.productParameters.size + 1)
        stores.productParameters.set(id, { ...payload, id, createdby: actorId, updatedby: actorId })
        return { id }
      }),
    update: (id: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.productParameters.get(id) ?? { id }
        stores.productParameters.set(id, { ...existing, ...payload, id, updatedby: actorId })
        return { id }
      }),
    delete: (id: number) =>
      Effect.sync(() => {
        stores.productParameters.delete(id)
      }),
  },
}))

mock.module(journalParametersServicePath, () => ({
  JournalParametersService: {
    create: (payload: any, actorId: string) =>
      Effect.sync(() => {
        const id = Number(payload.id ?? stores.journalParameters.size + 1)
        stores.journalParameters.set(id, { ...payload, id, createdby: actorId, updatedby: actorId })
        return { id }
      }),
    update: (id: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.journalParameters.get(id) ?? { id }
        stores.journalParameters.set(id, { ...existing, ...payload, id, updatedby: actorId })
        return { id }
      }),
    delete: (id: number) =>
      Effect.sync(() => {
        stores.journalParameters.delete(id)
      }),
  },
}))

const approvalService = await import('@/services/approval.service')

function makeRequest(entityType: string, operation: 'create' | 'update' | 'delete', data: any, entityId?: string) {
  return {
    id: `req-${entityType}-${operation}`,
    tenantId: 'tenant-1',
    entityType,
    entityId,
    requestedBy: 'maker-1',
    requestData: {
      operation,
      entityType,
      data,
      oldValues: {},
    },
  }
}

describe('approval executor integration with mocked live stores', () => {
  beforeEach(() => {
    resetStores()
  })

  test('replayApprovedRequestSideEffect applies user and user_status changes to live user store', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('user', 'create', { id: 'user-1', fullName: 'Alice' }),
      'approver-1'
    )
    expect(stores.users.get('user-1')).toEqual(expect.objectContaining({ id: 'user-1', fullName: 'Alice', tenantId: 'tenant-1' }))

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('user', 'update', { fullName: 'Alice Updated' }, 'user-1'),
      'approver-1'
    )
    expect(stores.users.get('user-1')?.fullName).toBe('Alice Updated')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('user_status', 'update', { id: 'user-1', isActive: false }, 'user-1'),
      'approver-1'
    )
    expect(stores.users.get('user-1')?.isActive).toBe(false)

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('user', 'delete', { id: 'user-1' }, 'user-1'),
      'approver-1'
    )
    expect(stores.users.has('user-1')).toBe(false)
  })

  test('replayApprovedRequestSideEffect applies role, role assignment, and role permission changes', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('role', 'create', { id: 'role-1', roleCode: 'USERCHECKER', roleName: 'Checker' }, 'role-1'),
      'approver-1'
    )
    expect(stores.roles.get('role-1')?.roleCode).toBe('USERCHECKER')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('role_assignment', 'create', { userId: 'user-1', roleId: 'role-1' }),
      'approver-1'
    )
    expect(stores.roleAssignments).toContainEqual({ userId: 'user-1', roleId: 'role-1', tenantId: 'tenant-1' })

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('role_permission', 'update', { roleId: 'role-1', permissions: ['approval.requests.approve', 'admin.system.view'] }),
      'approver-1'
    )
    expect(stores.rolePermissions.get('role-1')).toEqual(['perm-approve', 'perm-audit'])

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('role_assignment', 'delete', { userId: 'user-1', roleId: 'role-1' }),
      'approver-1'
    )
    expect(stores.roleAssignments).toHaveLength(0)

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('role', 'delete', { id: 'role-1' }, 'role-1'),
      'approver-1'
    )
    expect(stores.roles.has('role-1')).toBe(false)
  })

  test('replayApprovedRequestSideEffect applies parameter header and detail changes', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('app_setting', 'create', { paramCode: 'A1001', paramName: 'Alpha', paramType: 'A' }, 'A1001'),
      'approver-1'
    )
    expect(stores.parameterHeaders.get('A1001')?.createdby).toBe('maker-1')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('app_setting', 'update', { paramName: 'Alpha Updated', paramType: 'A' }, 'A1001'),
      'approver-1'
    )
    expect(stores.parameterHeaders.get('A1001')?.paramName).toBe('Alpha Updated')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('parameter', 'create', { scope: 'detail', paramCode: 'A1001', value1: 'X', id: 101 }, 'detail:101'),
      'approver-1'
    )
    expect(stores.parameterDetails.get(101)?.value1).toBe('X')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('business_setting', 'update', { scope: 'detail', paramCode: 'A1001', value1: 'Y', id: 101 }, 'detail:101'),
      'approver-1'
    )
    expect(stores.parameterDetails.get(101)?.value1).toBe('Y')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('parameter', 'delete', { id: 101 }, 'detail:101'),
      'approver-1'
    )
    expect(stores.parameterDetails.has(101)).toBe(false)

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('app_setting', 'delete', { paramCode: 'A1001' }, 'A1001'),
      'approver-1'
    )
    expect(stores.parameterHeaders.has('A1001')).toBe(false)
  })

  test('replayApprovedRequestSideEffect applies PD, LGD, ECL, and EAD configuration changes', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('pd_configuration', 'create', { id: 11, model_name: 'PD 1' }, '11'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('lgd_configuration', 'create', { id: 22, lgd_name: 'LGD 1' }, '22'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('ecl_configuration', 'create', { id: 33, name: 'ECL 1' }, '33'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('ead_configuration', 'create', { model_name: 'EAD 1', segment_id: 7, ead_method: 'M1', calc_method: 'C1', is_active: 'Y' }),
      'approver-1'
    )

    expect(stores.pdConfigurations.get(11)?.createdby).toBe('maker-1')
    expect(stores.lgdConfigurations.get(22)?.createdby).toBe('maker-1')
    expect(stores.eclConfigurations.get(33)?.createdby).toBe('maker-1')
    expect(stores.eadConfigurations).toHaveLength(1)
    expect(stores.eadConfigurations[0]).toEqual(expect.objectContaining({ eadModelName: 'EAD 1', segmentId: 7, createdby: 'maker-1' }))

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('ead_configuration', 'update', { model_name: 'EAD 1B', segment_id: 8, ead_method: 'M2', calc_method: 'C2', is_active: 'N' }, '200'),
      'approver-1'
    )
    expect(stores.eadConfigurations[0]).toEqual(expect.objectContaining({ pkid: 200, eadModelName: 'EAD 1B', segmentId: 8, updatedby: 'maker-1' }))

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('pd_configuration', 'delete', { id: 11 }, '11'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('lgd_configuration', 'delete', { id: 22 }, '22'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('ecl_configuration', 'delete', { id: 33 }, '33'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('ead_configuration', 'delete', { id: 200 }, '200'),
      'approver-1'
    )

    expect(stores.pdConfigurations.has(11)).toBe(false)
    expect(stores.lgdConfigurations.has(22)).toBe(false)
    expect(stores.eclConfigurations.has(33)).toBe(false)
    expect(stores.eadConfigurations).toHaveLength(0)
  })

  test('replayApprovedRequestSideEffect applies bucket, rule base, product, and journal changes', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('bucket_parameter', 'create', { id: 41, bucket_group: 'BKT-1' }, '41'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('rule_base_setting', 'create', { id: 51, rule_name: 'Rule 1' }, '51'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('rule_base_setting', 'create', { scope: 'detail', id: 61, ruleId: 51, query_group: 1 }, 'detail:61'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('product_parameter', 'create', { id: 71, prdCode: 'P-1' }, '71'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('journal_parameter', 'create', { id: 81, glCode: 'J-1' }, '81'),
      'approver-1'
    )

    expect(stores.bucketHeaders.get(41)?.createdby).toBe('maker-1')
    expect(stores.ruleHeaders.get(51)?.createdby).toBe('maker-1')
    expect(stores.ruleDetails.get(61)?.ruleId).toBe(51)
    expect(stores.productParameters.get(71)?.prdCode).toBe('P-1')
    expect(stores.journalParameters.get(81)?.glCode).toBe('J-1')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('bucket_parameter', 'delete', { id: 41 }, '41'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('rule_base_setting', 'delete', { id: 61, scope: 'detail' }, 'detail:61'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('rule_base_setting', 'delete', { id: 51 }, '51'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('product_parameter', 'delete', { id: 71 }, '71'),
      'approver-1'
    )
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('journal_parameter', 'delete', { id: 81 }, '81'),
      'approver-1'
    )

    expect(stores.bucketHeaders.has(41)).toBe(false)
    expect(stores.ruleDetails.has(61)).toBe(false)
    expect(stores.ruleHeaders.has(51)).toBe(false)
    expect(stores.productParameters.has(71)).toBe(false)
    expect(stores.journalParameters.has(81)).toBe(false)
  })

  test('replayApprovedRequestSideEffect applies segmentation header and detail changes', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('segmentation', 'create', {
        group_segment: 'Corp',
        segment: 'SME',
        sub_segment: 'A',
        segment_type: 'TYPE',
        seq: 1,
        active_flag: 'Y',
        rules: [{ query_group: 1, seq: 1, table_name: 'T1', column_name: 'C1', data_type: 'VARCHAR', operator: '=', value1: 'A', value2: '', condition: 'AND' }],
      }),
      'approver-1'
    )
    expect(stores.segmentationHeaders).toHaveLength(1)
    expect(stores.segmentationDetails).toHaveLength(1)
    expect(stores.segmentationHeaders[0].createdby).toBe('maker-1')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('segmentation', 'update', {
        group_segment: 'Corp Updated',
        segment: 'SME',
        sub_segment: 'A',
        segment_type: 'TYPE',
        seq: 2,
        active_flag: 'N',
        rules: [{ query_group: 2, seq: 1, table_name: 'T2', column_name: 'C2', data_type: 'VARCHAR', operator: '=', value1: 'B', value2: '', condition: 'AND' }],
      }, '300'),
      'approver-1'
    )
    expect(stores.segmentationHeaders[0]).toEqual(expect.objectContaining({ pkid: 300, groupSegment: 'Corp Updated', updatedby: 'maker-1' }))
    expect(stores.segmentationDetails).toHaveLength(1)
    expect(stores.segmentationDetails[0]).toEqual(expect.objectContaining({ segmentId: 300, tableName: 'T2' }))

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('segmentation', 'create', {
        scope: 'detail',
        segment_id: 300,
        query_group: 3,
        seq: 2,
        table_name: 'T3',
        column_name: 'C3',
        data_type: 'VARCHAR',
        operator: '=',
        value1: 'C',
        value2: '',
        condition: 'AND',
      }),
      'approver-1'
    )
    expect(stores.segmentationDetails).toHaveLength(2)

    const detailPkid = stores.segmentationDetails.find((row) => row.tableName === 'T3')?.pkid
    expect(detailPkid).toBeDefined()

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('segmentation', 'delete', { id: detailPkid, scope: 'detail' }, `detail:${detailPkid}`),
      'approver-1'
    )
    expect(stores.segmentationDetails.find((row) => row.pkid === detailPkid)).toBeUndefined()

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('segmentation', 'delete', { id: 300 }, '300'),
      'approver-1'
    )
    expect(stores.segmentationHeaders).toHaveLength(0)
    expect(stores.segmentationDetails).toHaveLength(0)
  })

  test('replayApprovedRequestSideEffect applies FL scalar header and detail changes', async () => {
    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('fl_scalar', 'create', {
        scalar_name: 'Scalar 1',
        active_flag: 'Y',
        details: [{ period: 1, weighted_scalar: 0.9 }, { period: 2, weighted_scalar: 0.8 }],
      }),
      'approver-1'
    )
    expect(stores.flScalarHeaders).toHaveLength(1)
    expect(stores.flScalarDetails).toHaveLength(2)
    expect(stores.flScalarHeaders[0].createdby).toBe('maker-1')

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('fl_scalar', 'update', {
        scalar_name: 'Scalar 1B',
        active_flag: 'N',
        details: [{ period: 3, weighted_scalar: 0.7 }],
      }, '500'),
      'approver-1'
    )
    expect(stores.flScalarHeaders[0]).toEqual(expect.objectContaining({ pkid: 500, scalarName: 'Scalar 1B', updatedby: 'maker-1' }))
    expect(stores.flScalarDetails).toHaveLength(1)
    expect(stores.flScalarDetails[0]).toEqual(expect.objectContaining({ scalarId: 500, period: 3 }))

    await approvalService.replayApprovedRequestSideEffect(
      makeRequest('fl_scalar', 'delete', { id: 500 }, '500'),
      'approver-1'
    )
    expect(stores.flScalarHeaders).toHaveLength(0)
    expect(stores.flScalarDetails).toHaveLength(0)
  })
})
