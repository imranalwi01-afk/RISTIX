// packages/backend/src/database/migrations/013-create-menu-system.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create menu_configurations table
      await queryInterface.createTable('menu_configurations', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        target_audience: {
          type: Sequelize.ENUM('banking_staff', 'consultant', 'regulator', 'platform_admin'),
          allowNull: false
        },
        banking_mode: {
          type: Sequelize.ENUM('conventional', 'syariah', 'dual'),
          allowNull: true
        },
        tenant_specific: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        version: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: '1.0.0'
        },
        created_by: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, {
        schema: 'platform_admin',
        transaction
      });

      // Create menu_items table
      await queryInterface.createTable('menu_items', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        menu_config_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'menu_configurations',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        key: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        icon: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        component: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        type: {
          type: Sequelize.ENUM('group', 'item', 'divider'),
          allowNull: false,
          defaultValue: 'item'
        },
        parent_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'menu_items',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        sort_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 100
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        permissions: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        user_types: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        banking_types: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        tenant_types: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        visibility_rules: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        breadcrumb: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        external: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        target: {
          type: Sequelize.ENUM('_self', '_blank', '_parent', '_top'),
          allowNull: false,
          defaultValue: '_self'
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, {
        schema: 'platform_admin',
        transaction
      });

      // Create menu_user_customizations table
      await queryInterface.createTable('menu_user_customizations', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: true
        },
        menu_config_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'menu_configurations',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        hidden_items: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        custom_order: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        bookmarks: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: []
        },
        preferences: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, {
        schema: 'platform_admin',
        transaction
      });

      // Create menu_access_logs table for analytics
      await queryInterface.createTable('menu_access_logs', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: true
        },
        menu_item_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'menu_items',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        accessed_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        response_time: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Response time in milliseconds'
        },
        success: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        error_message: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        accessed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, {
        schema: 'platform_admin',
        transaction
      });

      // Create indexes for performance
      await queryInterface.addIndex('menu_configurations', ['target_audience', 'banking_mode', 'is_active'], {
        schema: 'platform_admin',
        name: 'idx_menu_configurations_lookup',
        transaction
      });

      await queryInterface.addIndex('menu_items', ['menu_config_id', 'parent_id', 'sort_order'], {
        schema: 'platform_admin',
        name: 'idx_menu_items_hierarchy',
        transaction
      });

      await queryInterface.addIndex('menu_items', ['key'], {
        schema: 'platform_admin',
        name: 'idx_menu_items_key',
        transaction
      });

      await queryInterface.addIndex('menu_user_customizations', ['user_id', 'tenant_id'], {
        schema: 'platform_admin',
        name: 'idx_menu_user_customizations_user_tenant',
        transaction
      });

      await queryInterface.addIndex('menu_access_logs', ['user_id', 'accessed_at'], {
        schema: 'platform_admin',
        name: 'idx_menu_access_logs_user_time',
        transaction
      });

      await queryInterface.addIndex('menu_access_logs', ['menu_item_id', 'accessed_at'], {
        schema: 'platform_admin',
        name: 'idx_menu_access_logs_item_time',
        transaction
      });

      // Add unique constraints
      await queryInterface.addConstraint('menu_configurations', {
        fields: ['name', 'target_audience', 'banking_mode'],
        type: 'unique',
        name: 'uk_menu_configurations_name_audience_mode',
        transaction
      });

      await queryInterface.addConstraint('menu_items', {
        fields: ['menu_config_id', 'key'],
        type: 'unique',
        name: 'uk_menu_items_config_key',
        transaction
      });

      await queryInterface.addConstraint('menu_user_customizations', {
        fields: ['user_id', 'tenant_id', 'menu_config_id'],
        type: 'unique',
        name: 'uk_menu_user_customizations',
        transaction
      });

      await transaction.commit();
      console.log('✅ Menu system tables created successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Menu system migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop tables in reverse order (respecting foreign key constraints)
      await queryInterface.dropTable('menu_access_logs', {
        schema: 'platform_admin',
        transaction
      });

      await queryInterface.dropTable('menu_user_customizations', {
        schema: 'platform_admin',
        transaction
      });

      await queryInterface.dropTable('menu_items', {
        schema: 'platform_admin',
        transaction
      });

      await queryInterface.dropTable('menu_configurations', {
        schema: 'platform_admin',
        transaction
      });

      await transaction.commit();
      console.log('✅ Menu system tables dropped successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Menu system rollback failed:', error);
      throw error;
    }
  }
};