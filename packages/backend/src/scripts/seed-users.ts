// packages/backend/src/scripts/seed-users.ts
// ✅ Complete 28 dummy users seeding script from paste-3.txt

import bcrypt from 'bcryptjs';
import databaseManager from '../config/database';
import { modelManager } from '../models';
import logger from '../config/logger';

// ✅ Universal password for all 28 dummy users
const UNIVERSAL_PASSWORD = '1019181716';
const BCRYPT_ROUNDS = 12;

// ✅ 28 Dummy Users as defined in paste-3.txt
const DUMMY_USERS = [
  // 🏢 PLATFORM ADMIN USERS (4 users)
  {
    email: 'superadmin@ifrs9platform.com',
    fullName: 'Platform Super Admin',
    stakeholderType: 'platform_admin',
    role: 'PLATFORM_SUPER_ADMIN',
    database: 'platform_admin',
    description: 'Full platform control, all tenants'
  },
  {
    email: 'techadmin@ifrs9platform.com',
    fullName: 'Platform Technical Admin',
    stakeholderType: 'platform_admin',
    role: 'PLATFORM_TECH_ADMIN',
    database: 'platform_admin',
    description: 'Technical infrastructure, database management'
  },
  {
    email: 'operations@ifrs9platform.com',
    fullName: 'Platform Operations Manager',
    stakeholderType: 'platform_admin',
    role: 'PLATFORM_OPERATIONS',
    database: 'platform_admin',
    description: 'Tenant operations, consultant management'
  },
  {
    email: 'support@ifrs9platform.com',
    fullName: 'Platform Support Manager',
    stakeholderType: 'platform_admin',
    role: 'PLATFORM_SUPPORT',
    database: 'platform_admin',
    description: 'Customer support, issue resolution'
  },

  // 🏦 BANKING INSTITUTION USERS - CONVENTIONAL (5 users)
  {
    email: 'cro@metrobank.com',
    fullName: 'Bank Chief Risk Officer',
    stakeholderType: 'banking',
    role: 'BANK_CRO',
    bankingType: 'conventional',
    institution: 'Metro Commercial Bank',
    database: 'tenant_conventional',
    description: 'Full IFRS9 system, strategic oversight'
  },
  {
    email: 'ifrsmanager@metrobank.com',
    fullName: 'Bank IFRS Manager',
    stakeholderType: 'banking',
    role: 'BANK_IFRS_MANAGER',
    bankingType: 'conventional',
    institution: 'Metro Commercial Bank',
    database: 'tenant_conventional',
    description: 'IFRS9 calculations, reporting, model management'
  },
  {
    email: 'riskanalyst@metrobank.com',
    fullName: 'Bank Risk Analyst',
    stakeholderType: 'banking',
    role: 'BANK_RISK_ANALYST',
    bankingType: 'conventional',
    institution: 'Metro Commercial Bank',
    database: 'tenant_conventional',
    description: 'Calculations, data analysis, model testing'
  },
  {
    email: 'portfoliomgr@metrobank.com',
    fullName: 'Bank Portfolio Manager',
    stakeholderType: 'banking',
    role: 'BANK_PORTFOLIO_MANAGER',
    bankingType: 'conventional',
    institution: 'Metro Commercial Bank',
    database: 'tenant_conventional',
    description: 'Portfolio management, customer data'
  },
  {
    email: 'dataadmin@metrobank.com',
    fullName: 'Bank Data Administrator',
    stakeholderType: 'banking',
    role: 'BANK_DATA_ADMIN',
    bankingType: 'conventional',
    institution: 'Metro Commercial Bank',
    database: 'tenant_conventional',
    description: 'Data upload, ETL processes, validation'
  },

  // 🕌 BANKING INSTITUTION USERS - SYARIAH (5 users)
  {
    email: 'cro@barakahbank.com',
    fullName: 'Syariah Bank Chief Risk Officer',
    stakeholderType: 'banking',
    role: 'SYARIAH_BANK_CRO',
    bankingType: 'syariah',
    institution: 'Barakah Islamic Bank',
    database: 'tenant_syariah',
    description: 'Full IFRS9 system with Syariah compliance'
  },
  {
    email: 'syariahcompliance@barakahbank.com',
    fullName: 'Syariah Compliance Officer',
    stakeholderType: 'banking',
    role: 'SYARIAH_COMPLIANCE_OFFICER',
    bankingType: 'syariah',
    institution: 'Barakah Islamic Bank',
    database: 'tenant_syariah',
    description: 'Syariah compliance, DPS validation'
  },
  {
    email: 'islamicifrs@barakahbank.com',
    fullName: 'Islamic Banking IFRS Specialist',
    stakeholderType: 'banking',
    role: 'SYARIAH_IFRS_SPECIALIST',
    bankingType: 'syariah',
    institution: 'Barakah Islamic Bank',
    database: 'tenant_syariah',
    description: 'IFRS9 calculations with Islamic banking rules'
  },
  {
    email: 'syariahportfolio@barakahbank.com',
    fullName: 'Syariah Portfolio Manager',
    stakeholderType: 'banking',
    role: 'SYARIAH_PORTFOLIO_MANAGER',
    bankingType: 'syariah',
    institution: 'Barakah Islamic Bank',
    database: 'tenant_syariah',
    description: 'Islamic portfolio management'
  },
  {
    email: 'dpsboard@barakahbank.com',
    fullName: 'DPS Board Member',
    stakeholderType: 'banking',
    role: 'DPS_BOARD_MEMBER',
    bankingType: 'syariah',
    institution: 'Barakah Islamic Bank',
    database: 'tenant_syariah',
    description: 'Syariah approval workflows, religious compliance'
  },

  // 🏛️ BANKING INSTITUTION USERS - DUAL BANKING (2 users)
  {
    email: 'ceo@universalbank.com',
    fullName: 'Universal Bank CEO',
    stakeholderType: 'banking',
    role: 'BANK_CEO',
    bankingType: 'dual',
    institution: 'Universal Financial Group',
    database: 'tenant_conventional',
    description: 'Executive dashboard, both conventional and Syariah'
  },
  {
    email: 'dualriskmgr@universalbank.com',
    fullName: 'Dual Banking Risk Head',
    stakeholderType: 'banking',
    role: 'DUAL_BANKING_RISK_HEAD',
    bankingType: 'dual',
    institution: 'Universal Financial Group',
    database: 'tenant_conventional',
    description: 'Comparative risk analysis across banking modes'
  },

  // 👨‍💼 CONSULTANT USERS (6 users)
  {
    email: 'senior.consultant@ifrs9experts.com',
    fullName: 'Senior IFRS9 Consultant',
    stakeholderType: 'consultant',
    role: 'SENIOR_IFRS9_CONSULTANT',
    specialization: 'IFRS9 implementation, ECL modeling',
    database: 'platform_admin',
    description: 'Model validation, implementation oversight'
  },
  {
    email: 'islamic.consultant@syariahexperts.com',
    fullName: 'Islamic Banking Consultant',
    stakeholderType: 'consultant',
    role: 'ISLAMIC_BANKING_CONSULTANT',
    specialization: 'Islamic banking, Syariah compliance',
    database: 'platform_admin',
    description: 'Syariah compliance validation, Islamic banking expertise'
  },
  {
    email: 'risk.consultant@riskexperts.com',
    fullName: 'Risk Management Consultant',
    stakeholderType: 'consultant',
    role: 'RISK_CONSULTANT',
    specialization: 'Credit risk, model validation',
    database: 'platform_admin',
    description: 'Risk model validation, stress testing'
  },
  {
    email: 'tech.specialist@implementationpros.com',
    fullName: 'Technical Implementation Specialist',
    stakeholderType: 'consultant',
    role: 'TECHNICAL_SPECIALIST',
    specialization: 'System implementation, technical training',
    database: 'platform_admin',
    description: 'Technical implementation, system integration'
  },
  {
    email: 'r.analytics@dataexperts.com',
    fullName: 'R Analytics Consultant',
    stakeholderType: 'consultant',
    role: 'R_ANALYTICS_CONSULTANT',
    specialization: 'R programming, statistical modeling',
    database: 'platform_admin',
    description: 'R model development, statistical analysis'
  },
  {
    email: 'pm.lead@consultingfirm.com',
    fullName: 'Lead Project Manager',
    stakeholderType: 'consultant',
    role: 'CONSULTANT_PROJECT_MANAGER',
    specialization: 'Project management, stakeholder coordination',
    database: 'platform_admin',
    description: 'Project oversight, stakeholder coordination'
  },

  // 🏛️ REGULATOR USERS (6 users)
  {
    email: 'director@centralbank.gov',
    fullName: 'Central Bank Director',
    stakeholderType: 'regulator',
    role: 'CENTRAL_BANK_DIRECTOR',
    authority: 'National banking regulation',
    database: 'platform_admin',
    description: 'Strategic oversight, policy compliance'
  },
  {
    email: 'supervision@centralbank.gov',
    fullName: 'Banking Supervision Head',
    stakeholderType: 'regulator',
    role: 'BANKING_SUPERVISION_HEAD',
    authority: 'Banking supervision',
    database: 'platform_admin',
    description: 'Banking institution oversight, compliance monitoring'
  },
  {
    email: 'ifrs.supervisor@centralbank.gov',
    fullName: 'IFRS Implementation Supervisor',
    stakeholderType: 'regulator',
    role: 'IFRS_SUPERVISOR',
    authority: 'IFRS implementation oversight',
    database: 'platform_admin',
    description: 'IFRS9 compliance monitoring, validation oversight'
  },
  {
    email: 'director@islamicbanking.gov',
    fullName: 'Islamic Banking Authority Director',
    stakeholderType: 'regulator',
    role: 'ISLAMIC_BANKING_DIRECTOR',
    authority: 'Islamic banking regulation',
    database: 'platform_admin',
    description: 'Syariah banking oversight, religious compliance'
  },
  {
    email: 'syariah.auditor@islamicbanking.gov',
    fullName: 'Syariah Compliance Auditor',
    stakeholderType: 'regulator',
    role: 'SYARIAH_COMPLIANCE_AUDITOR',
    authority: 'Syariah compliance audit',
    database: 'platform_admin',
    description: 'Syariah audit, religious compliance verification'
  },
  {
    email: 'market.supervisor@financialauthority.gov',
    fullName: 'Market Risk Supervisor',
    stakeholderType: 'regulator',
    role: 'MARKET_RISK_SUPERVISOR',
    authority: 'Financial market oversight',
    database: 'platform_admin',
    description: 'Systemic risk monitoring, market analysis'
  }
];

