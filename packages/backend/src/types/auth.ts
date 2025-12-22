// packages/backend/src/types/auth.ts
// ✅ Complete authentication type definitions

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  stakeholderType: 'platform_admin' | 'banking' | 'consultant' | 'regulator';
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  department?: string;
  position?: string;
  permissions?: Record<string, any>;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankingInstitution {
  id: string;
  name: string;
  slug: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  country: string;
  tier: 'basic' | 'professional' | 'enterprise';
  databaseName: string;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: UserInfo;
  tenant?: TenantInfo;
  expiresIn: string;
  tokenType: 'Bearer';
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  stakeholderType: string;
  role: string;
  isActive: boolean;
  tenantId?: string;
  bankingType?: string;
  lastLogin?: Date;
  preferences?: Record<string, any>;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  bankingType: string;
  tier: string;
  databaseName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface MeResponse {
  success: boolean;
  user: UserInfo;
  tenant?: TenantInfo;
  permissions: string[];
  features: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  stakeholderType: string;
  role: string;
  tenantId?: string;
  bankingType?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest {
  user: UserInfo;
  tenant?: TenantInfo;
  requestId: string;
}

export interface PermissionLevel {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  conditions?: Record<string, any>;
}

export interface RoleDefinition {
  name: string;
  stakeholderType: string;
  permissions: PermissionLevel[];
  description: string;
  isSystem: boolean;
}

// ✅ Stakeholder-specific role types
export type PlatformAdminRole = 
  | 'PLATFORM_SUPER_ADMIN'
  | 'PLATFORM_TECH_ADMIN'
  | 'PLATFORM_OPERATIONS'
  | 'PLATFORM_SUPPORT';

export type BankingRole = 
  | 'BANK_CRO'
  | 'BANK_IFRS_MANAGER'
  | 'BANK_RISK_ANALYST'
  | 'BANK_PORTFOLIO_MANAGER'
  | 'BANK_DATA_ADMIN'
  | 'SYARIAH_BANK_CRO'
  | 'SYARIAH_COMPLIANCE_OFFICER'
  | 'SYARIAH_IFRS_SPECIALIST'
  | 'SYARIAH_PORTFOLIO_MANAGER'
  | 'DPS_BOARD_MEMBER'
  | 'BANK_CEO'
  | 'DUAL_BANKING_RISK_HEAD';

export type ConsultantRole = 
  | 'SENIOR_IFRS9_CONSULTANT'
  | 'ISLAMIC_BANKING_CONSULTANT'
  | 'RISK_CONSULTANT'
  | 'TECHNICAL_SPECIALIST'
  | 'R_ANALYTICS_CONSULTANT'
  | 'CONSULTANT_PROJECT_MANAGER';

export type RegulatorRole = 
  | 'CENTRAL_BANK_DIRECTOR'
  | 'BANKING_SUPERVISION_HEAD'
  | 'IFRS_SUPERVISOR'
  | 'ISLAMIC_BANKING_DIRECTOR'
  | 'SYARIAH_COMPLIANCE_AUDITOR'
  | 'MARKET_RISK_SUPERVISOR';

export type UserRole = PlatformAdminRole | BankingRole | ConsultantRole | RegulatorRole;

export interface AuthError {
  type: 'AUTH_ERROR' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'USER_NOT_FOUND' | 'INSUFFICIENT_PERMISSIONS';
  message: string;
  code: string;
  details?: any;
}

export interface SessionInfo {
  userId: string;
  email: string;
  stakeholderType: string;
  role: string;
  tenantId?: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string; // Only in development
}

export interface PasswordResetConfirm {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ✅ Multi-tenant authentication context
export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  databaseName: string;
  tier: string;
  features: string[];
  settings: Record<string, any>;
}

// ✅ Permission checking utilities
export interface PermissionChecker {
  hasPermission(resource: string, action: string): boolean;
  hasRole(role: string): boolean;
  hasStakeholderType(stakeholderType: string): boolean;
  canAccessTenant(tenantId: string): boolean;
  canAccessResource(resource: string, resourceId?: string): boolean;
}

// ✅ Authentication middleware options
export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: string[];
  stakeholders?: string[];
  permissions?: string[];
  tenantAccess?: boolean;
}

// ✅ Token generation options
export interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
  subject?: string;
  jwtId?: string;
}

// ✅ Authentication service interface
export interface AuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(request: LogoutRequest): Promise<LogoutResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse>;
  getCurrentUser(token: string): Promise<MeResponse>;
  validateToken(token: string): Promise<JWTPayload | null>;
  generateTokens(user: UserInfo, tenant?: TenantInfo): Promise<{ token: string; refreshToken: string }>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  createSession(user: UserInfo, request: any): Promise<SessionInfo>;
  destroySession(userId: string, sessionId?: string): Promise<void>;
}

// Type collections as const (not values)
export type AuthTypes = {
  User: User;
  TenantUser: TenantUser;
  BankingInstitution: BankingInstitution;
  LoginRequest: LoginRequest;
  LoginResponse: LoginResponse;
  UserInfo: UserInfo;
  TenantInfo: TenantInfo;
  JWTPayload: JWTPayload;
  AuthenticatedRequest: AuthenticatedRequest;
  PermissionLevel: PermissionLevel;
  RoleDefinition: RoleDefinition;
  AuthError: AuthError;
  SessionInfo: SessionInfo;
  TenantContext: TenantContext;
  PermissionChecker: PermissionChecker;
  AuthMiddlewareOptions: AuthMiddlewareOptions;
  TokenOptions: TokenOptions;
};