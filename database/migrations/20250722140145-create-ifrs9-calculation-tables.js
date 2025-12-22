// database/migrations/YYYYMMDDHHMMSS-create-ifrs9-calculation-tables.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create calculation schema if not exists
      await queryInterface.createSchema('calculation', { transaction });
      
      // ECL Jobs table
      await queryInterface.createTable('calculation.ecl_jobs', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        legacy_id: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        job_name: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        calculation_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'running', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending'
        },
        total_accounts: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        processed_accounts: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        parameters: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        results: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        error_message: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        completed_at: {
          type: Sequelize.DATE,
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
        created_by: {
          type: Sequelize.UUID,
          allowNull: true
        }
      }, { transaction });

      // ECL Results table
      await queryInterface.createTable('calculation.ecl_results', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        job_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'ecl_jobs', schema: 'calculation' },
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        account_id: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        calculation_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        ifrs9_stage: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            isIn: [[1, 2, 3]]
          }
        },
        pd_12m: {
          type: Sequelize.DECIMAL(8, 6),
          allowNull: true
        },
        pd_lifetime: {
          type: Sequelize.DECIMAL(8, 6),
          allowNull: true
        },
        lgd: {
          type: Sequelize.DECIMAL(8, 4),
          allowNull: true
        },
        ead: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true
        },
        ecl_12m: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true
        },
        ecl_lifetime: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true
        },
        ecl_final: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now')
        }
      }, { transaction });

      // ECL Result Nominative (detailed results)
      await queryInterface.createTable('calculation.ecl_result_nominative', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        job_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'ecl_jobs', schema: 'calculation' },
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        account_id: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        customer_id: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        product_type: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        outstanding_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false
        },
        currency_code: {
          type: Sequelize.STRING(3),
          allowNull: false
        },
        calculation_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        ifrs9_stage: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        stage_change: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        previous_stage: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        pd_12m: {
          type: Sequelize.DECIMAL(8, 6),
          allowNull: true
        },
        pd_lifetime: {
          type: Sequelize.DECIMAL(8, 6),
          allowNull: true
        },
        lgd: {
          type: Sequelize.DECIMAL(8, 4),
          allowNull: true
        },
        ead: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true
        },
        ecl_12m: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true
        },
        ecl_lifetime: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true
        },
        ecl_final: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true
        },
        model_parameters: {
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
      await queryInterface.addIndex('calculation.ecl_jobs', ['status'], { transaction });
      await queryInterface.addIndex('calculation.ecl_jobs', ['calculation_date'], { transaction });
      await queryInterface.addIndex('calculation.ecl_jobs', ['tenant_id'], { transaction });
      await queryInterface.addIndex('calculation.ecl_jobs', ['created_by'], { transaction });
      
      await queryInterface.addIndex('calculation.ecl_results', ['job_id'], { transaction });
      await queryInterface.addIndex('calculation.ecl_results', ['account_id'], { transaction });
      await queryInterface.addIndex('calculation.ecl_results', ['calculation_date', 'ifrs9_stage'], { transaction });
      
      await queryInterface.addIndex('calculation.ecl_result_nominative', ['job_id'], { transaction });
      await queryInterface.addIndex('calculation.ecl_result_nominative', ['account_id'], { transaction });
      await queryInterface.addIndex('calculation.ecl_result_nominative', ['customer_id'], { transaction });
      await queryInterface.addIndex('calculation.ecl_result_nominative', ['ifrs9_stage'], { transaction });

      await transaction.commit();
      console.log('IFRS 9 calculation tables created successfully');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop tables in reverse order
      await queryInterface.dropTable('calculation.ecl_result_nominative', { transaction });
      await queryInterface.dropTable('calculation.ecl_results', { transaction });
      await queryInterface.dropTable('calculation.ecl_jobs', { transaction });
      
      await transaction.commit();
      console.log('IFRS 9 calculation tables dropped successfully');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
