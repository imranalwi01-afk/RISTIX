#!/usr/bin/env node
import postgres from 'postgres';

const sql = postgres({
  host: 'localhost',
  port: 5433,
  database: 'ifrspro_tenant_iaf',
  username: 'ifrs9_user',
  password: 'ifrs9_secure_password_2024'
});

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin user in ifrspro_tenant_iaf database...\n');
    
    // Check if user exists
    const users = await sql`
      SELECT 
        id, 
        email, 
        username,
        "firstName",
        "lastName",
        "isActive",
        "isVerified",
        "tenantId",
        "passwordHash"
      FROM core.users 
      WHERE email = 'admin@iaf.co.id'
    `;
    
    if (users.length === 0) {
      console.log('❌ User admin@iaf.co.id NOT FOUND in core.users table');
      console.log('\n📋 All users in database:');
      
      const allUsers = await sql`
        SELECT email, username, "isActive", "tenantId"
        FROM core.users 
        LIMIT 10
      `;
      
      console.table(allUsers);
      
      console.log('\n💡 Suggestion: Create the admin user or check the email address');
    } else {
      console.log('✅ User found:');
      console.table(users.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        isActive: u.isActive,
        isVerified: u.isVerified,
        tenantId: u.tenantId,
        hasPassword: !!u.passwordHash
      })));
      
      // Check user roles
      console.log('\n🔐 Checking user roles...');
      const roles = await sql`
        SELECT 
          ur.id,
          ur."userId",
          ur."roleId",
          r."roleCode",
          r."roleName"
        FROM rbac.user_roles ur
        LEFT JOIN rbac.roles r ON ur."roleId" = r.id
        WHERE ur."userId" = ${users[0].id}
      `;
      
      if (roles.length === 0) {
        console.log('⚠️  User has NO ROLES assigned');
      } else {
        console.log('✅ User roles:');
        console.table(roles);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkAdminUser();
