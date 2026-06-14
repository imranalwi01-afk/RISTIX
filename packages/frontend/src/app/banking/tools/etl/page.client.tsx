'use client';
// packages/frontend/src/app/banking/tools/etl/page.tsx
// ============================================================================
// IFRS9 FRONTEND - ETL WORKFLOW DESIGNER WITH REACT FLOW
// ============================================================================
// Purpose: Interactive visual workflow designer for ETL data processing pipelines
// Features: Full drag & drop, node connections, workflow validation, real-time editing
// Updated: 2025-01-11T15:30:00Z
// ============================================================================


import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ListItemButton from '@mui/material/ListItemButton'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Tooltip from '@mui/material/Tooltip'
import WorkflowIcon from '@mui/icons-material/AccountTree'
import HomeIcon from '@mui/icons-material/Home'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import RunIcon from '@mui/icons-material/PlayArrow'
import SettingsIcon from '@mui/icons-material/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SourceIcon from '@mui/icons-material/DataObject'
import TransformIcon from '@mui/icons-material/Transform'
import FilterIcon from '@mui/icons-material/FilterAlt'
import AggregateIcon from '@mui/icons-material/Functions'
import JoinIcon from '@mui/icons-material/MergeType'
import LookupIcon from '@mui/icons-material/Search'
import ValidateIcon from '@mui/icons-material/CheckCircle'
import OutputIcon from '@mui/icons-material/Output'
import SplitIcon from '@mui/icons-material/CallSplit'
import MergeIcon from '@mui/icons-material/CallMerge'
import CloseIcon from '@mui/icons-material/Close'
import FitScreenIcon from '@mui/icons-material/FitScreen'
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';

// React Flow imports
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  Panel,
  NodeTypes,
  Handle,
  Position as HandlePosition,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ETL Node Types
type NodeType = 'source' | 'transform' | 'filter' | 'aggregate' | 'join' | 'lookup' | 'validate' | 'output' | 'split' | 'merge';
type WorkflowStatus = 'draft' | 'active' | 'paused' | 'deprecated' | 'error';

// Node configuration templates
const nodeTemplates = {
  source: {
    icon: SourceIcon,
    color: '#2e7d32',
    label: 'Source',
    config: { sourceType: 'file', path: '', format: 'csv' }
  },
  transform: {
    icon: TransformIcon,
    color: '#1976d2',
    label: 'Transform',
    config: { transformType: 'map', expression: '', outputFields: [] }
  },
  filter: {
    icon: FilterIcon,
    color: '#f57c00',
    label: 'Filter',
    config: { condition: '', operator: 'equals' }
  },
  aggregate: {
    icon: AggregateIcon,
    color: '#7b1fa2',
    label: 'Aggregate',
    config: { groupBy: [], aggregations: [] }
  },
  join: {
    icon: JoinIcon,
    color: '#c62828',
    label: 'Join',
    config: { joinType: 'inner', leftKey: '', rightKey: '' }
  },
  lookup: {
    icon: LookupIcon,
    color: '#00796b',
    label: 'Lookup',
    config: { lookupTable: '', matchKey: '', returnFields: [] }
  },
  validate: {
    icon: ValidateIcon,
    color: '#558b2f',
    label: 'Validate',
    config: { rules: [], onFailure: 'reject' }
  },
  output: {
    icon: OutputIcon,
    color: '#5d4037',
    label: 'Output',
    config: { destination: 'database', table: '', format: 'json' }
  },
  split: {
    icon: SplitIcon,
    color: '#455a64',
    label: 'Split',
    config: { splitBy: 'condition', conditions: [] }
  },
  merge: {
    icon: MergeIcon,
    color: '#6a1b9a',
    label: 'Merge',
    config: { mergeStrategy: 'union', deduplication: true }
  }
};

