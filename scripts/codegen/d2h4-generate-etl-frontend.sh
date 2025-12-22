#!/bin/bash
# scripts/codegen/d2h4-generate-etl-frontend.sh
# Day 2 Hour 4: Generate Visual ETL Designer Frontend Components

set -e
set -u

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h4-etl-frontend-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate ETL Frontend Types
generate_etl_frontend_types() {
    log_info "Generating ETL Frontend TypeScript types..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/types/etl.types.ts" << 'EOF'
// packages/frontend/src/types/etl.types.ts

import { Node, Edge, Connection } from 'react-flow-renderer';

export interface ETLWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  workflowDefinition: WorkflowDefinition;
  status: WorkflowStatus;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowDefinition {
  nodes: ETLFlowNode[];
  edges: ETLFlowEdge[];
  viewport: ViewportSettings;
  settings: WorkflowSettings;
}

export interface ETLFlowNode extends Node {
  id: string;
  type: ETLNodeType;
  data: ETLNodeData;
  position: { x: number; y: number };
  style?: React.CSSProperties;
  className?: string;
}

export interface ETLFlowEdge extends Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  data?: EdgeData;
}

export interface ETLNodeData {
  label: string;
  config: NodeConfig;
  metadata?: NodeMetadata;
  isValid?: boolean;
  validationErrors?: string[];
}

export interface EdgeData {
  dataType?: string;
  sampleSize?: number;
  throughput?: number;
}

export interface ViewportSettings {
  x: number;
  y: number;
  zoom: number;
}

export interface WorkflowSettings {
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  parallelExecution: boolean;
  errorHandling: ErrorHandlingStrategy;
  retryPolicy: RetryPolicy;
}

export interface NodeConfig {
  [key: string]: any;
}

export interface NodeMetadata {
  description?: string;
  tags?: string[];
  lastModified?: Date;
  performance?: PerformanceMetrics;
  documentation?: string;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  recordsProcessed: number;
  throughput: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'deprecated' | 'error';
export type ETLNodeType = 'source' | 'transform' | 'filter' | 'aggregate' | 'join' | 'lookup' | 'validate' | 'output' | 'split' | 'merge';
export type ErrorHandlingStrategy = 'stop' | 'skip' | 'retry' | 'log';

export interface DataSource {
  id: string;
  name: string;
  sourceType: SourceType;
  connectionConfig: ConnectionConfig;
  schemaDefinition?: SchemaDefinition;
  isActive: boolean;
}

export type SourceType = 'database' | 'file' | 'api' | 'stream' | 'queue';

export interface ConnectionConfig {
  [key: string]: any;
}

export interface SchemaDefinition {
  fields: FieldDefinition[];
  constraints?: SchemaConstraints;
}

export interface FieldDefinition {
  name: string;
  type: DataType;
  nullable: boolean;
  primaryKey?: boolean;
  description?: string;
}

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'decimal' | 'json' | 'array';

export interface SchemaConstraints {
  uniqueKeys?: string[][];
  foreignKeys?: ForeignKeyConstraint[];
  checks?: CheckConstraint[];
}

export interface ForeignKeyConstraint {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface CheckConstraint {
  name: string;
  expression: string;
}

export interface ExecutionHistory {
  id: string;
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  executionLog?: ExecutionLog;
  errorDetails?: ErrorDetails;
  metrics?: ExecutionMetrics;
}

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface ExecutionLog {
  steps: ExecutionStep[];
  warnings: LogEntry[];
  info: LogEntry[];
}

export interface ExecutionStep {
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  recordsProcessed?: number;
  errors?: ErrorDetails[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: any;
}

export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  context?: any;
}

export interface ExecutionMetrics {
  totalRecordsProcessed: number;
  totalExecutionTime: number;
  avgThroughput: number;
  memoryPeak: number;
  nodeMetrics: { [nodeId: string]: PerformanceMetrics };
}

export interface QualityRule {
  id: string;
  name: string;
  ruleType: QualityRuleType;
  ruleDefinition: QualityRuleDefinition;
  severity: QualitySeverity;
  isActive: boolean;
}

export type QualityRuleType = 'completeness' | 'uniqueness' | 'validity' | 'consistency' | 'accuracy' | 'timeliness';
export type QualitySeverity = 'info' | 'warning' | 'error' | 'critical';

export interface QualityRuleDefinition {
  targetField?: string;
  condition: string;
  threshold?: number;
  customLogic?: string;
}

export interface NodeToolboxItem {
  type: ETLNodeType;
  label: string;
  icon: string;
  description: string;
  category: NodeCategory;
  defaultConfig: NodeConfig;
}

export type NodeCategory = 'input' | 'processing' | 'output' | 'quality' | 'utility';

export interface CanvasSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  miniMapVisible: boolean;
  controlsVisible: boolean;
  zoomOnScroll: boolean;
  panOnScroll: boolean;
  preventScrolling: boolean;
}

export interface WorkflowValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: 'node' | 'edge' | 'workflow';
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  nodeId?: string;
  message: string;
  recommendation?: string;
}

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: ETLFlowNode[];
  edges: ETLFlowEdge[];
  parameters: TemplateParameter[];
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description?: string;
}

