import { beforeAll, describe, expect, mock, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const queueServiceStub = {
  addJob: async () => ({ id: 'mock-job' }),
  getJob: async () => null,
  jobsQueue: { add: async () => ({ id: 'mock-job' }) },
  jobsQueueRef: {},
  jobsWorker: { on: () => {} },
}

// Queue service has import-time side effects (Redis worker startup).
// Mock it so app/route imports stay deterministic in tests.
mock.module('@/services/queue.service', () => queueServiceStub)
mock.module('../../services/queue.service', () => queueServiceStub)

const { createApp } = await import('@/app')

const extractMountedPrefixes = (source: string): string[] => {
  const pattern = /routes\.route\('([^']+)'/g
  const mounts: string[] = []
  let match: RegExpExecArray | null = pattern.exec(source)
  while (match) {
    mounts.push(match[1])
    match = pattern.exec(source)
  }
  return Array.from(new Set(mounts))
}

const replacePathParams = (pathTemplate: string): string =>
  pathTemplate.replace(/\{[^}]+\}/g, '00000000-0000-4000-8000-000000000001')

const openApiHttpMethods = ['get', 'post', 'put', 'patch', 'delete'] as const
type OpenApiHttpMethod = (typeof openApiHttpMethods)[number]

const buildMinimalRequest = (method: OpenApiHttpMethod): RequestInit => {
  const init: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'content-type': 'application/json',
    },
  }

  if (method !== 'get' && method !== 'delete') {
    init.body = '{}'
  }

  return init
}

describe('API route registry', () => {
  let app: ReturnType<typeof createApp>
  let openApiDoc: any
  let mountedPrefixes: string[] = []

  beforeAll(async () => {
    const routesIndexPath = join(process.cwd(), 'src/routes/index.ts')
    const routesIndexSource = await readFile(routesIndexPath, 'utf8')
    mountedPrefixes = extractMountedPrefixes(routesIndexSource)

    app = createApp()
    const docResponse = await app.request('/doc')
    expect(docResponse.status).toBe(200)
    openApiDoc = await docResponse.json()
  })

  test('all mounted route prefixes are represented in OpenAPI paths', () => {
    const paths = Object.keys(openApiDoc?.paths || {})
    expect(paths.length).toBeGreaterThan(0)

    const undocumentedPrefixes = new Set(['/debug-routes'])

    for (const prefix of mountedPrefixes) {
      if (undocumentedPrefixes.has(prefix)) continue
      const expectedPrefix = `/api/v1${prefix}`
      const found = paths.some((path) => path.startsWith(expectedPrefix))
      expect(found).toBe(true)
    }
  })

  test('secured routes resolve to non-404 and non-5xx without auth', async () => {
    const paths = openApiDoc?.paths || {}

    const sampleOperations = mountedPrefixes
      .map((prefix) => {
        const expectedPrefix = `/api/v1${prefix}`
        const pathEntry = Object.entries(paths).find(([path, ops]: any) => {
          if (!path.startsWith(expectedPrefix)) return false
          return openApiHttpMethods.some((method) => Boolean((ops as any)?.[method]?.security))
        })
        if (!pathEntry) return null
        const [path, ops] = pathEntry as [string, Record<string, any>]
        const method = openApiHttpMethods.find((m) => Boolean(ops?.[m]?.security))
        if (!method) return null
        return { prefix, path, method }
      })
      .filter(Boolean) as Array<{ prefix: string; path: string; method: string }>

    expect(sampleOperations.length).toBeGreaterThan(0)

    for (const operation of sampleOperations) {
      const path = replacePathParams(operation.path)
      const response = await app.request(path, buildMinimalRequest(operation.method as OpenApiHttpMethod))
      expect(response.status).not.toBe(404)
      expect(response.status).toBeLessThan(500)
    }
  })

  test('all secured OpenAPI operations resolve to non-404 and non-5xx with minimal request payloads', async () => {
    const paths = openApiDoc?.paths || {}
    const operations: Array<{ path: string; method: OpenApiHttpMethod }> = []

    for (const [path, ops] of Object.entries(paths) as Array<[string, Record<string, any>]>) {
      for (const method of openApiHttpMethods) {
        const operation = ops?.[method]
        if (!operation?.security) continue
        operations.push({ path, method })
      }
    }

    expect(operations.length).toBeGreaterThan(0)

    const knownInfrastructureFallbacks = new Set(['/api/v1/jobs/executions/{id}/cancel'])
    const acceptableFallbackStatuses = new Set([500, 503])

    for (const operation of operations) {
      const path = replacePathParams(operation.path)
      const response = await app.request(path, buildMinimalRequest(operation.method))

      if (knownInfrastructureFallbacks.has(operation.path) && acceptableFallbackStatuses.has(response.status)) {
        continue
      }

      expect(response.status).not.toBe(404)
      expect(response.status).toBeLessThan(500)
    }
  })
})
