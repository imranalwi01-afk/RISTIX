// tests/unit/auth/jwt.service.test.ts
import { JWTService, AuthContext } from '../../../src/core/services/auth/jwt.service';
import { RedisService } from '../../../src/core/services/redis/redis.service';
import { ConfigurationService } from '../../../src/core/services/configuration/configuration.service';
import { AuditService } from '../../../src/core/services/audit/audit.service';

// Mock dependencies
jest.mock('../../../src/core/services/redis/redis.service');
jest.mock('../../../src/core/services/configuration/configuration.service');
jest.mock('../../../src/core/services/audit/audit.service');

describe('JWTService', () => {
  let jwtService: JWTService;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockConfigService: jest.Mocked<ConfigurationService>;
  let mockAuditService: jest.Mocked<AuditService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    roles: [{ roleName: 'USER' }],
    passwordChangedAt: new Date(),
    forcePasswordChange: false
  };

  const mockTenant = {
    id: 'tenant-123',
    slug: 'test-tenant',
    name: 'Test Tenant',
    bankingType: 'CONVENTIONAL',
    complianceLevel: 'standard'
  };

  const mockAuthContext: AuthContext = {
    sessionId: 'session-123',
    deviceId: 'device-123',
    ipAddress: '127.0.0.1',
    userAgent: 'Test User Agent',
    loginMethod: 'password',
    mfaVerified: false,
    riskScore: 0,
    temporaryAccess: false
  };

  beforeEach(() => {
    mockRedisService = new RedisService({} as any) as jest.Mocked<RedisService>;
    mockConfigService = new ConfigurationService({} as any) as jest.Mocked<ConfigurationService>;
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;

    // Setup default mocks
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'jwt.secret') return Promise.resolve('test-secret');
      if (key === 'jwt.signingKey') return Promise.resolve('test-signing-key');
      return Promise.resolve(undefined);
    });

    jwtService = new JWTService(mockRedisService, mockConfigService, mockAuditService);
  });

  describe('generateTokenPair', () => {
    it('should generate valid token pair', async () => {
      mockRedisService.setex.mockResolvedValue();
      mockAuditService.log.mockResolvedValue();

      const result = await jwtService.generateTokenPair(mockUser, mockTenant, mockAuthContext);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.tokenType).toBe('Bearer');
      expect(mockRedisService.setex).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should handle token generation errors', async () => {
      mockRedisService.setex.mockRejectedValue(new Error('Redis error'));

      await expect(
        jwtService.generateTokenPair(mockUser, mockTenant, mockAuthContext)
      ).rejects.toThrow('Failed to generate JWT tokens');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockPayload = {
        sub: 'user-123',
        jti: 'token-123',
        sessionId: 'session-123'
      };

      // Mock successful verification
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(mockPayload);
      mockRedisService.get.mockResolvedValue(null); // Not blacklisted
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify({
        accessTokenJti: 'token-123'
      })); // Session data

      const result = await jwtService.verifyToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should reject blacklisted token', async () => {
      const mockPayload = { sub: 'user-123', jti: 'token-123' };
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(mockPayload);
      mockRedisService.get.mockResolvedValue('revoked'); // Blacklisted

      await expect(jwtService.verifyToken('blacklisted-token'))
        .rejects.toThrow('Token has been revoked');
    });
  });

  describe('revokeToken', () => {
    it('should revoke token successfully', async () => {
      const mockPayload = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        jti: 'token-123',
        sessionId: 'session-123',
        ipAddress: '127.0.0.1',
        auditContext: { userAgent: 'Test Agent' }
      };

      jest.spyOn(jwtService, 'verifyToken').mockResolvedValue(mockPayload as any);
      mockRedisService.setex.mockResolvedValue();
      mockRedisService.del.mockResolvedValue(1);
      mockAuditService.log.mockResolvedValue();

      await jwtService.revokeToken('valid-token', 'session-123');

      expect(mockRedisService.setex).toHaveBeenCalled(); // Blacklist token
      expect(mockRedisService.del).toHaveBeenCalled(); // Remove session
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });
});