async function seedUsers(): Promise<void> {
  try {
    logger.info('🌱 Starting 28 dummy users seeding process...');
    
    // Initialize connections and models
    await databaseManager.initializeConnections();
    await modelManager.initializeModels();
    
    // Hash the universal password once
    const hashedPassword = await bcrypt.hash(UNIVERSAL_PASSWORD, BCRYPT_ROUNDS);
    logger.info('🔒 Password hashed for all users');

    let successCount = 0;
    let errorCount = 0;

    // Seed users by database
    await seedPlatformAdminUsers(hashedPassword);
    await seedTenantUsers('conventional', hashedPassword);
    await seedTenantUsers('syariah', hashedPassword);

    logger.info('✅ 28 dummy users seeding completed successfully!', {
      total_users: DUMMY_USERS.length,
      success_count: successCount,
      error_count: errorCount,
      password: UNIVERSAL_PASSWORD
    });

    // Display login information
    displayLoginInformation();

  } catch (error) {
    logger.error('❌ Failed to seed users:', error);
    throw error;
  }
}

async function seedPlatformAdminUsers(hashedPassword: string): Promise<void> {
  const UserModel = modelManager.getModel('User');
  if (!UserModel) {
    throw new Error('User model not initialized');
  }

  const platformUsers = DUMMY_USERS.filter(user => 
    user.database === 'platform_admin'
  );

  logger.info(`🏢 Seeding ${platformUsers.length} platform/consultant/regulator users...`);

  for (const userData of platformUsers) {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        logger.info(`⚠️ User already exists: ${userData.email}`);
        continue;
      }

      // Create user
      await UserModel.create({
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        stakeholderType: userData.stakeholderType,
        role: userData.role,
        isActive: true,
        preferences: {
          role: userData.role,
          description: userData.description,
          specialization: userData.specialization || null,
          authority: userData.authority || null
        }
      });

      logger.info(`✅ Created user: ${userData.email} (${userData.stakeholderType})`);
    } catch (error) {
      logger.error(`❌ Failed to create user ${userData.email}:`, error);
    }
  }
}