export interface ETLDesignerState {
  workflows: ETLWorkflow[];
  currentWorkflow: ETLWorkflow | null;
  nodes: ETLFlowNode[];
  edges: ETLFlowEdge[];
  selectedNodes: string[];
  selectedEdges: string[];
  canvasSettings: CanvasSettings;
  toolbox: NodeToolboxItem[];
  templates: NodeTemplate[];
  dataSources: DataSource[];
  executionHistory: ExecutionHistory[];
  isExecuting: boolean;
  validationResults: WorkflowValidation;
}
EOF

    log_success "ETL Frontend TypeScript types generated"
}

# Generate Visual ETL Designer Main Component
generate_etl_designer_component() {
    log_info "Generating Visual ETL Designer main component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/etl/designer/ETLDesigner.tsx" << 'EOF'
// packages/frontend/src/components/etl/designer/ETLDesigner.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Button,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  GridOn as GridIcon,
  Add as AddIcon
} from '@mui/icons-material';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  ReactFlowProvider,
  useReactFlow
} from 'react-flow-renderer';

import { ETLToolbox } from './ETLToolbox';
import { ETLNodeConfigPanel } from './ETLNodeConfigPanel';
import { ETLExecutionPanel } from './ETLExecutionPanel';
import { ETLWorkflowSettings } from './ETLWorkflowSettings';
import { SourceNode } from '../nodes/SourceNode';
import { TransformNode } from '../nodes/TransformNode';
import { FilterNode } from '../nodes/FilterNode';
import { AggregateNode } from '../nodes/AggregateNode';
import { JoinNode } from '../nodes/JoinNode';
import { ValidateNode } from '../nodes/ValidateNode';
import { OutputNode } from '../nodes/OutputNode';
import { useETLDesigner } from '../../../hooks/etl/useETLDesigner';
import { ETLWorkflow, ETLFlowNode, ETLFlowEdge, CanvasSettings } from '../../../types/etl.types';

const nodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  filter: FilterNode,
  aggregate: AggregateNode,
  join: JoinNode,
  validate: ValidateNode,
  output: OutputNode
};

interface ETLDesignerProps {
  workflowId?: string;
  onSave?: (workflow: ETLWorkflow) => void;
  onExecute?: (workflowId: string) => void;
  readOnly?: boolean;
}

