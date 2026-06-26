import { trace, SpanStatusCode } from '@opentelemetry/api'
import type postgres from 'postgres'

const tracer = trace.getTracer('ifrs9-backend')

type PostgresSql = ReturnType<typeof postgres>

/**
 * Wrap a postgres `sql` function in a Proxy that creates an OTel span
 * for every tagged-template query.
 *
 * Only intercepts tagged-template calls (sql`SELECT ...`). Does NOT wrap
 * `unsafe()` / `begin()` — those pass through unchanged to avoid
 * breaking method chaining (`.unsafe().values()`) in the compiled binary.
 */
export function wrapSql(sql: PostgresSql, dbName: string): PostgresSql {
  return new Proxy(sql, {
    apply(_target, thisArg, args) {
      const { statement, parameters } = extractQuery(args)
      const span = tracer.startSpan(`db.query.${dbName}`, {
        attributes: { 'db.system': 'postgresql', 'db.statement': statement, 'db.name': dbName },
      })
      const start = performance.now()
      try {
        const result = Reflect.apply(sql, thisArg, args) as ReturnType<PostgresSql>
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          return (result as Promise<unknown>).then((v) => {
            span.setAttribute('db.duration_ms', (performance.now() - start).toFixed(2))
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
    return { statement, parameters: vals.length > 0 ? JSON.stringify(vals) : null }
  }
  if (typeof first === 'string') return { statement: first, parameters: null }
  return { statement: String(first), parameters: null }
}