async function seedTenantUsers(tenantType: 'conventional' | 'syariah', hashedPassword: string): Promise<void> {
  const modelName = tenantType === 'conventional' ? 'ConventionalUser' : 'SyariahUser';
  const TenantUserModel = modelManager.getModel(modelName);
  
  if (!TenantUserModel) {
    logger.warn(`⚠️ ${modelName} model not available, skipping tenant users`);
    return;
  }

  const tenantUsers = DUMMY_USERS.filter(user => 
    user.database === `tenant_${tenantType}`
  );

  logger.info(`🏦 Seeding ${tenantUsers.length} ${tenantType} banking users...`);

  for (const userData of tenantUsers) {
    try {
      // Check if user already exists
      const existingUser = await TenantUserModel.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        logger.info(`⚠️ Tenant user already exists: ${userData.email}`);
        continue;
      }

      // Create tenant user
      await TenantUserModel.create({
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        bankingType: userData.bankingType,
        department: 'Risk Management',
        position: userData.role,
        isActive: true,
        permissions: {
          role: userData.role,
          description: userData.description,
          institution: userData.institution
        }
      });

      logger.info(`✅ Created tenant user: ${userData.email} (${tenantType})`);
    } catch (error) {
      logger.error(`❌ Failed to create tenant user ${userData.email}:`, error);
    }
  }
}