export const ETLDesigner: React.FC<ETLDesignerProps> = ({
  workflowId,
  onSave,
  onExecute,
  readOnly = false
}) => {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<ETLFlowNode | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    miniMapVisible: true,
    controlsVisible: true,
    zoomOnScroll: true,
    panOnScroll: false,
    preventScrolling: false
  });

  // Custom hooks
  const {
    currentWorkflow,
    isExecuting,
    executionHistory,
    validationResults,
    saveWorkflow,
    executeWorkflow,
    pauseExecution,
    stopExecution,
    validateWorkflow,
    loadWorkflow
  } = useETLDesigner();

  const reactFlowInstance = useReactFlow();

  // Load workflow if ID provided
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId, loadWorkflow]);

  // Update nodes and edges when workflow changes
  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.workflowDefinition.nodes);
      setEdges(currentWorkflow.workflowDefinition.edges);
      setWorkflowName(currentWorkflow.name);
      setWorkflowDescription(currentWorkflow.description || '');
    }
  }, [currentWorkflow, setNodes, setEdges]);

  // Validate workflow when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      validateWorkflow(nodes, edges);
    }
  }, [nodes, edges, validateWorkflow]);

  // Handle connecting nodes
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edge: ETLFlowEdge = {
        id: `edge-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        type: 'default',
        animated: true,
        data: {
          dataType: 'mixed'
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as ETLFlowNode);
  }, []);

  // Handle node drag and drop from toolbox
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      const newNode: ETLFlowNode = {
        id: `${type}-${Date.now()}`,
        type: type as any,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          config: {},
          isValid: true
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle saving workflow
  const handleSave = useCallback(async () => {
    if (!workflowName.trim()) {
      setShowSaveDialog(true);
      return;
    }

    const workflowDefinition = {
      nodes,
      edges,
      viewport: reactFlowInstance.getViewport(),
      settings: {
        gridEnabled: canvasSettings.showGrid,
        snapToGrid: canvasSettings.snapToGrid,
        gridSize: canvasSettings.gridSize,
        parallelExecution: true,
        errorHandling: 'stop' as const,
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential' as const,
          initialDelay: 1000,
          maxDelay: 30000
        }
      }
    };

    try {
      const savedWorkflow = await saveWorkflow(
        workflowName,
        workflowDescription,
        workflowDefinition
      );
      
      if (onSave) {
        onSave(savedWorkflow);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [
    workflowName,
    workflowDescription,
    nodes,
    edges,
    canvasSettings,
    reactFlowInstance,
    saveWorkflow,
    onSave
  ]);

  // Handle executing workflow
  const handleExecute = useCallback(async () => {
    if (!currentWorkflow?.id) {
      await handleSave();
      return;
    }

    try {
      await executeWorkflow(currentWorkflow.id);
      
      if (onExecute) {
        onExecute(currentWorkflow.id);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  }, [currentWorkflow, executeWorkflow, onExecute, handleSave]);

  // Handle node configuration updates
  const handleNodeConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config: { ...node.data.config, ...config }
                }
              }
            : node
        )
      );
    },
    [setNodes]
  );

  // Zoom and fit controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  // Memoized validation status
  const validationStatus = useMemo(() => {
    if (!validationResults) return null;
    
    if (validationResults.errors.length > 0) {
      return { type: 'error', count: validationResults.errors.length };
    }
    
    if (validationResults.warnings.length > 0) {
      return { type: 'warning', count: validationResults.warnings.length };
    }
    
    return { type: 'success', count: 0 };
  }, [validationResults]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ETL Designer - {workflowName || 'Untitled Workflow'}
          </Typography>
          
          {/* Validation Status */}
          {validationStatus && (
            <Chip
              label={`${validationStatus.count} ${validationStatus.type}${validationStatus.count !== 1 ? 's' : ''}`}
              color={validationStatus.type === 'error' ? 'error' : validationStatus.type === 'warning' ? 'warning' : 'success'}
              size="small"
              sx={{ mr: 2 }}
            />
          )}

          {/* Execution Status */}
          {isExecuting && (
            <Chip
              label="Executing"
              color="info"
              size="small"
              sx={{ mr: 2 }}
            />
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Canvas Controls */}
          <IconButton onClick={handleZoomIn} title="Zoom In">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleFitView} title="Fit View">
            <FitScreenIcon />
          </IconButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Workflow Actions */}
          {!readOnly && (
            <>
              <IconButton onClick={handleSave} title="Save Workflow">
                <SaveIcon />
              </IconButton>
              
              {!isExecuting ? (
                <IconButton 
                  onClick={handleExecute} 
                  title="Execute Workflow"
                  color="primary"
                >
                  <PlayIcon />
                </IconButton>
              ) : (
                <>
                  <IconButton 
                    onClick={() => pauseExecution()} 
                    title="Pause Execution"
                    color="warning"
                  >
                    <PauseIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => stopExecution()} 
                    title="Stop Execution"
                    color="error"
                  >
                    <StopIcon />
                  </IconButton>
                </>
              )}
            </>
          )}

          <IconButton onClick={() => setShowSettings(true)} title="Settings">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Toolbox */}
        {!readOnly && (
          <ETLToolbox />
        )}

        {/* Canvas */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid={canvasSettings.snapToGrid}
            snapGrid={[canvasSettings.gridSize, canvasSettings.gridSize]}
            deleteKeyCode={readOnly ? null : 'Delete'}
          >
            <Background 
              variant="grid" 
              gap={canvasSettings.gridSize}
              visible={canvasSettings.showGrid}
            />
            
            {canvasSettings.controlsVisible && (
              <Controls 
                showZoom={true}
                showFitView={true}
                showInteractive={!readOnly}
              />
            )}
            
            {canvasSettings.miniMapVisible && (
              <MiniMap 
                nodeColor="var(--node-color)"
                nodeStrokeColor="var(--node-stroke-color)"
                nodeClassName="minimap-node"
                maskColor="rgba(0, 0, 0, 0.1)"
              />
            )}
          </ReactFlow>
        </Box>

        {/* Configuration Panel */}
        {selectedNode && !readOnly && (
          <ETLNodeConfigPanel
            node={selectedNode}
            onConfigUpdate={handleNodeConfigUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Execution Panel */}
        {(isExecuting || executionHistory.length > 0) && (
          <ETLExecutionPanel
            executionHistory={executionHistory}
            isExecuting={isExecuting}
            onClose={() => {}}
          />
        )}
      </Box>

      {/* Settings Dialog */}
      <ETLWorkflowSettings
        open={showSettings}
        canvasSettings={canvasSettings}
        onCanvasSettingsChange={setCanvasSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowSaveDialog(false);
              handleSave();
            }}
            variant="contained"
            disabled={!workflowName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Wrapper with ReactFlowProvider
export const ETLDesignerWithProvider: React.FC<ETLDesignerProps> = (props) => (
  <ReactFlowProvider>
    <ETLDesigner {...props} />
  </ReactFlowProvider>
);

export default ETLDesignerWithProvider;
EOF

    log_success "Visual ETL Designer main component generated"
}

# Generate ETL Toolbox Component
generate_etl_toolbox() {
    log_info "Generating ETL Toolbox component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/etl/designer/ETLToolbox.tsx" << 'EOF'
// packages/frontend/src/components/etl/designer/ETLToolbox.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  Input as InputIcon,
  Transform as TransformIcon,
  FilterList as FilterIcon,
  Functions as AggregateIcon,
  AccountTree as JoinIcon,
  CheckCircle as ValidateIcon,
  Output as OutputIcon,
  CallSplit as SplitIcon,
  CallMerge as MergeIcon,
  Storage as DatabaseIcon,
  InsertDriveFile as FileIcon,
  Api as ApiIcon,
  Stream as StreamIcon
} from '@mui/icons-material';

import { NodeToolboxItem, NodeCategory, ETLNodeType } from '../../../types/etl.types';

const nodeCategories: { [key in NodeCategory]: { 
  label: string; 
  icon: React.ReactElement; 
  color: string; 
} } = {
  input: {
    label: 'Data Sources',
    icon: <InputIcon />,
    color: '#2196f3'
  },
  processing: {
    label: 'Processing',
    icon: <TransformIcon />,
    color: '#ff9800'
  },
  output: {
    label: 'Outputs',
    icon: <OutputIcon />,
    color: '#4caf50'
  },
  quality: {
    label: 'Data Quality',
    icon: <ValidateIcon />,
    color: '#9c27b0'
  },
  utility: {
    label: 'Utilities',
    icon: <SplitIcon />,
    color: '#607d8b'
  }
};

const toolboxItems: NodeToolboxItem[] = [
  // Input Nodes
  {
    type: 'source',
    label: 'Database Source',
    icon: 'database',
    description: 'Connect to SQL databases (PostgreSQL, MySQL, SQL Server)',
    category: 'input',
    defaultConfig: {
      sourceType: 'database',
      connectionId: '',
      query: 'SELECT * FROM table_name',
      refreshInterval: '1h'
    }
  },
  {
    type: 'source',
    label: 'File Source',
    icon: 'file',
    description: 'Read data from CSV, Excel, JSON files',
    category: 'input',
    defaultConfig: {
      sourceType: 'file',
      filePath: '',
      fileType: 'csv',
      hasHeader: true
    }
  },
  {
    type: 'source',
    label: 'API Source',
    icon: 'api',
    description: 'Fetch data from REST APIs',
    category: 'input',
    defaultConfig: {
      sourceType: 'api',
      url: '',
      method: 'GET',
      headers: {},
      refreshInterval: '5m'
    }
  },
  
  // Processing Nodes
  {
    type: 'transform',
    label: 'Transform',
    icon: 'transform',
    description: 'Apply data transformations (map, calculate, format)',
    category: 'processing',
    defaultConfig: {
      transformations: []
    }
  },
  {
    type: 'filter',
    label: 'Filter',
    icon: 'filter',
    description: 'Filter records based on conditions',
    category: 'processing',
    defaultConfig: {
      conditions: []
    }
  },
  {
    type: 'aggregate',
    label: 'Aggregate',
    icon: 'aggregate',
    description: 'Group and aggregate data (sum, count, average)',
    category: 'processing',
    defaultConfig: {
      groupBy: [],
      aggregations: []
    }
  },
  {
    type: 'join',
    label: 'Join',
    icon: 'join',
    description: 'Join data from multiple sources',
    category: 'processing',
    defaultConfig: {
      joinType: 'inner',
      leftKey: '',
      rightKey: ''
    }
  },
  
  // Quality Nodes
  {
    type: 'validate',
    label: 'Validate',
    icon: 'validate',
    description: 'Validate data quality and compliance',
    category: 'quality',
    defaultConfig: {
      rules: [],
      includeInvalid: false
    }
  },
  
  // Output Nodes
  {
    type: 'output',
    label: 'Database Output',
    icon: 'database',
    description: 'Write data to databases',
    category: 'output',
    defaultConfig: {
      outputType: 'database',
      table: '',
      writeMode: 'insert'
    }
  },
  {
    type: 'output',
    label: 'File Output',
    icon: 'file',
    description: 'Export data to files',
    category: 'output',
    defaultConfig: {
      outputType: 'file',
      filePath: '',
      fileType: 'csv'
    }
  },
  
  // Utility Nodes
  {
    type: 'split',
    label: 'Split',
    icon: 'split',
    description: 'Split data stream into multiple paths',
    category: 'utility',
    defaultConfig: {
      splitConditions: []
    }
  },
  {
    type: 'merge',
    label: 'Merge',
    icon: 'merge',
    description: 'Merge multiple data streams',
    category: 'utility',
    defaultConfig: {
      mergeStrategy: 'union'
    }
  }
];

const getNodeIcon = (iconType: string) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    database: <DatabaseIcon />,
    file: <FileIcon />,
    api: <ApiIcon />,
    stream: <StreamIcon />,
    transform: <TransformIcon />,
    filter: <FilterIcon />,
    aggregate: <AggregateIcon />,
    join: <JoinIcon />,
    validate: <ValidateIcon />,
    split: <SplitIcon />,
    merge: <MergeIcon />
  };
  
  return iconMap[iconType] || <TransformIcon />;
};

interface ETLToolboxProps {
  onNodeSelect?: (nodeType: ETLNodeType, config: any) => void;
}

export const ETLToolbox: React.FC<ETLToolboxProps> = ({ onNodeSelect }) => {
  const [expandedCategories, setExpandedCategories] = useState<NodeCategory[]>(['input', 'processing']);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCategoryToggle = (category: NodeCategory) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDragStart = (event: React.DragEvent, nodeType: ETLNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredItems = toolboxItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key in NodeCategory]: NodeToolboxItem[] });

  return (
    <Paper
      elevation={2}
      sx={{
        width: 300,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          ETL Toolbox
        </Typography>
        
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Node Categories */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {Object.entries(nodeCategories).map(([category, categoryInfo]) => {
            const categoryItems = groupedItems[category as NodeCategory] || [];
            const isExpanded = expandedCategories.includes(category as NodeCategory);
            
            if (categoryItems.length === 0) return null;

            return (
              <React.Fragment key={category}>
                {/* Category Header */}
                <ListItem
                  button
                  onClick={() => handleCategoryToggle(category as NodeCategory)}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: categoryInfo.color }}>
                    {categoryInfo.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={categoryInfo.label}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip 
                    label={categoryItems.length} 
                    size="small" 
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItem>

                {/* Category Items */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {categoryItems.map((item) => (
                      <Tooltip
                        key={`${item.type}-${item.label}`}
                        title={item.description}
                        placement="right"
                        arrow
                      >
                        <ListItem
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.type)}
                          onClick={() => onNodeSelect?.(item.type, item.defaultConfig)}
                          sx={{
                            pl: 4,
                            cursor: 'move',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            },
                            '&:active': {
                              bgcolor: 'action.selected'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {getNodeIcon(item.icon)}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            secondary={item.description}
                            secondaryTypographyProps={{
                              fontSize: '0.75rem',
                              noWrap: true
                            }}
                          />
                        </ListItem>
                      </Tooltip>
                    ))}
                  </List>
                </Collapse>

                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Drag nodes to the canvas to create your ETL workflow
        </Typography>
      </Box>
    </Paper>
  );
};

export default ETLToolbox;
EOF

    log_success "ETL Toolbox component generated"
}

# Generate ETL Node Config Panel
generate_etl_node_config_panel() {
    log_info "Generating ETL Node Configuration Panel..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/etl/designer/ETLNodeConfigPanel.tsx" << 'EOF'
// packages/frontend/src/components/etl/designer/ETLNodeConfigPanel.tsx

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Code as CodeIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { ETLFlowNode } from '../../../types/etl.types';

interface ETLNodeConfigPanelProps {
  node: ETLFlowNode;
  onConfigUpdate: (nodeId: string, config: any) => void;
  onClose: () => void;
}

export const ETLNodeConfigPanel: React.FC<ETLNodeConfigPanelProps> = ({
  node,
  onConfigUpdate,
  onClose
}) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [showTransformDialog, setShowTransformDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [editingTransform, setEditingTransform] = useState<any>(null);
  const [editingFilter, setEditingFilter] = useState<any>(null);
  const [editingValidation, setEditingValidation] = useState<any>(null);

  const handleConfigChange = useCallback((key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigUpdate(node.id, newConfig);
  }, [config, node.id, onConfigUpdate]);

  const renderSourceConfig = () => (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel>Source Type</InputLabel>
        <Select
          value={config.sourceType || ''}
          onChange={(e) => handleConfigChange('sourceType', e.target.value)}
        >
          <MenuItem value="database">Database</MenuItem>
          <MenuItem value="file">File</MenuItem>
          <MenuItem value="api">API</MenuItem>
          <MenuItem value="stream">Stream</MenuItem>
        </Select>
      </FormControl>

      {config.sourceType === 'database' && (
        <>
          <TextField
            fullWidth
            label="Connection ID"
            value={config.connectionId || ''}
            onChange={(e) => handleConfigChange('connectionId', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="SQL Query"
            value={config.query || ''}
            onChange={(e) => handleConfigChange('query', e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="SELECT * FROM table_name WHERE condition"
          />
          <TextField
            fullWidth
            label="Refresh Interval"
            value={config.refreshInterval || ''}
            onChange={(e) => handleConfigChange('refreshInterval', e.target.value)}
            margin="normal"
            placeholder="1h, 30m, 5s"
          />
        </>
      )}

      {config.sourceType === 'file' && (
        <>
          <TextField
            fullWidth
            label="File Path"
            value={config.filePath || ''}
            onChange={(e) => handleConfigChange('filePath', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>File Type</InputLabel>
            <Select
              value={config.fileType || ''}
              onChange={(e) => handleConfigChange('fileType', e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="xml">XML</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={config.hasHeader || false}
                onChange={(e) => handleConfigChange('hasHeader', e.target.checked)}
              />
            }
            label="Has Header Row"
          />
        </>
      )}

      {config.sourceType === 'api' && (
        <>
          <TextField
            fullWidth
            label="API URL"
            value={config.url || ''}
            onChange={(e) => handleConfigChange('url', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>HTTP Method</InputLabel>
            <Select
              value={config.method || 'GET'}
              onChange={(e) => handleConfigChange('method', e.target.value)}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Headers (JSON)"
            value={JSON.stringify(config.headers || {}, null, 2)}
            onChange={(e) => {
              try {
                const headers = JSON.parse(e.target.value);
                handleConfigChange('headers', headers);
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            margin="normal"
            multiline
            rows={3}
          />
        </>
      )}
    </Box>
  );

  const renderTransformConfig = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Transformations</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowTransformDialog(true)}
          size="small"
        >
          Add Transform
        </Button>
      </Box>

      <List>
        {(config.transformations || []).map((transform: any, index: number) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={transform.type}
              secondary={transform.description || `${transform.type} transformation`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => {
                  setEditingTransform({ ...transform, index });
                  setShowTransformDialog(true);
                }}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => {
                  const newTransforms = [...(config.transformations || [])];
                  newTransforms.splice(index, 1);
                  handleConfigChange('transformations', newTransforms);
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {(!config.transformations || config.transformations.length === 0) && (
        <Alert severity="info">
          No transformations configured. Click "Add Transform" to get started.
        </Alert>
      )}
    </Box>
  );

  const renderFilterConfig = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Filter Conditions</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowFilterDialog(true)}
          size="small"
        >
          Add Condition
        </Button>
      </Box>

      <List>
        {(config.conditions || []).map((condition: any, index: number) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={`${condition.field} ${condition.operator} ${condition.value}`}
              secondary={`Filter records where condition is true`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => {
                  setEditingFilter({ ...condition, index });
                  setShowFilterDialog(true);
                }}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => {
                  const newConditions = [...(config.conditions || [])];
                  newConditions.splice(index, 1);
                  handleConfigChange('conditions', newConditions);
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderAggregateConfig = () => (
    <Box>
      <TextField
        fullWidth
        label="Group By Fields (comma-separated)"
        value={Array.isArray(config.groupBy) ? config.groupBy.join(', ') : ''}
        onChange={(e) => {
          const fields = e.target.value.split(',').map(f => f.trim()).filter(f => f);
          handleConfigChange('groupBy', fields);
        }}
        margin="normal"
        placeholder="field1, field2, field3"
      />

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Aggregations
      </Typography>
      
      {(config.aggregations || []).map((agg: any, index: number) => (
        <Box key={index} sx={{ border: 1, borderColor: 'divider', p: 2, mb: 1, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Field"
                value={agg.field || ''}
                onChange={(e) => {
                  const newAggs = [...(config.aggregations || [])];
                  newAggs[index] = { ...agg, field: e.target.value };
                  handleConfigChange('aggregations', newAggs);
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Function</InputLabel>
                <Select
                  value={agg.function || ''}
                  onChange={(e) => {
                    const newAggs = [...(config.aggregations || [])];
                    newAggs[index] = { ...agg, function: e.target.value };
                    handleConfigChange('aggregations', newAggs);
                  }}
                >
                  <MenuItem value="count">Count</MenuItem>
                  <MenuItem value="sum">Sum</MenuItem>
                  <MenuItem value="avg">Average</MenuItem>
                  <MenuItem value="min">Minimum</MenuItem>
                  <MenuItem value="max">Maximum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Output Field"
                value={agg.outputField || ''}
                onChange={(e) => {
                  const newAggs = [...(config.aggregations || [])];
                  newAggs[index] = { ...agg, outputField: e.target.value };
                  handleConfigChange('aggregations', newAggs);
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton
                onClick={() => {
                  const newAggs = [...(config.aggregations || [])];
                  newAggs.splice(index, 1);
                  handleConfigChange('aggregations', newAggs);
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          const newAggs = [...(config.aggregations || []), { field: '', function: 'count', outputField: '' }];
          handleConfigChange('aggregations', newAggs);
        }}
        size="small"
      >
        Add Aggregation
      </Button>
    </Box>
  );

  const renderJoinConfig = () => (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel>Join Type</InputLabel>
        <Select
          value={config.joinType || 'inner'}
          onChange={(e) => handleConfigChange('joinType', e.target.value)}
        >
          <MenuItem value="inner">Inner Join</MenuItem>
          <MenuItem value="left">Left Join</MenuItem>
          <MenuItem value="right">Right Join</MenuItem>
          <MenuItem value="full">Full Outer Join</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Left Key Field"
        value={config.leftKey || ''}
        onChange={(e) => handleConfigChange('leftKey', e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Right Key Field"
        value={config.rightKey || ''}
        onChange={(e) => handleConfigChange('rightKey', e.target.value)}
        margin="normal"
      />
    </Box>
  );

  const renderValidateConfig = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Validation Rules</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowValidationDialog(true)}
          size="small"
        >
          Add Rule
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={config.includeInvalid || false}
            onChange={(e) => handleConfigChange('includeInvalid', e.target.checked)}
          />
        }
        label="Include Invalid Records in Output"
      />

      <List>
        {(config.rules || []).map((rule: any, index: number) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={`${rule.field}: ${rule.type}`}
              secondary={rule.description || `Validate ${rule.field} is ${rule.type}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => {
                  setEditingValidation({ ...rule, index });
                  setShowValidationDialog(true);
                }}
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => {
                  const newRules = [...(config.rules || [])];
                  newRules.splice(index, 1);
                  handleConfigChange('rules', newRules);
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderOutputConfig = () => (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel>Output Type</InputLabel>
        <Select
          value={config.outputType || ''}
          onChange={(e) => handleConfigChange('outputType', e.target.value)}
        >
          <MenuItem value="database">Database</MenuItem>
          <MenuItem value="file">File</MenuItem>
          <MenuItem value="api">API</MenuItem>
        </Select>
      </FormControl>

      {config.outputType === 'database' && (
        <>
          <TextField
            fullWidth
            label="Table Name"
            value={config.table || ''}
            onChange={(e) => handleConfigChange('table', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Write Mode</InputLabel>
            <Select
              value={config.writeMode || 'insert'}
              onChange={(e) => handleConfigChange('writeMode', e.target.value)}
            >
              <MenuItem value="insert">Insert</MenuItem>
              <MenuItem value="upsert">Upsert</MenuItem>
              <MenuItem value="truncate">Truncate & Insert</MenuItem>
            </Select>
          </FormControl>
          {config.writeMode === 'upsert' && (
            <TextField
              fullWidth
              label="Key Columns (comma-separated)"
              value={Array.isArray(config.keyColumns) ? config.keyColumns.join(', ') : ''}
              onChange={(e) => {
                const columns = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                handleConfigChange('keyColumns', columns);
              }}
              margin="normal"
            />
          )}
        </>
      )}

      {config.outputType === 'file' && (
        <>
          <TextField
            fullWidth
            label="File Path"
            value={config.filePath || ''}
            onChange={(e) => handleConfigChange('filePath', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>File Type</InputLabel>
            <Select
              value={config.fileType || 'csv'}
              onChange={(e) => handleConfigChange('fileType', e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
    </Box>
  );

  const renderNodeConfig = () => {
    switch (node.type) {
      case 'source':
        return renderSourceConfig();
      case 'transform':
        return renderTransformConfig();
      case 'filter':
        return renderFilterConfig();
      case 'aggregate':
        return renderAggregateConfig();
      case 'join':
        return renderJoinConfig();
      case 'validate':
        return renderValidateConfig();
      case 'output':
        return renderOutputConfig();
      default:
        return (
          <Alert severity="info">
            Configuration panel for {node.type} node is not implemented yet.
          </Alert>
        );
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 400,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {node.data.label}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Node ID: {node.id}
        </Typography>
        
        <Chip
          label={node.type}
          size="small"
          color="primary"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Configuration Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Basic Properties */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Basic Properties</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              label="Node Label"
              value={node.data.label}
              onChange={(e) => {
                // Update node label through parent
                onConfigUpdate(node.id, { ...config, _label: e.target.value });
              }}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={node.data.metadata?.description || ''}
              onChange={(e) => {
                onConfigUpdate(node.id, { 
                  ...config, 
                  _metadata: { 
                    ...node.data.metadata, 
                    description: e.target.value 
                  } 
                });
              }}
              margin="normal"
              multiline
              rows={2}
            />
          </AccordionDetails>
        </Accordion>

        {/* Node-specific Configuration */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {renderNodeConfig()}
          </AccordionDetails>
        </Accordion>

        {/* Performance Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Performance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              label="Batch Size"
              type="number"
              value={config.batchSize || ''}
              onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value) || 1000)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Timeout (seconds)"
              type="number"
              value={config.timeout || ''}
              onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value) || 300)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={config.priority || 'normal'}
                onChange={(e) => handleConfigChange('priority', e.target.value)}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* TODO: Add dialogs for transform, filter, and validation configuration */}
    </Paper>
  );
};

export default ETLNodeConfigPanel;
EOF

    log_success "ETL Node Configuration Panel generated"
}

# Main execution function
main() {
    log_info "🚀 Starting Day 2 Hour 4: ETL Frontend Components Generation"
    log_info "=================================================================="
    
    # Generate frontend types
    generate_etl_frontend_types
    
    # Generate main components
    generate_etl_designer_component
    generate_etl_toolbox
    generate_etl_node_config_panel
    
    log_success "=================================================================="
    log_success "✅ Day 2 Hour 4: ETL Frontend Components Generation Completed!"
    log_success "=================================================================="
    log_info "Generated Components:"
    log_info "1. ✅ ETL Frontend TypeScript Types"
    log_info "2. ✅ Visual ETL Designer Main Component"
    log_info "3. ✅ ETL Toolbox with Drag & Drop"
    log_info "4. ✅ ETL Node Configuration Panel"
    log_info ""
    log_info "🔗 Next: Run ./scripts/codegen/d2h4-generate-etl-data-quality.sh"
}

# Execute main function
main "$@"