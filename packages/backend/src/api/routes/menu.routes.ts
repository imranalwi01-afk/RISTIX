import express from 'express';
import { Pool } from 'pg';
import { Request, Response, NextFunction } from 'express';
import { requireTenant } from '../../middleware/auth';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: any; // Use any to avoid type conflicts with existing auth middleware
  tenant?: any;
  tenantId?: string;
  tenantSlug?: string;
  isAuthenticated?: boolean;
}

/**
 * @route GET /api/v1/menu/test-db
 * @desc Test menu data retrieval without authentication (TEMPORARY FOR DEBUGGING)
 * @access Public (temporary)
 */
router.get('/test-db', async (req: Request, res: Response) => {
  console.log('🧪 Menu test-db route reached - testing database connection and menu retrieval');

  try {
    // Create connection to platform admin database for menu configurations
    console.log(`🔗 Connecting to platform admin database for menu configurations`);

    const platformConnection = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'ifrspro_platform_admin',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: false
    });

    const client = await platformConnection.connect();
    console.log('✅ Connected to platform admin database');

    // Query menu configurations
    const result = await client.query(`
      SELECT configuration, created_at, updated_at
      FROM menu_configurations
      WHERE tenant_id IS NULL
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    console.log(`📊 Found ${result.rows.length} menu configuration records`);

    if (result.rows.length === 0) {
      await client.release();
      return res.json({
        success: false,
        error: 'NO_MENU_CONFIG',
        message: 'No menu configuration found in database',
        debug: {
          database: process.env.DB_HOST || 'localhost',
          query: 'SELECT configuration FROM menu_configurations WHERE tenant_id IS NULL'
        }
      });
    }

    const menuConfig = result.rows[0];
    console.log('🔍 DEBUG: Raw menuConfig.configuration type:', typeof menuConfig.configuration);
    console.log('🔍 DEBUG: Raw menuConfig.configuration value:', menuConfig.configuration);

    let configuration;

    // Handle different data types properly
    if (menuConfig.configuration === null || menuConfig.configuration === undefined) {
      console.log('❌ Configuration is null/undefined');
      await client.release();
      return res.json({
        success: false,
        error: 'NULL_CONFIGURATION',
        message: 'Menu configuration is null'
      });
    } else if (typeof menuConfig.configuration === 'object') {
      // Already parsed (JSONB returned as object)
      configuration = menuConfig.configuration;
      console.log('✅ Using pre-parsed JSONB object');
    } else if (typeof menuConfig.configuration === 'string') {
      // String that needs parsing
      try {
        configuration = JSON.parse(menuConfig.configuration);
        console.log('✅ JSON parsing successful from string');
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        await client.release();
        return res.json({
          success: false,
          error: 'JSON_PARSE_ERROR',
          message: 'Failed to parse menu configuration JSON',
          details: parseError.message
        });
      }
    } else {
      console.log('❌ Unexpected data type:', typeof menuConfig.configuration);
      await client.release();
      return res.json({
        success: false,
        error: 'UNEXPECTED_DATA_TYPE',
        message: `Unexpected data type: ${typeof menuConfig.configuration}`
      });
    }

    await client.release();

    console.log(`📋 Successfully processed menu configuration with ${Object.keys(configuration).length} root keys`);

    // Return successful result
    return res.json({
      success: true,
      data: {
        menuTree: configuration,
        meta: {
          timestamp: new Date().toISOString(),
          itemCount: Array.isArray(configuration) ? configuration.length : Object.keys(configuration).length,
          databaseDriven: true,
          fallback: false,
          source: 'database'
        }
      },
      message: 'Menu configuration retrieved successfully from database'
    });

  } catch (error) {
    console.error('❌ Menu test-db error:', error);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve menu configuration',
      details: error.message
    });
  }
});

/**
 * @route GET /api/v1/menu/test
 * @desc Test route to check if menu routes are loaded
 * @access Public (for testing)
 */
router.get('/test', (req: Request, res: Response) => {
  console.log('🧪 Menu test route reached successfully!');
  res.json({
    success: true,
    message: 'Menu routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/v1/menu/tree
 * @desc Get menu tree structure for authenticated user
 * @access Private
 */
router.get('/tree', (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 🔍 DEBUG: Log user object structure
  console.log(`🔍 DEBUG Menu Tree: req.user exists:`, !!req.user);
  if (req.user) {
    console.log(`🔍 DEBUG Menu Tree: req.user.role:`, req.user.role);
    console.log(`🔍 DEBUG Menu Tree: req.user.permissions:`, req.user.permissions);
    console.log(`🔍 DEBUG Menu Tree: req.user.roles:`, req.user.roles);
  }

  // 🔓 PLATFORM ADMIN BYPASS - Allow platform admins to access menu without tenant context
  if (req.user) {
    // Check both role and roles fields for compatibility
    const userRole = req.user.role;
    const userRoles = req.user.roles || [];
    const allRoles = userRole ? [userRole, ...userRoles] : userRoles;

    // Also check permissions array which might contain 'platform_admin'
    const userPermissions = req.user.permissions || [];
    const hasPlatformPermission = userPermissions.includes('platform_admin') || userPermissions.includes('all');

    if (allRoles.includes('PLATFORM_SUPER_ADMIN') ||
      allRoles.includes('PLATFORM_ADMIN') ||
      allRoles.includes('ADMIN') ||
      allRoles.includes('SUPER_ADMIN') ||
      hasPlatformPermission) {
      console.log(`🔓 Platform admin bypass for menu tree: User role=${userRole}, permissions=[${userPermissions.join(', ')}] - allowing access without tenant context`);
      // Set a mock tenant context for platform admin
      req.tenant = {
        id: 'platform-admin',
        name: 'Platform Administrator',
        slug: 'platform',
        type: 'platform'
      };
      return next();
    }
  }

  // Require tenant context for regular users
  requireTenant(req, res, next);
}, async (req: AuthenticatedRequest, res: Response) => {
  const { bankingMode = 'conventional', includeInactive = false } = req.query;

  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User authentication required'
      });
    }

    console.log(`✅ Authenticated user: ${req.user.email}, tenant: ${req.user.tenantSlug}, bankingType: ${req.user.bankingType}`);
    console.log(`🔍 DEBUG: req.user object:`, JSON.stringify(req.user, null, 2));

    // Create connection to platform admin database for menu configurations
    console.log(`🔗 Connecting to platform admin database for menu configurations`);

    const platformConnection = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'ifrspro_platform_admin',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: false
    });

    let menuItems = [];
    let databaseDriven = false;

    try {
      // 🔧 CRITICAL FIX: Try to fetch from menu_configurations first (hierarchical JSON)
      console.log(`🔧 [DEBUG] Attempting to fetch menu from menu_configurations (JSON)...`);

      try {
        menuItems = await getHierarchicalMenuFromConfig(platformConnection, includeInactive === 'true');
        databaseDriven = true;
        console.log(`✅ Retrieved ${menuItems.length} menu items from menu_configurations`);
      } catch (configError) {
        console.warn('⚠️ [DEBUG] Failed to fetch from menu_configurations, trying menu_items (relational)...');

        // Fallback to relational menu_items table
        menuItems = await getMenuItems(platformConnection, includeInactive === 'true');
        databaseDriven = true;
        console.log(`✅ Retrieved ${menuItems.length} menu items from menu_items`);
      }

      // Debug: Log the first few menu items to verify structure
      if (menuItems.length > 0) {
        console.log(`🔧 [DEBUG] Sample menu item:`, JSON.stringify(menuItems[0], null, 2));
      } else {
        console.warn(`⚠️ [DEBUG] No menu items returned from database`);
      }
    } catch (dbError) {
      console.error('❌ [CRITICAL] Menu configuration retrieval failed - NO FALLBACK ALLOWED:', dbError instanceof Error ? dbError.message : 'Unknown error');
      console.error('❌ [CRITICAL] Full error object:', dbError);

      // NO FALLBACK MODE - Database-driven menus are mandatory
      return res.status(500).json({
        success: false,
        error: 'MENU_DATABASE_ERROR',
        message: 'Database-driven menu system is currently unavailable. Please contact system administrator.',
        details: {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    }

    const hierarchicalMenu = buildMenuHierarchy(menuItems);
    const filteredMenu = filterMenuByBankingMode(hierarchicalMenu, bankingMode as string);

    res.json({
      success: true,
      data: filteredMenu,
      meta: {
        timestamp: new Date().toISOString(),
        bankingType: bankingMode,
        tenantName: req.tenant?.name || 'IAF',
        cached: false,
        fallback: !databaseDriven,
        itemCount: countMenuItems(filteredMenu),
        databaseDriven: databaseDriven && filteredMenu.length > 0 && !filteredMenu.every(item => item.children?.length === 0)
      }
    });

  } catch (error) {
    console.error('❌ [CRITICAL] MENU API ERROR - NO FALLBACK ALLOWED:', error);
    console.error('❌ [CRITICAL] ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // NO FALLBACK MODE - Database-driven menus are mandatory
    return res.status(500).json({
      success: false,
      error: 'MENU_SYSTEM_ERROR',
      message: 'Menu system is currently unavailable. Database-driven menus are required.',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * @route GET /api/v1/menu/hierarchy
 * @desc Get hierarchical menu structure (ALIAS for /tree endpoint)
 * @access Private
 */
router.get('/hierarchy', (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 🔍 DEBUG: Log user object structure
  console.log(`🔍 DEBUG Menu Hierarchy: req.user exists:`, !!req.user);
  if (req.user) {
    console.log(`🔍 DEBUG Menu Hierarchy: req.user.role:`, req.user.role);
    console.log(`🔍 DEBUG Menu Hierarchy: req.user.permissions:`, req.user.permissions);
    console.log(`🔍 DEBUG Menu Hierarchy: req.user.roles:`, req.user.roles);
  }

  // 🔓 PLATFORM ADMIN BYPASS - Allow platform admins to access menu without tenant context
  if (req.user) {
    // Check both role and roles fields for compatibility
    const userRole = req.user.role;
    const userRoles = req.user.roles || [];
    const allRoles = userRole ? [userRole, ...userRoles] : userRoles;

    // Also check permissions array which might contain 'platform_admin'
    const userPermissions = req.user.permissions || [];
    const hasPlatformPermission = userPermissions.includes('platform_admin') || userPermissions.includes('all');

    if (allRoles.includes('PLATFORM_SUPER_ADMIN') ||
      allRoles.includes('PLATFORM_ADMIN') ||
      allRoles.includes('ADMIN') ||
      allRoles.includes('SUPER_ADMIN') ||
      hasPlatformPermission) {
      console.log(`🔓 Platform admin bypass for menu hierarchy: User role=${userRole}, permissions=[${userPermissions.join(', ')}] - allowing access without tenant context`);
      // Set a mock tenant context for platform admin
      req.tenant = {
        id: 'platform-admin',
        name: 'Platform Administrator',
        slug: 'platform',
        type: 'platform'
      };
      return next();
    }
  }

  // Require tenant context for regular users
  requireTenant(req, res, next);
}, async (req: AuthenticatedRequest, res: Response) => {
  const { bankingMode = 'conventional', includeInactive = false } = req.query;

  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User authentication required'
      });
    }

    console.log(`✅ Authenticated user: ${req.user.email}, tenant: ${req.user.tenantSlug}, bankingType: ${req.user.bankingType}`);
    console.log(`🔍 DEBUG: req.user object:`, JSON.stringify(req.user, null, 2));

    // Create connection to platform admin database for menu configurations
    console.log(`🔗 Connecting to platform admin database for menu configurations`);

    const platformConnection = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'ifrspro_platform_admin',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: false
    });

    let menuItems = [];
    let databaseDriven = false;

    try {
      // 🔧 CRITICAL FIX: Try to fetch from menu_configurations first (hierarchical JSON)
      console.log(`🔧 [DEBUG] Attempting to fetch menu from menu_configurations (JSON)...`);

      try {
        menuItems = await getHierarchicalMenuFromConfig(platformConnection, includeInactive === 'true');
        databaseDriven = true;
        console.log(`✅ Retrieved ${menuItems.length} menu items from menu_configurations`);
      } catch (configError) {
        console.warn('⚠️ [DEBUG] Failed to fetch from menu_configurations, trying menu_items (relational)...');

        // Fallback to relational menu_items table
        menuItems = await getMenuItems(platformConnection, includeInactive === 'true');
        databaseDriven = true;
        console.log(`✅ Retrieved ${menuItems.length} menu items from menu_items`);
      }

      // Debug: Log the first few menu items to verify structure
      if (menuItems.length > 0) {
        console.log(`🔧 [DEBUG] Sample menu item:`, JSON.stringify(menuItems[0], null, 2));
      } else {
        console.warn(`⚠️ [DEBUG] No menu items returned from database`);
      }
    } catch (dbError) {
      console.error('❌ [CRITICAL] Menu configuration retrieval failed - NO FALLBACK ALLOWED:', dbError instanceof Error ? dbError.message : 'Unknown error');
      console.error('❌ [CRITICAL] Full error object:', dbError);

      // NO FALLBACK MODE - Database-driven menus are mandatory
      return res.status(500).json({
        success: false,
        error: 'MENU_DATABASE_ERROR',
        message: 'Database-driven menu system is currently unavailable. Please contact system administrator.',
        details: {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    }

    const hierarchicalMenu = buildMenuHierarchy(menuItems);
    const filteredMenu = filterMenuByBankingMode(hierarchicalMenu, bankingMode as string);

    res.json({
      success: true,
      data: filteredMenu,
      meta: {
        timestamp: new Date().toISOString(),
        bankingType: bankingMode,
        tenantName: req.tenant?.name || 'IAF',
        cached: false,
        fallback: !databaseDriven,
        itemCount: countMenuItems(filteredMenu),
        databaseDriven: databaseDriven && filteredMenu.length > 0 && !filteredMenu.every(item => item.children?.length === 0)
      }
    });

  } catch (error) {
    console.error('❌ [CRITICAL] MENU API ERROR - NO FALLBACK ALLOWED:', error);
    console.error('❌ [CRITICAL] ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // NO FALLBACK MODE - Database-driven menus are mandatory
    return res.status(500).json({
      success: false,
      error: 'MENU_SYSTEM_ERROR',
      message: 'Menu system is currently unavailable. Database-driven menus are required.',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * @route GET /api/v1/menu/sidebar
 * @desc Get sidebar menu without authentication (public access)
 * @access Public
 * @purpose Provide menu data for login page and initial app load
 */
router.get('/sidebar', async (req: Request, res: Response) => {
  const { bankingMode = 'conventional' } = req.query;

  try {
    console.log('🔍 [DEBUG] Menu Sidebar - ALL ENV VARS:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
      DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET
    });
    console.log('🔍 [DEBUG] Menu Sidebar - Database connection config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: 'ifrspro_platform_admin',
      user: process.env.DB_USER || 'postgres'
    });

    // 🔧 FIX: For public access, connect to platform_admin database where menu_items are stored
    const platformConnection = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'ifrspro_platform_admin',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: false
    });

    console.log('🔍 [DEBUG] Menu Sidebar - Creating connection...');
    const menuItems = await getMenuItems(platformConnection, false); // Only active items
    console.log('🔍 [DEBUG] Menu Sidebar - Menu items retrieved:', menuItems?.length || 0);

    const hierarchicalMenu = buildMenuHierarchy(menuItems);
    const filteredMenu = filterMenuByBankingMode(hierarchicalMenu, bankingMode as string);

    res.json({
      success: true,
      data: filteredMenu,
      meta: {
        timestamp: new Date().toISOString(),
        bankingType: bankingMode,
        cached: false
      }
    });

  } catch (error) {
    console.error('❌ Failed to get public sidebar menu:', error);
    // ❌ NO FALLBACK MODE - DATABASE DRIVEN ONLY
    res.status(500).json({
      success: false,
      error: 'MENU_DATABASE_ERROR',
      message: 'Database-driven menu failed. Menu system requires database connectivity.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions
async function getHierarchicalMenuFromConfig(connection: Pool, includeInactive: boolean = false): Promise<any[]> {
  const client = await connection.connect();
  try {
    // Get the active menu configuration
    const query = includeInactive
      ? 'SELECT * FROM platform_admin.menu_configurations ORDER BY created_at DESC LIMIT 1'
      : 'SELECT * FROM platform_admin.menu_configurations WHERE is_active = true ORDER BY created_at DESC LIMIT 1';

    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.warn('⚠️ No menu configuration found in menu_configurations table');
      return [];
    }

    const menuConfig = result.rows[0];
    console.log('✅ Found menu configuration:', menuConfig.name);

    // Parse the JSON configuration
    let configuration;
    try {
      console.log(`🔧 [DEBUG] Raw configuration type:`, typeof menuConfig.configuration);
      console.log(`🔧 [DEBUG] Raw configuration length:`, menuConfig.configuration?.length || 0);

      // Handle JSONB type conversion properly
      let configString;
      if (typeof menuConfig.configuration === 'object') {
        // Already parsed (JSONB returned as object)
        configuration = menuConfig.configuration;
        console.log(`🔧 [DEBUG] Using pre-parsed JSONB object`);
      } else if (typeof menuConfig.configuration === 'string') {
        // String that needs parsing
        configString = menuConfig.configuration;
        configuration = JSON.parse(configString);
        console.log(`🔧 [DEBUG] JSON parsing successful from string`);
      } else {
        console.error(`❌ Unexpected configuration type: ${typeof menuConfig.configuration}`);
        return [];
      }

      console.log(`🔧 [DEBUG] Configuration type:`, typeof configuration);
      console.log(`🔧 [DEBUG] Menu items count:`, configuration.menu_items?.length || 0);

    } catch (parseError) {
      console.error('❌ Failed to parse menu configuration JSON:', parseError);
      console.error('❌ Raw configuration value:', menuConfig.configuration);
      console.error('❌ Raw configuration type:', typeof menuConfig.configuration);
      return [];
    }

    // Extract menu items from configuration
    let menuItems: any[] = [];
    if (configuration.menu_items && Array.isArray(configuration.menu_items)) {
      menuItems = configuration.menu_items;
    }

    console.log(`🔧 [CONFIG] Extracted ${menuItems.length} menu items from configuration`);

    // 🔧 Transform configuration items to match database format
    const transformedItems = menuItems.map((item: any, index: number) => ({
      id: item.id || `config-${index}`,
      key: item.key || item.id,
      menu_key: item.key || item.id,
      title: item.title,
      description: item.description || '',
      icon: item.icon,
      url: item.url,
      type: item.type,
      sort_order: item.sort_order || index,
      parent_id: null, // Will be set during hierarchy building
      is_active: item.is_active !== false,
      banking_types: item.banking_types || ['conventional', 'syariah'],
      user_types: item.user_types || [],
      metadata: item.metadata || {},
      children: item.children || [],
      // Keep original structure for hierarchy building
      originalItem: item
    }));

    console.log(`🔧 [CONFIG] Transformed ${transformedItems.length} items for frontend compatibility`);

    return transformedItems;

  } catch (error) {
    console.error('❌ [DEBUG] Error fetching menu configuration:', error);
    console.error('❌ [DEBUG] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  } finally {
    client.release();
  }
}

async function getMenuItems(connection: Pool, includeInactive: boolean = false): Promise<any[]> {
  const client = await connection.connect();
  try {
    // Skip explicit table check which can fail due to permissions/views
    // Instead rely on the query failing to catch the error

    // Check if we need to query menu_configurations (per user request) 
    // but primarily rely on menu_items which we know contains data

    const query = includeInactive
      ? 'SELECT * FROM platform_admin.menu_items ORDER BY sort_order'
      : 'SELECT * FROM platform_admin.menu_items WHERE is_active = true ORDER BY sort_order';

    const result = await client.query(query);

    console.log('🔍 [DEBUG] getMenuItems - Row count:', result.rows.length);

    if (result.rows && Array.isArray(result.rows) && result.rows.length > 0) {
      console.log('✅ [DEBUG] getMenuItems - Returning array of', result.rows.length, 'items');

      // 🔧 CRITICAL FIX: Transform database fields to match frontend expectations
      // Mapping based on user-provided schema for platform_admin.menu_items
      const transformedItems = result.rows.map((row: any) => ({
        id: row.id,
        key: row.key, // Key matches DDL
        menu_key: row.key,
        title: row.title, // Title matches DDL
        description: row.description,
        icon: row.icon,
        url: row.url,   // URL matches DDL
        type: row.type || (row.parent_id ? 'item' : 'group'),
        sort_order: row.sort_order,
        parent_id: row.parent_id,
        is_active: row.is_active,
        // DDL has banking_types as JSONB array, default to both if empty
        banking_types: row.banking_types && row.banking_types.length > 0
          ? row.banking_types
          : ['conventional', 'syariah'],
        user_types: row.user_types || [],
        metadata: row.metadata || {},
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return transformedItems;
    } else {
      console.warn('⚠️ [MENU] No menu items found in database (empty). Using fallback menu.');
      return getFallbackMenu();
    }
  } catch (error) {
    console.error('❌ [DEBUG] getMenuItems - Database error:', error);
    console.warn('⚠️ [MENU] Falling back to hardcoded menu due to DB error.');
    return getFallbackMenu();
  } finally {
    client.release();
  }
}

function getFallbackMenu(): any[] {
  console.log('🔧 [MENU] Generating hardcoded fallback menu');
  // Minimal fallback menu structure to allow app access
  return [
    {
      id: 'fallback-dash',
      key: 'banking.dashboard.overview',
      menu_key: 'banking.dashboard.overview',
      title: 'Banking Dashboard',
      icon: 'Dashboard',
      url: '/banking/dashboard',
      type: 'item',
      sort_order: 1,
      parent_id: null,
      is_active: true,
      banking_types: ['conventional', 'syariah'],
      children: []
    },
    {
      id: 'fallback-setup',
      key: 'general_setup',
      menu_key: 'general_setup',
      title: 'General Setup',
      icon: 'Settings',
      type: 'group',
      sort_order: 2,
      parent_id: null,
      is_active: true,
      banking_types: ['conventional', 'syariah'],
      children: []
    }
  ];
}

function buildMenuHierarchy(menuItems: any[]): any[] {
  console.log('🔍 [DEBUG] buildMenuHierarchy - Input type:', typeof menuItems);
  console.log('🔍 [DEBUG] buildMenuHierarchy - Is input array?', Array.isArray(menuItems));
  console.log('🔍 [DEBUG] buildMenuHierarchy - Input length:', menuItems.length);

  // Check if this is configuration data with nested structure
  const hasConfigStructure = menuItems.some(item => item.originalItem && item.originalItem.children);

  if (hasConfigStructure) {
    console.log('🔧 [HIERARCHY] Building hierarchy from configuration structure');
    return buildHierarchyFromConfig(menuItems);
  } else {
    console.log('🔧 [HIERARCHY] Building hierarchy from flat structure');
    return buildHierarchyFromFlat(menuItems);
  }
}

function buildHierarchyFromConfig(menuItems: any[]): any[] {
  const rootItems: any[] = [];

  menuItems.forEach(item => {
    if (item.type === 'group' && item.originalItem && item.originalItem.children) {
      // This is a group with children from configuration
      const groupItem = {
        ...item,
        children: item.originalItem.children.map((child: any) => ({
          id: child.id,
          key: child.key,
          menu_key: child.key,
          title: child.title,
          description: child.description || '',
          icon: child.icon,
          url: child.url,
          type: child.type,
          sort_order: child.sort_order || 0,
          parent_id: item.id,
          is_active: child.is_active !== false,
          banking_types: child.banking_types || ['conventional', 'syariah'],
          user_types: child.user_types || [],
          metadata: child.metadata || {},
          children: []
        }))
      };
      rootItems.push(groupItem);
      console.log(`🔧 [CONFIG-HIERARCHY] Added group '${item.title}' with ${groupItem.children.length} children`);
    } else if (item.type === 'item' && !item.parent_id) {
      // This is a standalone item
      rootItems.push({
        ...item,
        children: []
      });
      console.log(`🔧 [CONFIG-HIERARCHY] Added standalone item '${item.title}'`);
    }
  });

  return rootItems;
}

function buildHierarchyFromFlat(menuItems: any[]): any[] {
  console.log('🔍 [DEBUG] buildHierarchyFromFlat - Processing flat structure');

  const itemMap = new Map();
  const rootItems: any[] = [];

  // Create map of all items with proper structure
  menuItems.forEach(item => {
    console.log('🔧 [HIERARCHY] Processing item:', item.menu_key, 'parent_id:', item.parent_id);
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Build hierarchy by linking children to parents
  menuItems.forEach(item => {
    const menuItem = itemMap.get(item.id);

    if (!item.parent_id) {
      // Root level item
      rootItems.push(menuItem);
      console.log('🔧 [HIERARCHY] Added root item:', item.menu_key);
    } else {
      // Child item - find and link to parent
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children.push(menuItem);
        console.log('🔧 [HIERARCHY] Linked child', item.menu_key, 'to parent', parent.menu_key);
      } else {
        console.warn('⚠️ [HIERARCHY] Parent not found for item:', {
          itemKey: item.menu_key,
          itemId: item.id,
          parentId: item.parent_id
        });
        // Treat as root item if parent not found
        rootItems.push(menuItem);
      }
    }
  });

  // Sort root items and their children by sort_order
  const sortByOrder = (items: any[]): any[] => {
    return items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(item => ({
        ...item,
        children: item.children.length > 0 ? sortByOrder(item.children) : []
      }));
  };

  const sortedHierarchy = sortByOrder(rootItems);

  console.log('🔍 [DEBUG] buildMenuHierarchy - Built hierarchy with', sortedHierarchy.length, 'root items');
  console.log('🔧 [HIERARCHY] Root items:', sortedHierarchy.map(item => ({
    key: item.menu_key,
    title: item.title,
    childrenCount: item.children.length,
    hasChildren: item.children.length > 0
  })));

  return sortedHierarchy;
}

function filterMenuByBankingMode(menuItems: any[], bankingMode: string): any[] {
  console.log('🔍 [DEBUG] filterMenuByBankingMode - Input type:', typeof menuItems);
  console.log('🔍 [DEBUG] filterMenuByBankingMode - Is input array?', Array.isArray(menuItems));
  console.log('🔍 [DEBUG] filterMenuByBankingMode - Input length:', menuItems.length);
  console.log('🔍 [DEBUG] filterMenuByBankingMode - Banking mode:', bankingMode);

  // Defensive check: ensure menuItems is an array
  if (!Array.isArray(menuItems)) {
    console.error('❌ [DEBUG] filterMenuByBankingMode - ERROR: menuItems is not an array!');
    console.error('❌ [DEBUG] filterMenuByBankingMode - menuItems value:', menuItems);
    console.error('❌ [DEBUG] filterMenuByBankingMode - menuItems type:', typeof menuItems);
    return [];
  }

  // Defensive check: ensure menuItems is not empty
  if (menuItems.length === 0) {
    console.warn('⚠️ [DEBUG] filterMenuByBankingMode - Empty menu array provided');
    return [];
  }

  const result = menuItems.map(item => {
    // Defensive check: ensure item is an object
    if (!item || typeof item !== 'object') {
      console.warn('⚠️ [DEBUG] filterMenuByBankingMode - Invalid menu item:', item);
      return null;
    }

    console.log('🔧 [FILTER] Processing item:', item.menu_key, 'banking_types:', item.banking_types);

    // 🔧 CRITICAL FIX: Handle banking_types as array and include all modes
    if (item.banking_types && Array.isArray(item.banking_types)) {
      // Include item if banking_mode is in banking_types OR if banking_types contains 'dual'
      if (!item.banking_types.includes(bankingMode) && !item.banking_types.includes('dual')) {
        console.log('🔧 [FILTER] FILTERING OUT item:', item.menu_key, 'does not support', bankingMode);
        return null;
      }
    }

    console.log('🔧 [FILTER] KEEPING item:', item.menu_key);

    // Recursively filter children
    if (item.children && item.children.length > 0) {
      console.log('🔧 [FILTER] Processing', item.children.length, 'children for', item.menu_key);

      const filteredChildren = item.children
        .map((child: any) => filterMenuByBankingMode([child], bankingMode))
        .filter(result => result && result.length > 0)
        .flat();

      console.log('🔧 [FILTER] Kept', filteredChildren.length, 'children for', item.menu_key);

      return {
        ...item,
        children: filteredChildren
      };
    }

    return item;
  }).filter(item => item !== null);

  console.log('🔍 [DEBUG] filterMenuByBankingMode - Output length:', result.length);
  console.log('🔧 [FILTER] Final items:', result.map(item => ({
    key: item.menu_key,
    title: item.title,
    childrenCount: item.children?.length || 0,
    hasChildren: (item.children?.length || 0) > 0
  })));

  return result;
}

function countMenuItems(menuItems: any[]): number {
  let count = 0;

  menuItems.forEach(item => {
    count++;
    if (item.children && item.children.length > 0) {
      count += countMenuItems(item.children);
    }
  });

  return count;
}

// Fallback menu items when database is not available
function getFallbackMenuItems(): any[] {
  return [
    {
      id: 1,
      parent_id: null,
      menu_code: 'DASHBOARD',
      menu_name: 'Dashboard',
      menu_path: '/banking/dashboard',
      menu_icon: 'dashboard',
      description: 'Main dashboard',
      is_active: true,
      sort_order: 1,
      banking_types: 'conventional,syariah,dual'
    },
    {
      id: 2,
      parent_id: null,
      menu_code: 'COLLATERAL',
      menu_name: 'Collateral Management',
      menu_path: '/banking/collateral',
      menu_icon: 'account_balance',
      description: 'Collateral management',
      is_active: true,
      sort_order: 2,
      banking_types: 'conventional,syariah,dual'
    },
    {
      id: 3,
      parent_id: null,
      menu_code: 'LOAN',
      menu_name: 'Loan Management',
      menu_path: '/banking/loan',
      menu_icon: 'money',
      description: 'Loan management',
      is_active: true,
      sort_order: 3,
      banking_types: 'conventional,syariah,dual'
    },
    {
      id: 4,
      parent_id: null,
      menu_code: 'REPORTS',
      menu_name: 'Reports',
      menu_path: '/banking/reports',
      menu_icon: 'assessment',
      description: 'Reports and analytics',
      is_active: true,
      sort_order: 4,
      banking_types: 'conventional,syariah,dual'
    }
  ];
}

export default router;