// database/migrations/YYYYMMDDHHMMSS-create-r-analytics-schema.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create r_analytics schema if not exists
      await queryInterface.createSchema('r_analytics', { transaction });
      
      // R Model Executions table
      await queryInterface.createTable('r_analytics.model_executions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        execution_id: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        model_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        model_type: {
          type: Sequelize.ENUM('PD', 'LGD', 'EAD', 'ECL', 'STRESS_TEST'),
          allowNull: false
        },
        execution_status: {
          type: Sequelize.ENUM('pending', 'running', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending'
        },
        input_parameters: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        input_data_count: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        output_results: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        execution_log: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        error_message: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        execution_time_seconds: {
          type: Sequelize.DECIMAL(8, 3),
          allowNull: true
        },
        memory_usage_mb: {
          type: Sequelize.DECIMAL(8, 2),
          allowNull: true
        },
        r_version: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now')
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: true
        }
      }, { transaction });

      // R Model Artifacts table (for storing R objects, plots, etc.)
      await queryInterface.createTable('r_analytics.model_artifacts', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        execution_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'model_executions', schema: 'r_analytics' },
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        artifact_name: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        artifact_type: {
          type: Sequelize.ENUM('plot', 'data', 'model', 'report', 'log'),
          allowNull: false
        },
        file_path: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        file_size_bytes: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        mime_type: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now')
        }
      }, { transaction });

      // R Service Health table (for monitoring)
      await queryInterface.createTable('r_analytics.service_health', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        service_instance: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('healthy', 'degraded', 'unhealthy'),
          allowNull: false
        },
        r_version: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        memory_usage_mb: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        cpu_usage_percent: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        active_executions: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        last_execution_time: {
          type: Sequelize.DATE,
          allowNull: true
        },
        error_count_24h: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        uptime_seconds: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        health_check_details: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now')
        }
      }, { transaction });

      // Create indexes for performance
      await queryInterface.addIndex('r_analytics.model_executions', ['execution_id'], { unique: true, transaction });
      await queryInterface.addIndex('r_analytics.model_executions', ['model_name', 'execution_status'], { transaction });
      await queryInterface.addIndex('r_analytics.model_executions', ['tenant_id', 'created_at'], { transaction });
      await queryInterface.addIndex('r_analytics.model_executions', ['execution_status', 'created_at'], { transaction });
      
      await queryInterface.addIndex('r_analytics.model_artifacts', ['execution_id'], { transaction });
      await queryInterface.addIndex('r_analytics.model_artifacts', ['artifact_type'], { transaction });
      
      await queryInterface.addIndex('r_analytics.service_health', ['service_instance', 'created_at'], { transaction });
      await queryInterface.addIndex('r_analytics.service_health', ['status'], { transaction });

      await transaction.commit();
      console.log('R Analytics schema created successfully');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop tables in reverse order
      await queryInterface.dropTable('r_analytics.service_health', { transaction });
      await queryInterface.dropTable('r_analytics.model_artifacts', { transaction });
      await queryInterface.dropTable('r_analytics.model_executions', { transaction });
      
      // Drop schema
      await queryInterface.dropSchema('r_analytics', { transaction });

      await transaction.commit();
      console.log('R Analytics schema dropped successfully');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
