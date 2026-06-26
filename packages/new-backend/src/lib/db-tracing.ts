import { trace, SpanStatusCode } from '@opentelemetry/api'
import type postgres from 'postgres'

const tracer = trace.getTracer('ifrs9-backend')

type PostgresSql = ReturnType<typeof postgres>

export function wrapSql(sql: PostgresSql, dbName: string): PostgresSql {
  return new Proxy(sql, {
    apply(target, thisArg, args) {
      const queryStr = extractQuery(args)
      const span = tracer.startSpan(`db.query.${dbName}`, {
        attributes: { 'db.system': 'postgresql', 'db.statement': queryStr, 'db.name': dbName },
      })
      const start = performance.now()
      try {
        const result = Reflect.apply(target, thisArg, args) as ReturnType<PostgresSql>
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          return (result as Promise<unknown>).then((v) => {
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
        return result
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error)?.message || String(e) })
        span.end()
        throw e
      }
    },
  })
}

function extractQuery(args: unknown[]): string {
  if (args.length === 0) return ''
  const first = args[0]
  if (Array.isArray(first) && typeof first[0] === 'string') {
    const parts = first as unknown as TemplateStringsArray
    const vals = args.slice(1)
    return parts.reduce((s, p, i) => s + p + (i < vals.length ? JSON.stringify(vals[i] ?? null) : ''), '')
  }
  if (typeof first === 'string') return first
  return String(first)
}