// Interface definitions
interface ETLWorkflow {
  id: string;
  name: string;
  description?: string;
  workflowDefinition: WorkflowDefinition;
  status: WorkflowStatus;
  version: number;
  nodes: Node[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowDefinition {
  nodes: ETLNode[];
  connections: NodeConnection[];
  settings: {
    parallelExecution: boolean;
    errorHandling: 'stop' | 'skip' | 'retry' | 'log';
    retryPolicy: {
      maxAttempts: number;
      backoffStrategy: 'linear' | 'exponential';
      initialDelay: number;
    };
  };
}

interface ETLNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Initial workflows data
const initialWorkflows: ETLWorkflow[] = [
  {
    id: '1',
    name: 'Customer Data Processing',
    description: 'Process and validate customer data from multiple sources',
    status: 'active',
    version: 1,
    workflowDefinition: {
      nodes: [],
      connections: [],
      settings: {
        parallelExecution: true,
        errorHandling: 'retry',
        retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000 }
      }
    },
    nodes: [
      {
        id: '1',
        type: 'etlNode',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'source',
          label: 'Customer CSV',
          config: { sourceType: 'file', path: '/data/customers.csv', format: 'csv' }
        },
      },
      {
        id: '2',
        type: 'etlNode',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'validate',
          label: 'Data Validation',
          config: { rules: ['email_format', 'phone_format'], onFailure: 'reject' }
        },
      },
      {
        id: '3',
        type: 'etlNode',
        position: { x: 100, y: 300 },
        data: {
          nodeType: 'output',
          label: 'Clean Customers',
          config: { destination: 'database', table: 'clean_customers', format: 'json' }
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'IFRS9 Data Pipeline',
    description: 'IFRS9 calculation data preparation pipeline',
    status: 'draft',
    version: 1,
    workflowDefinition: {
      nodes: [],
      connections: [],
      settings: {
        parallelExecution: false,
        errorHandling: 'stop',
        retryPolicy: { maxAttempts: 1, backoffStrategy: 'linear', initialDelay: 500 }
      }
    },
    nodes: [
      {
        id: '1',
        type: 'etlNode',
        position: { x: 50, y: 100 },
        data: {
          nodeType: 'source',
          label: 'Portfolio Data',
          config: { sourceType: 'database', table: 'portfolio_accounts', format: 'json' }
        },
      },
      {
        id: '2',
        type: 'etlNode',
        position: { x: 250, y: 100 },
        data: {
          nodeType: 'source',
          label: 'Market Data',
          config: { sourceType: 'api', endpoint: '/market-data', format: 'json' }
        },
      },
      {
        id: '3',
        type: 'etlNode',
        position: { x: 150, y: 250 },
        data: {
          nodeType: 'join',
          label: 'Data Join',
          config: { joinType: 'inner', leftKey: 'account_id', rightKey: 'account_ref' }
        },
      },
      {
        id: '4',
        type: 'etlNode',
        position: { x: 150, y: 350 },
        data: {
          nodeType: 'transform',
          label: 'ECL Transform',
          config: { transformType: 'calculate_ecl', expression: 'pd * lgd * ead', outputFields: ['ecl_amount'] }
        },
      },
      {
        id: '5',
        type: 'etlNode',
        position: { x: 150, y: 450 },
        data: {
          nodeType: 'output',
          label: 'IFRS9 Results',
          config: { destination: 'database', table: 'ifrs9_calculations', format: 'json' }
        },
      },
    ],
    edges: [
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        type: 'smoothstep',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep',
      },
      {
        id: 'e3-4',
        source: '3',
        target: '4',
        type: 'smoothstep',
      },
      {
        id: 'e4-5',
        source: '4',
        target: '5',
        type: 'smoothstep',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Custom Node Component
const ETLNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  const template = nodeTemplates[data.nodeType as NodeType];
  const IconComponent = template?.icon || SourceIcon;

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        padding: 2,
        minWidth: 150,
        textAlign: 'center',
        border: selected ? 3 : 1,
        borderColor: selected ? 'primary.main' : 'grey.300',
        backgroundColor: selected ? template?.color + '30' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 6,
          backgroundColor: template?.color + '20',
          transform: 'scale(1.02)'
        }
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={HandlePosition.Top}
        style={{
          background: template?.color,
          width: 10,
          height: 10,
          border: '2px solid white',
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <IconComponent
          sx={{
            color: template?.color,
            fontSize: 32
          }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {data.label || template?.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {data.nodeType}
        </Typography>
        {selected && (
          <Chip
            size="small"
            label="Selected"
            color="primary"
            sx={{ fontSize: 10, height: 16 }}
          />
        )}
      </Box>

      {/* Output Handle */}
      <Handle
        type="source"
        position={HandlePosition.Bottom}
        style={{
          background: template?.color,
          width: 10,
          height: 10,
          border: '2px solid white',
        }}
      />
    </Paper>
  );
};

function ETLWorkflowDesignerContent() {
  const { hasAnyPermission } = usePermission();
  const canViewToolsEtl = hasAnyPermission(['banking.tools.etl.view', 'banking.tools.etl.manage', 'banking.tools.manage']);
  const canManageToolsEtl = hasAnyPermission(['banking.tools.etl.manage', 'banking.tools.etl.create', 'banking.tools.etl.update', 'banking.tools.etl.run', 'banking.tools.manage']);

  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // State management
  const [workflows, setWorkflows] = useState<ETLWorkflow[]>(initialWorkflows);
  const [currentWorkflow, setCurrentWorkflow] = useState<ETLWorkflow | null>(initialWorkflows[0]);
  const [nodes, setNodes, onNodesChange] = useNodesState(currentWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentWorkflow?.edges || []);

  // UI State
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [propertiesPaneOpen, setPropertiesPaneOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Create dynamic node types with selection state
  const nodeTypes: NodeTypes = {
    etlNode: (props) => <ETLNode {...props} selected={props.id === selectedNodeId} />,
  };

  // Update nodes and edges when workflow changes
  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes);
      setEdges(currentWorkflow.edges);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  // Handle new connections
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
    }, eds));
  }, [setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Handle selection change
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    if (selectedNodes.length > 0) {
      setSelectedNodeId(selectedNodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  }, []);

  // Handle drag over for drop functionality
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Handle drop of new nodes
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!canManageToolsEtl) return;

    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const template = nodeTemplates[nodeType as NodeType];
    const newNode: Node = {
      id: `${nodeType}_${Date.now()}`,
      type: 'etlNode',
      position,
      data: {
        nodeType,
        label: template.label,
        config: { ...template.config },
      },
    };

    setNodes((nds) => nds.concat(newNode));
    showSnackbar(`${template.label} node added`, 'success');
  }, [reactFlowInstance, setNodes, canManageToolsEtl, showSnackbar]);

