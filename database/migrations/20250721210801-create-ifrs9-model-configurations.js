// database/migrations/YYYYMMDDHHMMSS-create-ifrs9-model-configurations.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Extend configuration.model_configurations for IFRS 9
      await queryInterface.addColumn('configuration.model_configurations', 'ifrs9_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('configuration.model_configurations', 'calculation_frequency', {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annually'),
        allowNull: false,
        defaultValue: 'monthly'
      }, { transaction });

      await queryInterface.addColumn('configuration.model_configurations', 'pd_method', {
        type: Sequelize.ENUM('historical', 'logistic', 'market', 'hybrid'),
        allowNull: false,
        defaultValue: 'historical'
      }, { transaction });

      await queryInterface.addColumn('configuration.model_configurations', 'lgd_method', {
        type: Sequelize.ENUM('historical', 'beta', 'workout', 'regulatory'),
        allowNull: false,
        defaultValue: 'historical'
      }, { transaction });

      await queryInterface.addColumn('configuration.model_configurations', 'ead_method', {
        type: Sequelize.ENUM('current', 'stressed', 'regulatory', 'ccf_based'),
        allowNull: false,
        defaultValue: 'current'
      }, { transaction });

      await queryInterface.addColumn('configuration.model_configurations', 'forward_looking_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('configuration.model_configurations', 'scenario_weights', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          base: 0.5,
          upside: 0.2,
          downside: 0.3
        }
      }, { transaction });

      // Insert default IFRS 9 model configurations
      await queryInterface.bulkInsert('configuration.model_configurations', [
        {
          id: 'a1234567-1234-1234-1234-123456789abc',
          model_name: 'Basic PD Model',
          model_type: 'PD',
          model_version: '1.0.0',
          parameters: {
            min_pd: 0.0001,
            max_pd: 1.0,
            default_pd: 0.05,
            rating_override: true,
            dpd_adjustment: true,
            age_adjustment: true
          },
          ifrs9_enabled: true,
          pd_method: 'historical',
          calculation_frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'b2345678-2345-2345-2345-234567890bcd',
          model_name: 'Basic LGD Model',
          model_type: 'LGD',
          model_version: '1.0.0',
          parameters: {
            min_lgd: 0.01,
            max_lgd: 1.0,
            default_lgd: 0.45,
            collateral_adjustment: true,
            syariah_adjustment: true,
            product_type_adjustment: true
          },
          ifrs9_enabled: true,
          lgd_method: 'historical',
          calculation_frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'c3456789-3456-3456-3456-3456789012ef',
          model_name: 'Basic EAD Model',
          model_type: 'EAD',
          model_version: '1.0.0',
          parameters: {
            default_ccf: 0.75,
            max_ccf: 1.0,
            stressed_ccf_multiplier: 1.5,
            product_ccf_mapping: {
              'credit_card': 0.75,
              'line_of_credit': 0.50,
              'term_loan': 0.00,
              'mortgage': 0.00
            }
          },
          ifrs9_enabled: true,
          ead_method: 'current',
          calculation_frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'd4567890-4567-4567-4567-456789012345',
          model_name: 'IFRS 9 Stage Classification',
          model_type: 'STAGE',
          model_version: '1.0.0',
          parameters: {
            stage2_pd_threshold: 0.10,
            stage2_dpd_threshold: 30,
            stage3_dpd_threshold: 90,
            significant_increase_factor: 2.0,
            pd_increase_absolute_threshold: 0.005,
            qualitative_indicators: true
          },
          ifrs9_enabled: true,
          calculation_frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { transaction });

      await transaction.commit();
      console.log('IFRS 9 model configurations created successfully');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove IFRS 9 specific columns
      await queryInterface.removeColumn('configuration.model_configurations', 'scenario_weights', { transaction });
      await queryInterface.removeColumn('configuration.model_configurations', 'forward_looking_enabled', { transaction });
      await queryInterface.removeColumn('configuration.model_configurations', 'ead_method', { transaction });
      await queryInterface.removeColumn('configuration.model_configurations', 'lgd_method', { transaction });
      await queryInterface.removeColumn('configuration.model_configurations', 'pd_method', { transaction });
      await queryInterface.removeColumn('configuration.model_configurations', 'calculation_frequency', { transaction });
      await queryInterface.removeColumn('configuration.model_configurations', 'ifrs9_enabled', { transaction });
      
      // Remove seeded data
      await queryInterface.bulkDelete('configuration.model_configurations', {
        model_type: ['PD', 'LGD', 'EAD', 'STAGE']
      }, { transaction });

      await transaction.commit();
      console.log('IFRS 9 model configurations removed successfully');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
