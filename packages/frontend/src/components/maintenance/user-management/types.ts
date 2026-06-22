export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  assignedRolesList?: string[];
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
  sendWelcomeEmail?: boolean;
}
