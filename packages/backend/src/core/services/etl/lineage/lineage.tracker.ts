// packages/backend/src/core/services/etl/lineage/lineage.tracker.ts

import { injectable } from 'inversify';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { WorkflowDefinition, DataLineage, LineageMetadata } from '../../../../types/etl.types';

export interface LineageNode {
  id: string;
  type: 'source' | 'transformation' | 'target';
  name: string;
  description?: string;
  metadata: any;
  level: number;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  transformationType: string;
  metadata: any;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  levels: number;
  paths: LineagePath[];
}

export interface LineagePath {
  id: string;
  source: string;
  target: string;
  nodes: string[];
  transformations: string[];
  hops: number;
}

export interface FieldLineage {
  field: string;
  source: string;
  transformations: FieldTransformation[];
  dependencies: string[];
}

export interface FieldTransformation {
  nodeId: string;
  transformationType: string;
  expression?: string;
  description?: string;
}

export interface ImpactAnalysis {
  affectedNodes: string[];
  affectedFields: string[];
  downstreamWorkflows: string[];
  estimatedRecords: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

@injectable()
export class DataLineageTracker {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async trackWorkflowLineage(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    try {
      this.logger.info(`Tracking data lineage for workflow: ${workflowId}`);

      // Build lineage graph from workflow definition
      const lineageGraph = this.buildLineageGraph(definition);
      
      // Store lineage information
      await this.storeLineageGraph(workflowId, lineageGraph);
      
      // Track field-level lineage
      await this.trackFieldLineage(workflowId, definition);
      
      this.logger.info(`Data lineage tracking completed for workflow: ${workflowId}`);
      
    } catch (error) {
      this.logger.error(`Failed to track workflow lineage: ${error.message}`);
      throw new Error(`Failed to track workflow lineage: ${error.message}`);
    }
  }

  async updateWorkflowLineage(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    try {
      this.logger.info(`Updating data lineage for workflow: ${workflowId}`);

      // Remove existing lineage
      await this.removeWorkflowLineage(workflowId);
      
      // Track new lineage
      await this.trackWorkflowLineage(workflowId, definition);
      
      this.logger.info(`Data lineage updated for workflow: ${workflowId}`);
      
    } catch (error) {
      this.logger.error(`Failed to update workflow lineage: ${error.message}`);
      throw new Error(`Failed to update workflow lineage: ${error.message}`);
    }
  }

