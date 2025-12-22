#!/bin/bash
# scripts/codegen/generate-ifrs9-migrations.sh
# IFRS 9 Database Migrations Generator - DAY 3 HOUR 1

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
MIGRATIONS_DIR="${PROJECT_ROOT}/database/migrations"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Generate IFRS 9 calculation tables migration
generate_calculation_tables_migration() {
    log_info "Generating IFRS 9 calculation tables migration..."
    
    local timestamp=$(date +%Y%m%d%H%M%S)
    
    cat > "${MIGRATIONS_DIR}/${timestamp}-create-ifrs9-calculation-tables.js" << 'EOF'
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
EOF

    log_success "IFRS 9 calculation tables migration generated"
}

# Generate model configurations migration
generate_model_configs_migration() {
    log_info "Generating IFRS 9 model configurations migration..."
    
    local timestamp=$(date +%Y%m%d%H%M%S)
    
    cat > "${MIGRATIONS_DIR}/${timestamp}-create-ifrs9-model-configurations.js" << 'EOF'
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
EOF

    log_success "IFRS 9 model configurations migration generated"
}

# Generate R analytics schema migration
generate_r_analytics_migration() {
    log_info "Generating R analytics schema migration..."
    
    local timestamp=$(date +%Y%m%d%H%M%S)
    
    cat > "${MIGRATIONS_DIR}/${timestamp}-create-r-analytics-schema.js" << 'EOF'
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
EOF

    log_success "R analytics schema migration generated"
}

# Generate migration runner script
generate_migration_runner() {
    log_info "Generating migration runner script..."
    
    cat > "${PROJECT_ROOT}/scripts/database/run-ifrs9-migrations.sh" << 'EOF'
#!/bin/bash
# scripts/database/run-ifrs9-migrations.sh
# IFRS 9 Database Migrations Runner

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/ifrs9-migrations-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory
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
    log_error "Migration failed with exit code: ${exit_code}"
    exit ${exit_code}
}

trap handle_error ERR

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [[ -f "${PROJECT_ROOT}/.env.development" ]]; then
        source "${PROJECT_ROOT}/.env.development"
    elif [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
    fi
    
    # Set defaults
    export DB_HOST=${DB_HOST:-"localhost"}
    export DB_PORT=${DB_PORT:-5432}
    export DB_USER=${DB_USER:-"postgres"}
    export DB_PASSWORD=${DB_PASSWORD:-"postgres"}
}

# Run migrations for specific tenant
run_tenant_migrations() {
    local tenant_id=$1
    local banking_type=$2
    
    log_info "Running IFRS 9 migrations for tenant: ${tenant_id} (${banking_type})"
    
    local tenant_db="ifrspro_tenant_${tenant_id}_${banking_type}"
    
    # Set environment for this tenant database
    export DB_NAME="${tenant_db}"
    
    # Run migrations
    cd "${PROJECT_ROOT}/packages/backend"
    
    # Run Sequelize migrations
    npx sequelize-cli db:migrate --env development
    
    log_success "Migrations completed for tenant: ${tenant_id}"
}

# Run migrations for all tenants
run_all_tenant_migrations() {
    log_info "Running IFRS 9 migrations for all tenant databases..."
    
    # Get list of tenants from platform admin database
    local tenants_query="SELECT tenant_slug, banking_type FROM platform_admin.tenants WHERE is_active = true;"
    
    export DB_NAME="ifrspro_platform_admin"
    
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "${tenants_query}" | \
    while IFS='|' read -r tenant_slug banking_type; do
        tenant_slug=$(echo "$tenant_slug" | xargs)  # Trim whitespace
        banking_type=$(echo "$banking_type" | xargs)
        
        if [[ -n "$tenant_slug" && -n "$banking_type" ]]; then
            run_tenant_migrations "$tenant_slug" "$banking_type"
        fi
    done
}

# Verify migrations
verify_migrations() {
    log_info "Verifying IFRS 9 migrations..."
    
    # Check if calculation tables exist in tenant databases
    local check_query="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'calculation' AND table_name = 'ecl_jobs';"
    
    export DB_NAME="ifrspro_tenant_demo_conventional"
    local table_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "${check_query}" | xargs)
    
    if [[ "$table_count" -eq "1" ]]; then
        log_success "IFRS 9 tables verified successfully"
    else
        log_error "IFRS 9 tables verification failed"
        exit 1
    fi
}

# Main function
main() {
    log_info "=== IFRS 9 Database Migrations Runner ==="
    
    # Load environment
    load_environment
    
    # Parse command line arguments
    local command=${1:-"all"}
    
    case $command in
        "all")
            run_all_tenant_migrations
            ;;
        "tenant")
            if [[ $# -lt 3 ]]; then
                log_error "Usage: $0 tenant <tenant_id> <banking_type>"
                exit 1
            fi
            run_tenant_migrations "$2" "$3"
            ;;
        "verify")
            verify_migrations
            ;;
        *)
            log_error "Unknown command: $command"
            log_error "Usage: $0 [all|tenant|verify] [tenant_id] [banking_type]"
            exit 1
            ;;
    esac
    
    log_success "=== IFRS 9 Database Migrations Completed ==="
}

# Execute main function
main "$@"
EOF

    chmod +x "${PROJECT_ROOT}/scripts/database/run-ifrs9-migrations.sh"
    
    log_success "Migration runner script generated"
}

# Main function
main() {
    log_info "Starting IFRS 9 database migrations generation..."
    
    # Create directories
    mkdir -p "${MIGRATIONS_DIR}"
    mkdir -p "${PROJECT_ROOT}/scripts/database"
    
    # Generate migration files
    generate_calculation_tables_migration
    generate_model_configs_migration
    generate_r_analytics_migration
    generate_migration_runner
    
    log_success "IFRS 9 database migrations generation completed successfully!"
}

# Execute main function
main "$@"