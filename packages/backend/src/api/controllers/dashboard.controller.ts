// packages/backend/src/api/controllers/dashboard.controller.ts
// ============================================================================
// DASHBOARD CONTROLLER - Real Database Integration
// ============================================================================
// Provides real data for the banking dashboard from frs9_master_account
// ============================================================================

import { Request, Response } from 'express';
import { Pool } from 'pg';
import { appConfig } from '../../config/app.config';

// ============================================================================
// DATABASE CONNECTION - CENTRALIZED CONFIGURATION
// ============================================================================

const databaseConfig = appConfig.platformDb;
const frs9ProPool = new Pool({
  host: databaseConfig.frs9.host,
  port: databaseConfig.frs9.port,
  user: databaseConfig.frs9.user,
  password: databaseConfig.frs9.password,
  database: databaseConfig.frs9.database,
  ssl: databaseConfig.frs9.ssl,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
});

export class DashboardController {
  
  /**
   * Get ECL calculations summary from real database
   * Aggregates data from frs9_master_account by stage
   */
  static getCalculationsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId || 'default';
      
      // Get the latest processing date from the database
      const latestDateQuery = `
        SELECT MAX(prc_date) as latest_date 
        FROM frs9_master_account
        LIMIT 1;
      `;
      
      const latestDateResult = await frs9ProPool.query(latestDateQuery);
      const latestDate = latestDateResult.rows[0]?.latest_date;
      
      if (!latestDate) {
        return res.status(404).json({
          success: false,
          error: 'No data found in frs9_master_account table'
        });
      }

      // Main ECL summary query
      const query = `
        SELECT 
          -- Total ECL by stage
          SUM(ecl_final_amt) as total_ecl,
          SUM(CASE WHEN stage = '1' THEN ecl_final_amt ELSE 0 END) as stage1_ecl,
          SUM(CASE WHEN stage = '2' THEN ecl_final_amt ELSE 0 END) as stage2_ecl,
          SUM(CASE WHEN stage = '3' THEN ecl_final_amt ELSE 0 END) as stage3_ecl,
          
          -- Portfolio metrics
          SUM(outstanding) as total_exposure,
          SUM(outstanding + accrued_interest) as total_portfolio,
          COUNT(DISTINCT account_number) as total_accounts,
          COUNT(DISTINCT CASE WHEN stage IN ('1', '2', '3') THEN account_number END) as active_accounts,
          
          -- ECL components
          SUM(ecl_ca_onbs_amt) as ecl_ca_onbs,
          SUM(ecl_ca_offbs_amt) as ecl_ca_offbs,
          SUM(ecl_ia_onbs_amt) as ecl_ia_onbs,
          SUM(ecl_overlay_amt) as ecl_overlay,
          
          -- Risk distribution
          COUNT(CASE WHEN stage = '1' THEN 1 END) as stage1_count,
          COUNT(CASE WHEN stage = '2' THEN 1 END) as stage2_count,
          COUNT(CASE WHEN stage = '3' THEN 1 END) as stage3_count,
          
          -- Currency info
          currency,
          
          -- Processing date
          prc_date as last_updated
          
        FROM frs9_master_account
        WHERE prc_date = $1
        GROUP BY prc_date, currency
        ORDER BY currency
        LIMIT 1;
      `;

