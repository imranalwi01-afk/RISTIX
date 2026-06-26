import { trace, SpanStatusCode } from '@opentelemetry/api'
import type postgres from 'postgres'

const tracer = trace.getTracer('ifrs9-backend')

type PostgresSql = ReturnType<typeof postgres>

/**
 * Wrap a postgres `sql` function in a Proxy that creates an OTel span
 * for every query with statement, parameters, duration_ms, row_count.
 */
export function wrapSql(sql: PostgresSql, dbName: string): PostgresSql {
  const traced = (thisArg: unknown, args: unknown[]) => {
    const { statement, parameters } = extractQuery(args)
    const span = tracer.startSpan(`db.query.${dbName}`, {
      attributes: {
        'db.system': 'postgresql',
        'db.statement': statement,
        'db.name': dbName,
      },
    })
    const start = performance.now()
    try {
      const result = Reflect.apply(sql, thisArg, args) as ReturnType<PostgresSql>
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).then((v) => {
          const dur = (performance.now() - start).toFixed(2)
          span.setAttribute('db.duration_ms', dur)
          if (parameters) span.setAttribute('db.parameters', parameters)
          if (Array.isArray(v)) span.setAttribute('db.row_count', v.length)
          span.end()
          return v
        }).catch((e: Error) => {
          span.setStatus({ code: SpanStatusCode.ERROR, message: e?.message || String(e) })
          span.end()
          throw e
        })
      }
      const dur = (performance.now() - start).toFixed(2)
      span.setAttribute('db.duration_ms', dur)
      if (parameters) span.setAttribute('db.parameters', parameters)
      if (Array.isArray(result)) span.setAttribute('db.row_count', (result as unknown[]).length)
      span.end()
      return result
    } catch (e) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error)?.message || String(e) })
      span.end()
      throw e
    }
  }

  return new Proxy(sql, {
    apply(_target, thisArg, args) {
      return traced(thisArg, args)
    },
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (prop === 'begin' && typeof value === 'function') {
        return (...beginArgs: unknown[]) => {
          const span = tracer.startSpan(`db.transaction.${dbName}`, {
            attributes: { 'db.system': 'postgresql', 'db.name': dbName },
          })
          const start = performance.now()
          try {
            const r = Reflect.apply(value as Function, target, beginArgs)
            if (r && typeof (r as Promise<unknown>).then === 'function') {
              return (r as Promise<unknown>).then((v) => {
                span.setAttribute('db.duration_ms', (performance.now() - start).toFixed(2))
                span.end()
                return v
              }).catch((e: Error) => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: e?.message || String(e) })
                span.end()
                throw e
              })
            }
            span.setAttribute('db.duration_ms', (performance.now() - start).toFixed(2))
            span.end()
            return r
          } catch (e) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error)?.message || String(e) })
            span.end()
            throw e
          }
        }
      }
      // Wrap unsafe() so raw-SQL calls also get traced
      if (prop === 'unsafe' && typeof value === 'function') {
        return (...unsafeArgs: unknown[]) => {
          const stmt = typeof unsafeArgs[0] === 'string' ? unsafeArgs[0] : ''
          const params = unsafeArgs[1]
          const span = tracer.startSpan(`db.query.${dbName}`, {
            attributes: {
              'db.system': 'postgresql',
              'db.statement': stmt,
              'db.name': dbName,
              'db.parameters': params ? JSON.stringify(params) : '',
            },
          })
          const start = performance.now()
          try {
            const r = Reflect.apply(value as Function, target, unsafeArgs)
            if (r && typeof (r as Promise<unknown>).then === 'function') {
              return (r as Promise<unknown>).then((v) => {
                span.setAttribute('db.duration_ms', (performance.now() - start).toFixed(2))
                if (Array.isArray(v)) span.setAttribute('db.row_count', v.length)
                span.end()
                return v
              }).catch((e: Error) => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: e?.message || String(e) })
                span.end()
                throw e
              })
            }
            span.setAttribute('db.duration_ms', (performance.now() - start).toFixed(2))
            if (Array.isArray(r)) span.setAttribute('db.row_count', r.length)
            span.end()
            return r
          } catch (e) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error)?.message || String(e) })
            span.end()
            throw e
          }
        }
      }
      return value
    },
  })
}

function extractQuery(args: unknown[]): { statement: string; parameters: string | null } {
  if (args.length === 0) return { statement: '', parameters: null }
  const first = args[0]
  if (Array.isArray(first) && typeof first[0] === 'string') {
    const parts = first as unknown as TemplateStringsArray
    const vals = args.slice(1)
    const statement = parts.reduce((s, p, i) => s + p + (i < vals.length ? `$${i + 1}` : ''), '')
    // Only include parameters if there are any
    const parameters = vals.length > 0 ? JSON.stringify(vals) : null
    return { statement, parameters }
  }
  if (typeof first === 'string') return { statement: first, parameters: null }
  return { statement: String(first), parameters: null }
}
