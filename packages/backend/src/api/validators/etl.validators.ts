// packages/backend/src/api/validators/etl.validators.ts

import { z } from 'zod';

const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['source', 'transform', 'filter', 'aggregate', 'join', 'lookup', 'validate', 'output', 'split', 'merge']),
  data: z.object({
    label: z.string().min(1),
    config: z.record(z.any()),
    metadata: z.object({
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      lastModified: z.date().optional(),
      performance: z.object({
        executionTime: z.number(),
        memoryUsage: z.number(),
        recordsProcessed: z.number(),
        throughput: z.number()
      }).optional()
    }).optional(),
    isValid: z.boolean().optional(),
    validationErrors: z.array(z.string()).optional()
  }),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});

const EdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  data: z.object({
    dataType: z.string().optional(),
    sampleSize: z.number().optional(),
    throughput: z.number().optional()
  }).optional()
});

const WorkflowDefinitionSchema = z.object({
  nodes: z.array(NodeSchema).min(1),
  edges: z.array(EdgeSchema),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number()
  }).optional(),
  settings: z.object({
    gridEnabled: z.boolean(),
    snapToGrid: z.boolean(),
    gridSize: z.number(),
    parallelExecution: z.boolean(),
    errorHandling: z.enum(['stop', 'skip', 'retry', 'log']),
    retryPolicy: z.object({
      maxAttempts: z.number().min(1).max(10),
      backoffStrategy: z.enum(['linear', 'exponential']),
      initialDelay: z.number().min(100),
      maxDelay: z.number().min(1000)
    })
  })
});

const QualityRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ruleType: z.enum(['completeness', 'uniqueness', 'validity', 'consistency', 'accuracy', 'timeliness']),
  ruleDefinition: z.object({
    targetField: z.string().optional(),
    condition: z.string(),
    threshold: z.number().min(0).max(100).optional(),
    customLogic: z.string().optional()
  }),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  isActive: z.boolean()
});

const ErrorDetailsSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  stack: z.string().optional(),
  context: z.record(z.any()).optional()
});

export const etlValidators = {
  createWorkflow: z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      workflowDefinition: WorkflowDefinitionSchema
    })
  }),

  updateWorkflow: z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().max(1000).optional(),
      workflowDefinition: WorkflowDefinitionSchema.optional(),
      status: z.enum(['draft', 'active', 'paused', 'deprecated', 'error']).optional()
    })
  }),

  getWorkflow: z.object({
    params: z.object({
      id: z.string().uuid()
    })
  }),

  deleteWorkflow: z.object({
    params: z.object({
      id: z.string().uuid()
    })
  }),

  executeWorkflow: z.object({
    params: z.object({
      id: z.string().uuid()
    })
  }),

  getExecutionHistory: z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    query: z.object({
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      offset: z.string().regex(/^\d+$/).transform(Number).optional()
    })
  }),

  analyzePerformance: z.object({
    params: z.object({
      id: z.string().uuid()
    })
  }),

  optimizeWorkflow: z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    body: z.object({
      workflowDefinition: WorkflowDefinitionSchema
    })
  }),

  getLineage: z.object({
    params: z.object({
      id: z.string().uuid()
    })
  }),

  analyzeImpact: z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    query: z.object({
      nodeId: z.string().min(1)
    })
  }),

  validateDataQuality: z.object({
    body: z.object({
      data: z.array(z.record(z.any())).min(1),
      rules: z.array(QualityRuleSchema)
    })
  }),

  createCheckpoint: z.object({
    body: z.object({
      executionId: z.string().min(1),
      nodeId: z.string().min(1),
      state: z.record(z.any()),
      processedRecords: z.number().min(0),
      lastProcessedId: z.string().optional()
    })
  }),

  handleError: z.object({
    body: z.object({
      executionId: z.string().min(1),
      nodeId: z.string().min(1),
      error: ErrorDetailsSchema,
      context: z.record(z.any()).optional()
    })
  })
};

export type CreateWorkflowRequest = z.infer<typeof etlValidators.createWorkflow>;
export type UpdateWorkflowRequest = z.infer<typeof etlValidators.updateWorkflow>;
export type GetWorkflowRequest = z.infer<typeof etlValidators.getWorkflow>;
export type DeleteWorkflowRequest = z.infer<typeof etlValidators.deleteWorkflow>;
export type ExecuteWorkflowRequest = z.infer<typeof etlValidators.executeWorkflow>;
export type GetExecutionHistoryRequest = z.infer<typeof etlValidators.getExecutionHistory>;
export type AnalyzePerformanceRequest = z.infer<typeof etlValidators.analyzePerformance>;
export type OptimizeWorkflowRequest = z.infer<typeof etlValidators.optimizeWorkflow>;
export type GetLineageRequest = z.infer<typeof etlValidators.getLineage>;
export type AnalyzeImpactRequest = z.infer<typeof etlValidators.analyzeImpact>;
export type ValidateDataQualityRequest = z.infer<typeof etlValidators.validateDataQuality>;
export type CreateCheckpointRequest = z.infer<typeof etlValidators.createCheckpoint>;
export type HandleErrorRequest = z.infer<typeof etlValidators.handleError>;
