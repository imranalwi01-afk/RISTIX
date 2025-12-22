// packages/backend/src/core/services/config/advanced-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PlatformConfiguration {
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  security: {
    jwtSecret: string;
    encryptionKey: string;
    saltRounds: number;
  };
  features: {
    advancedAnalytics: boolean;
    islamicBanking: boolean;
    auditTrail: boolean;
    stressTesting: boolean;
    mobileApi: boolean;
  };
  banking: {
    conventionalEnabled: boolean;
    syariahEnabled: boolean;
    dualModeEnabled: boolean;
  };
  performance: {
    cacheTimeout: number;
    maxConcurrentCalculations: number;
    queryTimeout: number;
  };
}

@Injectable()
export class AdvancedConfigurationService {
  private config: PlatformConfiguration;
  private readonly CACHE_PREFIX = 'config:';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {
    this.initializeConfiguration();
  }

  private async initializeConfiguration(): Promise<void> {
    this.config = {
      database: {
        host: this.configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(this.configService.get<string>('DB_PORT', '5432')),
        name: this.configService.get<string>('DB_NAME', 'ifrspro_platform_admin'),
        user: this.configService.get<string>('DB_USER', 'postgres'),
        password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
        ssl: this.configService.get<string>('DB_SSL') === 'true'
      },
      security: {
        jwtSecret: this.configService.get<string>('JWT_SECRET') || this.generateSecretKey(),
        encryptionKey: this.configService.get<string>('ENCRYPTION_KEY') || this.generateEncryptionKey(),
        saltRounds: parseInt(this.configService.get<string>('SALT_ROUNDS', '12'))
      },
      features: {
        advancedAnalytics: this.configService.get<string>('FEATURE_ADVANCED_ANALYTICS') === 'true',
        islamicBanking: this.configService.get<string>('FEATURE_ISLAMIC_BANKING') === 'true',
        auditTrail: this.configService.get<string>('FEATURE_AUDIT_TRAIL') === 'true',
        stressTesting: this.configService.get<string>('FEATURE_STRESS_TESTING') === 'true',
        mobileApi: this.configService.get<string>('FEATURE_MOBILE_API') === 'true'
      },
      banking: {
        conventionalEnabled: this.configService.get<string>('BANKING_CONVENTIONAL') !== 'false',
        syariahEnabled: this.configService.get<string>('BANKING_SYARIAH') !== 'false',
        dualModeEnabled: this.configService.get<string>('BANKING_DUAL_MODE') === 'true'
      },
      performance: {
        cacheTimeout: parseInt(this.configService.get<string>('CACHE_TIMEOUT', '300')),
        maxConcurrentCalculations: parseInt(this.configService.get<string>('MAX_CONCURRENT_CALC', '10')),
        queryTimeout: parseInt(this.configService.get<string>('QUERY_TIMEOUT', '30000'))
      }
    };
  }

  public async get<K extends keyof PlatformConfiguration>(key: K): Promise<PlatformConfiguration[K]> {
    return this.config[key];
  }

  private generateSecretKey(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }

  private generateEncryptionKey(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  public async validateConfiguration(): Promise<boolean> {
    try {
      const requiredConfigs = [
        'security.jwtSecret',
        'database.host',
        'database.name'
      ];

      for (const configPath of requiredConfigs) {
        const value = this.getNestedValue(this.config, configPath);
        if (!value) {
          throw new Error(`Missing required configuration: ${configPath}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
