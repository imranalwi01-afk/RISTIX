export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  bankingAccess: 'CONVENTIONAL' | 'BOTH';
  dualModeCertified: boolean;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRoleSummary {
  id: string;
  roleId: string;
  roleName: string;
  assignedAt?: string;
  isActive: boolean;
}

export interface UserFormData {
  email: string;
  username: string;
  fullName: string;
  password?: string;
  employeeId: string;
  department: string;
  position: string;
  bankingAccess: 'CONVENTIONAL' | 'BOTH';
  dualModeCertified: boolean;
  sendWelcomeEmail?: boolean;
}
