// Simple Configuration Service - Works with actual database structure
// ============================================================================
// Fixes the "scopes" error by using direct database queries
// ============================================================================

import { Pool } from 'pg';

export interface SimpleConfigData {
  id: string;
  key: string;
  value: any;
  type: string;
  category: string;
  tenant_id?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class SimpleConfigService {
  private pool: Pool;

  constructor(databasePool: Pool) {
    this.pool = databasePool;
  }

  /**
   * Get tenant configuration safely without Sequelize scopes
   */
  async getTenantConfiguration(
    tenantId: string | null, 
    category?: string
  ): Promise<Record<string, any>> {
    try {
      let query = `
        SELECT key, value, type, category 
        FROM platform_admin.configuration 
        WHERE is_active = true
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (tenantId) {
        query += ` AND tenant_id = $${paramIndex}`;
        params.push(tenantId);
        paramIndex++;
      } else {
        query += ` AND tenant_id IS NULL`;
      }
      
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      query += ` ORDER BY category, key`;
      
      const client = await this.pool.connect();
      const result = await client.query(query, params);
      client.release();
      
      // Convert to key-value object
      const config: Record<string, any> = {};
      result.rows.forEach(row => {
        let value = row.value;
        
        // Parse based on type
        if (row.type === 'json' && typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if parse fails
          }
        } else if (row.type === 'boolean' && typeof value === 'string') {
          value = value.toLowerCase() === 'true';
        } else if (row.type === 'number' && typeof value === 'string') {
          value = parseFloat(value);
        }
        
        config[row.key] = value;
      });
      
      return config;
      
    } catch (error) {
      console.log('⚠️ Failed to get tenant configuration, returning empty config:', error.message);
      return {};
    }
  }
  
  /**
   * Set configuration value
   */
  async setConfiguration(
    key: string,
    value: any,
    options: {
      tenantId?: string | null;
      category?: string;
      type?: string;
      description?: string;
    } = {}
  ): Promise<boolean> {
    try {
      const {
        tenantId = null,
        category = 'general',
        type = 'string',
        description = null
      } = options;
      
      // Convert value to proper format
      let processedValue = value;
      if (type === 'json' && typeof value === 'object') {
        processedValue = JSON.stringify(value);
      }
      
      const query = `
        INSERT INTO platform_admin.configuration 
        (key, value, type, category, tenant_id, description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (tenant_id, key) DO UPDATE SET
          value = EXCLUDED.value,
          type = EXCLUDED.type,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          updated_at = NOW()
      `;
      
      const client = await this.pool.connect();
      await client.query(query, [key, processedValue, type, category, tenantId, description]);
      client.release();
      
      return true;
      
    } catch (error) {
      console.error('Failed to set configuration:', error.message);
      return false;
    }
  }
  
  /**
   * Get global platform configuration
   */
  async getGlobalConfig(category?: string): Promise<Record<string, any>> {
    return this.getTenantConfiguration(null, category);
  }
  
  /**
   * Check if configuration exists
   */
  async hasConfiguration(key: string, tenantId?: string | null): Promise<boolean> {
    try {
      let query = `
        SELECT COUNT(*) as count 
        FROM platform_admin.configuration 
        WHERE key = $1 AND is_active = true
      `;
      
      const params = [key];
      
      if (tenantId !== undefined) {
        if (tenantId === null) {
          query += ` AND tenant_id IS NULL`;
        } else {
          query += ` AND tenant_id = $2`;
          params.push(tenantId);
        }
      }
      
      const client = await this.pool.connect();
      const result = await client.query(query, params);
      client.release();
      
      return parseInt(result.rows[0].count) > 0;
      
    } catch (error) {
      console.error('Failed to check configuration:', error.message);
      return false;
    }
  }
}

// Export factory function
export function createSimpleConfigService(databasePool: Pool): SimpleConfigService {
  return new SimpleConfigService(databasePool);
}