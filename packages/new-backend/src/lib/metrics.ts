import { metrics, ValueType } from '@opentelemetry/api'
import { SERVICE_NAME } from './telemetry'

const meter = metrics.getMeter(SERVICE_NAME)

// Queue depth per queue name (BullMQ)
export const queueDepthGauge = meter.createGauge('bullmq.queue.depth', {
  description: 'Number of jobs waiting in each BullMQ queue',
  valueType: ValueType.INT,
})

// Active worker count
export const activeWorkersGauge = meter.createGauge('bullmq.active_workers', {
  description: 'Number of active worker instances',
  valueType: ValueType.INT,
})

// Approval metrics
export const approvalCountCounter = meter.createCounter('approval.requests.total', {
  description: 'Total number of approval requests created',
  valueType: ValueType.INT,
})

export const approvalDurationHistogram = meter.createHistogram('approval.request.duration_ms', {
  description: 'Duration of approval request lifecycle (created to final decision)',
  unit: 'ms',
  valueType: ValueType.INT,
})
