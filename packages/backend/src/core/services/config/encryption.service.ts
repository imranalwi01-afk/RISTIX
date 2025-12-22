// packages/backend/src/core/services/config/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private encryptionKey: Buffer;

  constructor(private readonly logger: Logger) {
    this.initializeEncryption();
  }

  /**
   * Initialize encryption with key from environment
   */
  private initializeEncryption(): void {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    if (key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    
    // Derive key using PBKDF2
    this.encryptionKey = crypto.pbkdf2Sync(key, 'ifrs9-platform-salt', 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(text: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('ifrs9-platform', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV + encrypted data + auth tag
      return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const tag = Buffer.from(parts[2], 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('ifrs9-platform', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash password or sensitive data
   */
  async hash(data: string, salt?: string): Promise<string> {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha256').toString('hex');
    return `${actualSalt}:${hash}`;
  }

  /**
   * Verify hashed data
   */
  async verifyHash(data: string, hashedData: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedData.split(':');
      const verifyHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha256').toString('hex');
      return hash === verifyHash;
    } catch (error) {
      this.logger.error('Hash verification failed', error);
      return false;
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate JWT secret
   */
  generateJWTSecret(): string {
    return this.generateSecureRandom(64);
  }

  /**
   * Generate encryption key
   */
  generateEncryptionKey(): string {
    return this.generateSecureRandom(32);
  }
}