      const result = await frs9ProPool.query(query, [latestDate]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No ECL data found for the latest processing date'
        });
      }

      const row = result.rows[0];
      
      // Calculate ECL rate (ECL / Exposure)
      const eclRate = row.total_exposure > 0 
        ? (row.total_ecl / row.total_exposure) * 100 
        : 0;

      const summary = {
        totalECL: parseFloat(row.total_ecl) || 0,
        stage1ECL: parseFloat(row.stage1_ecl) || 0,
        stage2ECL: parseFloat(row.stage2_ecl) || 0,
        stage3ECL: parseFloat(row.stage3_ecl) || 0,
        eclRate: parseFloat(eclRate.toFixed(2)),
        currency: row.currency || 'IDR',
        lastUpdated: row.last_updated,
        
        // Portfolio metrics
        totalPortfolio: parseFloat(row.total_portfolio) || 0,
        totalExposure: parseFloat(row.total_exposure) || 0,
        totalAccounts: parseInt(row.total_accounts) || 0,
        activeAccounts: parseInt(row.active_accounts) || 0,
        
        // Risk distribution for charts
        riskDistribution: {
          stage1: parseInt(row.stage1_count) || 0,
          stage2: parseInt(row.stage2_count) || 0,
          stage3: parseInt(row.stage3_count) || 0
        },
        
        // ECL components
        eclComponents: {
          collectiveOnBalance: parseFloat(row.ecl_ca_onbs) || 0,
          collectiveOffBalance: parseFloat(row.ecl_ca_offbs) || 0,
          individual: parseFloat(row.ecl_ia_onbs) || 0,
          overlay: parseFloat(row.ecl_overlay) || 0
        }
      };

      console.log(`✅ Dashboard ECL summary retrieved for ${user?.email} (${tenantId})`);
      
      res.json({
        success: true,
        data: summary,
        meta: {
          tenant: tenantId,
          processingDate: latestDate,
          database: databaseConfig.frs9.database,
          source: 'frs9_master_account'
        }
      });

    } catch (error) {
      console.error('❌ Dashboard calculations summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ECL summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get portfolio trend data for the last 12 months
   * Shows historical trend of total exposure
   */
  static getPortfolioTrend = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId || 'default';
      
      // Get portfolio trend for last 12 processing dates
      const query = `
        WITH ranked_dates AS (
          SELECT DISTINCT prc_date,
            ROW_NUMBER() OVER (ORDER BY prc_date DESC) as rn
          FROM frs9_master_account
        ),
        latest_12_dates AS (
          SELECT prc_date 
          FROM ranked_dates 
          WHERE rn <= 12
          ORDER BY prc_date ASC
        )
        SELECT 
          m.prc_date,
          TO_CHAR(TO_DATE(m.prc_date::text, 'YYYYMMDD'), 'Mon YYYY') as period_name,
          SUM(m.outstanding) as total_exposure,
          SUM(m.ecl_final_amt) as total_ecl,
          COUNT(DISTINCT m.account_number) as account_count
        FROM frs9_master_account m
        INNER JOIN latest_12_dates d ON m.prc_date = d.prc_date
        GROUP BY m.prc_date
        ORDER BY m.prc_date ASC;
      `;

      const result = await frs9ProPool.query(query);
      
      // Transform data for frontend chart
      const trendData = result.rows.map((row: any) => ({
        name: row.period_name,
        value: parseFloat(row.total_exposure) || 0,
        ecl: parseFloat(row.total_ecl) || 0,
        accounts: parseInt(row.account_count) || 0,
        date: row.prc_date
      }));

      console.log(`✅ Portfolio trend retrieved: ${trendData.length} periods`);

      res.json({
        success: true,
        data: trendData,
        meta: {
          tenant: tenantId,
          periods: trendData.length,
          database: databaseConfig.frs9.database,
          source: 'frs9_master_account'
        }
      });

    } catch (error) {
      console.error('❌ Portfolio trend error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve portfolio trend',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get portfolio metrics summary
   */
  static getPortfolioMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      
      // Get latest processing date
      const latestDateQuery = `
        SELECT MAX(prc_date) as latest_date 
        FROM frs9_master_account
        LIMIT 1;
      `;
      
      const latestDateResult = await frs9ProPool.query(latestDateQuery);
      const latestDate = latestDateResult.rows[0]?.latest_date;
      
      if (!latestDate) {
        return res.status(404).json({
          success: false,
          error: 'No data found'
        });
      }

      const query = `
        SELECT 
          SUM(outstanding) as total_exposure,
          COUNT(DISTINCT account_number) as total_accounts,
          COUNT(DISTINCT CASE WHEN stage IN ('1', '2', '3') THEN account_number END) as active_accounts,
          AVG(CASE 
            WHEN internal_rating_code ~ '^[0-9]+$' 
            THEN internal_rating_code::numeric 
            ELSE NULL 
          END) as avg_rating,
          currency
        FROM frs9_master_account
        WHERE prc_date = $1
        GROUP BY currency
        LIMIT 1;
      `;

      const result = await frs9ProPool.query(query, [latestDate]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No portfolio data found'
        });
      }

      const row = result.rows[0];
      
      const metrics = {
        totalExposure: parseFloat(row.total_exposure) || 0,
        totalAccounts: parseInt(row.total_accounts) || 0,
        activeAccounts: parseInt(row.active_accounts) || 0,
        averageRating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : 'N/A',
        currency: row.currency || 'IDR'
      };

      res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      console.error('❌ Portfolio metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve portfolio metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recent activities from calculation logs
   */
  static getRecentActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      // Get latest 5 processing dates as activities
      const query = `
        SELECT DISTINCT 
          prc_date,
          COUNT(DISTINCT account_number) as accounts_processed,
          SUM(ecl_final_amt) as total_ecl
        FROM frs9_master_account
        GROUP BY prc_date
        ORDER BY prc_date DESC
        LIMIT 5;
      `;

      const result = await frs9ProPool.query(query);

      const activities = result.rows.map((row: any, index: number) => ({
        id: `act_${row.prc_date}`,
        icon: index === 0 ? '✅' : '📊',
        text: `ECL calculation completed for ${row.prc_date} (${row.accounts_processed} accounts)`,
        time: index === 0 ? 'Latest' : `${index} period(s) ago`,
        type: 'success'
      }));

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      console.error('❌ Recent activities error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve activities',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default DashboardController;