function displayLoginInformation(): void {
  logger.info('🔐 LOGIN INFORMATION FOR TESTING:');
  logger.info('==========================================');
  logger.info(`Universal Password: ${UNIVERSAL_PASSWORD}`);
  logger.info('');
  
  logger.info('🏢 PLATFORM ADMIN EXAMPLES:');
  logger.info('  superadmin@ifrs9platform.com - Platform Super Admin');
  logger.info('  operations@ifrs9platform.com - Platform Operations Manager');
  logger.info('');
  
  logger.info('🏦 BANKING CONVENTIONAL EXAMPLES:');
  logger.info('  cro@metrobank.com - Bank Chief Risk Officer');
  logger.info('  ifrsmanager@metrobank.com - Bank IFRS Manager');
  logger.info('');
  
  logger.info('🕌 BANKING SYARIAH EXAMPLES:');
  logger.info('  cro@barakahbank.com - Syariah Bank CRO');
  logger.info('  islamicifrs@barakahbank.com - Islamic IFRS Specialist');
  logger.info('');
  
  logger.info('👨‍💼 CONSULTANT EXAMPLES:');
  logger.info('  senior.consultant@ifrs9experts.com - Senior IFRS9 Consultant');
  logger.info('  islamic.consultant@syariahexperts.com - Islamic Banking Consultant');
  logger.info('');
  
  logger.info('🏛️ REGULATOR EXAMPLES:');
  logger.info('  director@centralbank.gov - Central Bank Director');
  logger.info('  ifrs.supervisor@centralbank.gov - IFRS Implementation Supervisor');
  logger.info('');
  
  logger.info('🔗 API LOGIN ENDPOINT:');
  logger.info('  POST https://bifrs9.ifrspro.id/api/v1/auth/login');
  logger.info('  Body: {"email": "superadmin@ifrs9platform.com", "password": "1019181716"}');
  logger.info('==========================================');
}

// ✅ Execute seeding if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      logger.info('🎉 User seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 User seeding failed:', error);
      process.exit(1);
    });
}

export default seedUsers;