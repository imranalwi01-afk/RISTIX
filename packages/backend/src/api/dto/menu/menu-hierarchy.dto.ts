// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/dto/menu/menu-hierarchy.dto.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Menu DTOs)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Class Validator, Class Transformer
// Purpose: Data Transfer Objects for menu hierarchy and operations
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BankingType, MenuActionType, PermissionType } from '@shared/types/menu';

export class MenuHierarchyDto {
  @ApiProperty({ description: 'Menu item unique identifier' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Menu item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu item path/route' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: 'Menu item icon' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Menu item hierarchy level' })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'Parent menu item ID' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Sort order within level' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Is item marked as favorite by user' })
  @IsBoolean()
  isFavorite: boolean;

  @ApiProperty({ description: 'Is item pinned by user' })
  @IsBoolean()
  isPinned: boolean;

  @ApiProperty({ description: 'Child menu items', type: [MenuHierarchyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuHierarchyDto)
  children: MenuHierarchyDto[];
}

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Menu item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Parent menu item ID', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Menu item path/route', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: 'Menu item icon', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'React component name', required: false })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiProperty({ description: 'External URL', required: false })
  @IsString()
  @IsOptional()
  externalUrl?: string;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Menu level (auto-calculated)', required: false })
  @IsNumber()
  @IsOptional()
  level?: number;

  @ApiProperty({ description: 'Is menu item active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Is menu item visible' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean = true;

  @ApiProperty({ description: 'Is external URL' })
  @IsBoolean()
  @IsOptional()
  isExternal?: boolean = false;

  @ApiProperty({ description: 'Requires authentication' })
  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean = true;

  @ApiProperty({ 
    description: 'Banking type compatibility',
    enum: ['conventional', 'syariah', 'both']
  })
  @IsEnum(['conventional', 'syariah', 'both'])
  @IsOptional()
  bankingType?: BankingType = 'both';
}

export class UpdateMenuItemDto {
  @ApiProperty({ description: 'Menu item name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Menu item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Menu item path/route', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: 'Menu item icon', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'React component name', required: false })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiProperty({ description: 'External URL', required: false })
  @IsString()
  @IsOptional()
  externalUrl?: string;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Is menu item active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Is menu item visible', required: false })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({ description: 'Is external URL', required: false })
  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @ApiProperty({ description: 'Requires authentication', required: false })
  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean;

  @ApiProperty({ 
    description: 'Banking type compatibility',
    enum: ['conventional', 'syariah', 'both'],
    required: false
  })
  @IsEnum(['conventional', 'syariah', 'both'])
  @IsOptional()
  bankingType?: BankingType;
}

export class MenuPermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ 
    description: 'Permission type',
    enum: ['view', 'edit', 'delete', 'admin']
  })
  @IsEnum(['view', 'edit', 'delete', 'admin'])
  permissionType: PermissionType;

  @ApiProperty({ description: 'Is permission allowed' })
  @IsBoolean()
  isAllowed: boolean;

  @ApiProperty({ description: 'Additional permission conditions', required: false })
  @IsOptional()
  conditions?: Record<string, any>;
}

export class UserMenuPreferenceDto {
  @ApiProperty({ description: 'Menu item ID' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ description: 'Is favorite', required: false })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean = false;

  @ApiProperty({ description: 'Is pinned', required: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean = false;

  @ApiProperty({ description: 'Is hidden', required: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = false;

  @ApiProperty({ description: 'Custom name', required: false })
  @IsString()
  @IsOptional()
  customName?: string;

  @ApiProperty({ description: 'Custom icon', required: false })
  @IsString()
  @IsOptional()
  customIcon?: string;

  @ApiProperty({ description: 'Custom sort order', required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Additional settings', required: false })
  @IsOptional()
  settings?: Record<string, any>;
}

export class MenuAnalyticsDto {
  @ApiProperty({ description: 'Analytics record ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Menu item ID' })
  @IsUUID()
  @IsOptional()
  menuItemId?: string;

  @ApiProperty({ description: 'Menu item name' })
  @IsString()
  @IsOptional()
  menuItemName?: string;

  @ApiProperty({ 
    description: 'Action type',
    enum: MenuActionType
  })
  @IsEnum(MenuActionType)
  actionType: MenuActionType;

  @ApiProperty({ description: 'Action timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;

  @ApiProperty({ description: 'Action duration in milliseconds', required: false })
  @IsNumber()
  @IsOptional()
  durationMs?: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Session ID', required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;
}