  // Drag start handler for palette items
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    if (!canManageToolsEtl) return;
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get currently selected node
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  const createNewWorkflow = async () => {
    if (!canManageToolsEtl) return;
    if (!newWorkflow.name.trim()) return;

    const workflow: ETLWorkflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      status: 'draft',
      version: 1,
      workflowDefinition: {
        nodes: [],
        connections: [],
        settings: {
          parallelExecution: true,
          errorHandling: 'retry',
          retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000 }
        }
      },
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkflows(prev => [...prev, workflow]);
    setCurrentWorkflow(workflow);
    setNewWorkflow({ name: '', description: '' });
    setWorkflowDialogOpen(false);
    showSnackbar('Workflow created successfully', 'success');
  };

  const saveWorkflow = async () => {
    if (!canManageToolsEtl) return;
    if (!currentWorkflow) return;

    try {
      const updatedWorkflow = {
        ...currentWorkflow,
        nodes,
        edges,
        updatedAt: new Date()
      };

      setWorkflows(prev => prev.map(w => w.id === currentWorkflow.id ? updatedWorkflow : w));
      setCurrentWorkflow(updatedWorkflow);
      showSnackbar('Workflow saved successfully', 'success');
    } catch (error) {
      console.error('Error saving workflow:', error);
      showSnackbar('Failed to save workflow', 'error');
    }
  };

  const executeWorkflow = async () => {
    if (!canManageToolsEtl) return;
    if (!currentWorkflow) return;

    showSnackbar('Workflow execution started', 'info');
    // Mock execution
    setTimeout(() => {
      showSnackbar('Workflow executed successfully', 'success');
    }, 2000);
  };

  const switchWorkflow = (workflow: ETLWorkflow) => {
    // Save current workflow before switching
    if (currentWorkflow) {
      const updated = { ...currentWorkflow, nodes, edges, updatedAt: new Date() };
      setWorkflows(prev => prev.map(w => w.id === currentWorkflow.id ? updated : w));
    }
    setCurrentWorkflow(workflow);
  };

  const deleteNode = (nodeId: string) => {
    if (!canManageToolsEtl) return;
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    if (!canManageToolsEtl) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 1 }}>
      {!canViewToolsEtl && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view ETL workflow tools.
        </Alert>
      )}
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/banking/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/banking/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkflowIcon sx={{ mr: 0.5, fontSize: 16 }} />
            ETL Workflow Designer
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkflowIcon sx={{ mr: 2, fontSize: 28, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                {currentWorkflow ? currentWorkflow.name : 'ETL Workflow Designer'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentWorkflow ? currentWorkflow.description || 'No description' : 'Interactive visual workflow designer'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {canManageToolsEtl && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setWorkflowDialogOpen(true)}
                size="small"
              >
                New
              </Button>
            )}
            {currentWorkflow && (
              <>
                {canManageToolsEtl && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={saveWorkflow}
                      size="small"
                    >
                      Save
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<RunIcon />}
                      onClick={executeWorkflow}
                      size="small"
                    >
                      Run
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, gap: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Workflows & Node Palette */}
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              position: 'relative',
              height: '100%',
              overflow: 'auto',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Workflows
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <List dense>
              {workflows.map((workflow) => (
                <ListItemButton
                  key={workflow.id}
                  selected={currentWorkflow?.id === workflow.id}
                  onClick={() => switchWorkflow(workflow)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText
                    primary={workflow.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={workflow.status}
                          color={
                            workflow.status === 'active' ? 'success' :
                              workflow.status === 'error' ? 'error' : 'default'
                          }
                        />
                        <Typography variant="caption">
                          {workflow.nodes.length} nodes
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Node Palette
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Drag nodes to the canvas
            </Typography>

            <Grid container spacing={1}>
              {Object.entries(nodeTemplates).map(([nodeType, template]) => {
                const IconComponent = template.icon;
                return (
                  <Grid key={nodeType} size={6}>
                    <Paper
                      sx={{
                        p: 1.5,
                        cursor: canManageToolsEtl ? 'grab' : 'default',
                        textAlign: 'center',
                        backgroundColor: template.color + '10',
                        border: `1px solid ${template.color}40`,
                        '&:hover': {
                          backgroundColor: template.color + '20',
                          transform: 'scale(1.02)',
                        },
                        '&:active': {
                          cursor: canManageToolsEtl ? 'grabbing' : 'default'
                        },
                        transition: 'all 0.2s'
                      }}
                      draggable={canManageToolsEtl}
                      onDragStart={(event: React.DragEvent) => onDragStart(event, nodeType as NodeType)}
                    >
                      <IconComponent sx={{ color: template.color, fontSize: 24, mb: 0.5 }} />
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'medium' }}>
                        {template.label}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Drawer>

        {/* Main Canvas */}
        <Box sx={{ flex: 1, height: '100%', position: 'relative' }}>
          {currentWorkflow ? (
            <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                selectNodesOnDrag={false}
              >
                <Controls />
                <MiniMap
                  style={{
                    height: 120,
                  }}
                  zoomable
                  pannable
                />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                />

                {/* Custom Panel */}
                <Panel position="top-right">
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Fit to screen">
                      <IconButton
                        size="small"
                        onClick={() => reactFlowInstance?.fitView()}
                        sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <FitScreenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle sidebar">
                      <IconButton
                        size="small"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Panel>
              </ReactFlow>
            </div>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <WorkflowIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Workflow Selected
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Select an existing workflow or create a new one
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setWorkflowDialogOpen(true)}
                disabled={!canManageToolsEtl}
              >
                Create New Workflow
              </Button>
            </Box>
          )}
        </Box>

        {/* Right Properties Pane */}
        <Drawer
          variant="persistent"
          open={propertiesPaneOpen}
          anchor="right"
          sx={{
            width: 350,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 350,
              position: 'relative',
              height: '100%',
              overflow: 'auto',
              borderLeft: 1,
              borderColor: 'divider',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Properties
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {selectedNode && (
                  <Tooltip title="Clear selection">
                    <IconButton
                      size="small"
                      onClick={() => setSelectedNodeId(null)}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={() => setPropertiesPaneOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {selectedNode ? (
              <Box>
                {/* Node Header */}
                <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {(React.createElement((nodeTemplates[selectedNode.data.nodeType]?.icon || SourceIcon) as any, {
                      sx: { color: nodeTemplates[selectedNode.data.nodeType]?.color, fontSize: 24 }
                    }) as any)}
                    <Typography variant="h6">
                      {selectedNode.data.label}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={selectedNode.data.nodeType}
                    sx={{
                      backgroundColor: nodeTemplates[selectedNode.data.nodeType]?.color + '20',
                      color: nodeTemplates[selectedNode.data.nodeType]?.color
                    }}
                  />
                </Paper>

                {/* Basic Properties */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Basic Properties</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Node Label"
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={selectedNode.data.label || ''}
                        disabled={!canManageToolsEtl}
                        onChange={(e) => {
                          updateNodeData(selectedNode.id, { label: e.target.value });
                        }}
                      />
                      <TextField
                        label="Node ID"
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={selectedNode.id}
                        disabled
                        helperText="Auto-generated unique identifier"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Configuration Properties */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Configuration</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {Object.entries(selectedNode.data.config || {}).map(([key, value]) => (
                        <TextField
                          key={key}
                          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          fullWidth
                          variant="outlined"
                          size="small"
                        value={value as string}
                        disabled={!canManageToolsEtl}
                        onChange={(e) => {
                            const newConfig = { ...selectedNode.data.config, [key]: e.target.value };
                            updateNodeData(selectedNode.id, { config: newConfig });
                          }}
                          multiline={key.includes('expression') || key.includes('condition')}
                          rows={key.includes('expression') || key.includes('condition') ? 3 : 1}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Advanced Properties */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Advanced</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Description"
                        fullWidth
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                        value={selectedNode.data.description || ''}
                        disabled={!canManageToolsEtl}
                        onChange={(e) => {
                          updateNodeData(selectedNode.id, { description: e.target.value });
                        }}
                        placeholder="Enter node description..."
                      />
                      <TextField
                        label="Position X"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={selectedNode.position.x}
                        disabled={!canManageToolsEtl}
                        onChange={(e) => {
                          if (!canManageToolsEtl) return;
                          const newNodes = nodes.map(n =>
                            n.id === selectedNode.id
                              ? { ...n, position: { ...n.position, x: parseInt(e.target.value) || 0 } }
                              : n
                          );
                          setNodes(newNodes);
                        }}
                        sx={{ width: '48%', display: 'inline-block', mr: 1 }}
                      />
                      <TextField
                        label="Position Y"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={selectedNode.position.y}
                        disabled={!canManageToolsEtl}
                        onChange={(e) => {
                          if (!canManageToolsEtl) return;
                          const newNodes = nodes.map(n =>
                            n.id === selectedNode.id
                              ? { ...n, position: { ...n.position, y: parseInt(e.target.value) || 0 } }
                              : n
                          );
                          setNodes(newNodes);
                        }}
                        sx={{ width: '48%', display: 'inline-block' }}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Actions */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {canManageToolsEtl && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => {
                        deleteNode(selectedNode.id);
                        setSelectedNodeId(null);
                        showSnackbar('Node deleted', 'info');
                      }}
                      fullWidth
                    >
                      Delete Node
                    </Button>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                color: 'text.secondary'
              }}>
                <SettingsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1" gutterBottom>
                  No Node Selected
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Click on a node in the canvas to view and edit its properties
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>
      </Box>

      {/* New Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
            value={newWorkflow.name}
            onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
          <Button onClick={createNewWorkflow} variant="contained" disabled={!newWorkflow.name.trim() || !canManageToolsEtl}>
            Create
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Buttons */}
      {!drawerOpen && (
        <Fab
          size="medium"
          color="primary"
          onClick={() => setDrawerOpen(true)}
          sx={{ position: 'fixed', bottom: 20, left: 20 }}
        >
          <SettingsIcon />
        </Fab>
      )}

      {!propertiesPaneOpen && (
        <Fab
          size="medium"
          color="secondary"
          onClick={() => setPropertiesPaneOpen(true)}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          <SettingsIcon />
        </Fab>
      )}
    </Container>
  );
}

// Main component wrapped with ReactFlowProvider
export default function PageContent() {
  return (
    <ReactFlowProvider>
      <ETLWorkflowDesignerContent />
    </ReactFlowProvider>
  );
}