  private buildLineageGraph(definition: WorkflowDefinition): LineageGraph {
    const nodes: LineageNode[] = [];
    const edges: LineageEdge[] = [];
    const levels = new Map<string, number>();

    // Calculate node levels using topological sort
    this.calculateNodeLevels(definition.nodes, definition.connections, levels);

    // Create lineage nodes
    definition.nodes.forEach(node => {
      const lineageNode: LineageNode = {
        id: node.id,
        type: this.getLineageNodeType(node.type),
        name: node.data.label,
        description: node.data.metadata?.description,
        metadata: {
          nodeType: node.type,
          config: node.data.config,
          position: node.position
        },
        level: levels.get(node.id) || 0
      };
      nodes.push(lineageNode);
    });

    // Create lineage edges
    definition.connections.forEach(connection => {
      const sourceNode = definition.nodes.find(n => n.id === connection.source);
      const targetNode = definition.nodes.find(n => n.id === connection.target);
      
      if (sourceNode && targetNode) {
        const lineageEdge: LineageEdge = {
          id: `${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          transformationType: this.getTransformationType(sourceNode.type, targetNode.type),
          metadata: {
            sourceType: sourceNode.type,
            targetType: targetNode.type,
            dataFlow: connection.data || {}
          }
        };
        edges.push(lineageEdge);
      }
    });

    // Generate lineage paths
    const paths = this.generateLineagePaths(nodes, edges);

    return {
      nodes,
      edges,
      levels: Math.max(...Array.from(levels.values()), 0) + 1,
      paths
    };
  }

  private calculateNodeLevels(
    nodes: any[], 
    connections: any[], 
    levels: Map<string, number>
  ): void {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build adjacency list and calculate in-degrees
    connections.forEach(conn => {
      graph.get(conn.source)?.push(conn.target);
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
    });

    // Topological sort with level calculation
    const queue: string[] = [];
    
    // Find nodes with no incoming edges (level 0)
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        levels.set(nodeId, 0);
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const currentLevel = levels.get(nodeId) || 0;
      
      // Process all neighbors
      graph.get(nodeId)?.forEach(neighbor => {
        const newInDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newInDegree);
        
        if (newInDegree === 0) {
          levels.set(neighbor, currentLevel + 1);
          queue.push(neighbor);
        }
      });
    }
  }

  private getLineageNodeType(nodeType: string): 'source' | 'transformation' | 'target' {
    switch (nodeType) {
      case 'source':
        return 'source';
      case 'output':
        return 'target';
      default:
        return 'transformation';
    }
  }

  private getTransformationType(sourceType: string, targetType: string): string {
    if (sourceType === 'source') {
      return 'extraction';
    } else if (targetType === 'output') {
      return 'loading';
    } else {
      return 'transformation';
    }
  }

  private generateLineagePaths(nodes: LineageNode[], edges: LineageEdge[]): LineagePath[] {
    const paths: LineagePath[] = [];
    const sourceNodes = nodes.filter(n => n.type === 'source');
    const targetNodes = nodes.filter(n => n.type === 'target');

    // Build adjacency list
    const graph = new Map<string, string[]>();
    nodes.forEach(node => graph.set(node.id, []));
    edges.forEach(edge => {
      graph.get(edge.source)?.push(edge.target);
    });

    // Find all paths from sources to targets
    sourceNodes.forEach(source => {
      targetNodes.forEach(target => {
        const pathNodes = this.findPath(graph, source.id, target.id);
        if (pathNodes.length > 0) {
          const transformations = pathNodes
            .slice(1, -1) // Exclude source and target
            .map(nodeId => nodes.find(n => n.id === nodeId)?.type || 'unknown');

          paths.push({
            id: `${source.id}-${target.id}`,
            source: source.id,
            target: target.id,
            nodes: pathNodes,
            transformations,
            hops: pathNodes.length - 1
          });
        }
      });
    });

    return paths;
  }

  private findPath(graph: Map<string, string[]>, start: string, end: string): string[] {
    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (current: string): boolean => {
      if (current === end) {
        path.push(current);
        return true;
      }

      if (visited.has(current)) {
        return false;
      }

      visited.add(current);
      path.push(current);

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      path.pop();
      return false;
    };

    if (dfs(start)) {
      return path;
    }

    return [];
  }

  private async storeLineageGraph(workflowId: string, graph: LineageGraph): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Store each lineage entry
      for (const path of graph.paths) {
        for (let i = 0; i < path.nodes.length - 1; i++) {
          const sourceEntity = path.nodes[i];
          const targetEntity = path.nodes[i + 1];
          const transformationType = path.transformations[i] || 'direct';

          const query = `
            INSERT INTO etl_designer.data_lineage (
              workflow_id, source_entity, target_entity, 
              transformation_type, lineage_metadata
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (workflow_id, source_entity, target_entity) 
            DO UPDATE SET 
              transformation_type = EXCLUDED.transformation_type,
              lineage_metadata = EXCLUDED.lineage_metadata
          `;

          const metadata: LineageMetadata = {
            transformationDetails: `${sourceEntity} -> ${targetEntity}`,
            impactRadius: [targetEntity],
            dependencies: [sourceEntity],
            lastUpdated: new Date()
          };

          await client.query(query, [
            workflowId,
            sourceEntity,
            targetEntity,
            transformationType,
            JSON.stringify(metadata)
          ]);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async trackFieldLineage(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    // This would track field-level lineage through transformations
    // Implementation depends on detailed transformation analysis
    this.logger.info(`Field-level lineage tracking for workflow ${workflowId} - placeholder implementation`);
  }

  async getLineageGraph(workflowId: string): Promise<LineageGraph> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT 
          source_entity,
          target_entity,
          transformation_type,
          lineage_metadata
        FROM etl_designer.data_lineage
        WHERE workflow_id = $1
        ORDER BY source_entity, target_entity
      `;

      const result = await pool.query(query, [workflowId]);
      
      return this.reconstructLineageGraph(result.rows);
    } catch (error) {
      this.logger.error(`Failed to get lineage graph: ${error.message}`);
      throw new Error(`Failed to get lineage graph: ${error.message}`);
    }
  }

  private reconstructLineageGraph(lineageRows: any[]): LineageGraph {
    const nodeMap = new Map<string, LineageNode>();
    const edges: LineageEdge[] = [];

    // Extract nodes and edges from lineage data
    lineageRows.forEach(row => {
      const { source_entity, target_entity, transformation_type, lineage_metadata } = row;
      const metadata = lineage_metadata;

      // Add source node
      if (!nodeMap.has(source_entity)) {
        nodeMap.set(source_entity, {
          id: source_entity,
          type: 'source', // This would be determined more accurately
          name: source_entity,
          metadata: {},
          level: 0 // This would be calculated
        });
      }

      // Add target node
      if (!nodeMap.has(target_entity)) {
        nodeMap.set(target_entity, {
          id: target_entity,
          type: 'transformation', // This would be determined more accurately
          name: target_entity,
          metadata: {},
          level: 1 // This would be calculated
        });
      }

      // Add edge
      edges.push({
        id: `${source_entity}-${target_entity}`,
        source: source_entity,
        target: target_entity,
        transformationType: transformation_type,
        metadata
      });
    });

    const nodes = Array.from(nodeMap.values());
    const paths = this.generateLineagePaths(nodes, edges);

    return {
      nodes,
      edges,
      levels: Math.max(...nodes.map(n => n.level), 0) + 1,
      paths
    };
  }

  async analyzeImpact(workflowId: string, nodeId: string): Promise<ImpactAnalysis> {
    try {
      this.logger.info(`Analyzing impact for node ${nodeId} in workflow ${workflowId}`);

      const lineageGraph = await this.getLineageGraph(workflowId);
      const affectedNodes = this.findDownstreamNodes(lineageGraph, nodeId);
      const affectedFields = await this.findAffectedFields(workflowId, nodeId);
      const downstreamWorkflows = await this.findDownstreamWorkflows(nodeId);

      const riskLevel = this.calculateRiskLevel(affectedNodes.length, affectedFields.length, downstreamWorkflows.length);
      const recommendations = this.generateImpactRecommendations(affectedNodes, downstreamWorkflows, riskLevel);

      return {
        affectedNodes,
        affectedFields,
        downstreamWorkflows,
        estimatedRecords: await this.estimateAffectedRecords(affectedNodes),
        riskLevel,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Failed to analyze impact: ${error.message}`);
      throw new Error(`Failed to analyze impact: ${error.message}`);
    }
  }

  private findDownstreamNodes(graph: LineageGraph, nodeId: string): string[] {
    const downstream: string[] = [];
    const visited = new Set<string>();
    
    const dfs = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) return;
      visited.add(currentNodeId);
      
      const outgoingEdges = graph.edges.filter(e => e.source === currentNodeId);
      outgoingEdges.forEach(edge => {
        downstream.push(edge.target);
        dfs(edge.target);
      });
    };

    dfs(nodeId);
    return [...new Set(downstream)]; // Remove duplicates
  }

  private async findAffectedFields(workflowId: string, nodeId: string): Promise<string[]> {
    // This would analyze field-level dependencies
    // Placeholder implementation
    return [];
  }

  private async findDownstreamWorkflows(nodeId: string): Promise<string[]> {
    // This would find other workflows that depend on this node's output
    // Placeholder implementation
    return [];
  }

  private calculateRiskLevel(nodeCount: number, fieldCount: number, workflowCount: number): 'low' | 'medium' | 'high' | 'critical' {
    const totalImpact = nodeCount + fieldCount + (workflowCount * 2);
    
    if (totalImpact === 0) return 'low';
    if (totalImpact <= 5) return 'low';
    if (totalImpact <= 15) return 'medium';
    if (totalImpact <= 30) return 'high';
    return 'critical';
  }

  private generateImpactRecommendations(
    affectedNodes: string[], 
    downstreamWorkflows: string[], 
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('CRITICAL: Schedule maintenance window due to high impact');
      recommendations.push('Notify all downstream system owners before making changes');
    }

    if (affectedNodes.length > 10) {
      recommendations.push(`High impact: ${affectedNodes.length} nodes will be affected`);
      recommendations.push('Consider phased rollout to minimize disruption');
    }

    if (downstreamWorkflows.length > 0) {
      recommendations.push(`${downstreamWorkflows.length} downstream workflows depend on this node`);
      recommendations.push('Coordinate with downstream workflow owners');
    }

    recommendations.push('Test changes in development environment first');
    recommendations.push('Monitor data quality metrics after changes');

    return recommendations;
  }

  private async estimateAffectedRecords(affectedNodes: string[]): Promise<number> {
    // This would estimate the number of records affected
    // Based on historical execution data
    return affectedNodes.length * 1000; // Placeholder
  }

  private async removeWorkflowLineage(workflowId: string): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      DELETE FROM etl_designer.data_lineage
      WHERE workflow_id = $1
    `;

    await pool.query(query, [workflowId]);
  }
}
