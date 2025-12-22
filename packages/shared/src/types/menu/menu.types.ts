// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/menu/menu.types.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Shared Types)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: TypeScript
// Purpose: Shared type definitions for menu system
// ============================================================================

export type BankingType = 'conventional' | 'syariah' | 'both';

export type PermissionType = 'view' | 'edit' | 'delete' | 'admin';

export enum MenuActionType {
  MENU_LOAD = 'menu_load',
  MENU_CLICK = 'menu_click',
  MENU_HOVER = 'menu_hover',
  MENU_SEARCH = 'menu_search',
  MENU_CREATE = 'menu_create',
  MENU_UPDATE = 'menu_update',
  MENU_DELETE = 'menu_delete',
  MENU_PERMISSION_UPDATE = 'menu_permission_update',
  MENU_PREFERENCE_UPDATE = 'menu_preference_update'
}

export interface MenuItemBase {
  id: string;
  tenantId: string;
  categoryId?: string;
  parentId?: string;
  name: string;
  description?: string;
  path?: string;
  icon?: string;
  component?: string;
  externalUrl?: string;
  sortOrder: number;
  level: number;
  isActive: boolean;
  isVisible: boolean;
  isExternal: boolean;
  requiresAuth: boolean;
  bankingType: BankingType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface MenuHierarchy extends MenuItemBase {
  children: MenuHierarchy[];
  isFavorite?: boolean;
  isPinned?: boolean;
  isHidden?: boolean;
}

export interface MenuPermission {
  id: string;
  tenantId: string;
  menuItemId: string;
  roleId: string;
  permissionType: PermissionType;
  isAllowed: boolean;
  conditions?: Record<string, any>;
  createdAt: Date;
  createdBy: string;
}

export interface MenuUserPreference {
  id: string;
  tenantId: string;
  userId: string;
  menuItemId: string;
  isFavorite: boolean;
  isPinned: boolean;
  isHidden: boolean;
  customName?: string;
  customIcon?: string;
  sortOrder: number;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuAnalytics {
  id: string;
  tenantId: string;
  userId: string;
  menuItemId?: string;
  sessionId?: string;
  actionType: MenuActionType;
  timestamp: Date;
  durationMs?: number;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
