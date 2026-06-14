// packages/frontend/src/services/api/etl.api.ts

export const etlApi = {
  async createWorkflow(request: any): Promise<any> {
    return { id: 'workflow-id', ...request };
  },

  async getWorkflow(id: string): Promise<any> {
    return { id, name: 'Sample Workflow' };
  },

  async updateWorkflow(id: string, request: any): Promise<any> {
    return { id, ...request };
  },

  async executeWorkflow(id: string): Promise<any> {
    return { executionId: 'exec-id' };
  },

  async getExecutionHistory(id: string): Promise<any[]> {
    return [];
  }
};

export default etlApi;
