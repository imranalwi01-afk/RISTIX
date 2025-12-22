#!/usr/bin/env node
// packages/ifrs9-platform/scripts/verify-iaf-login.js
// Verify IAF users are properly configured for login

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying IAF users in login page...\n');

// Read the login page file
const loginPagePath = path.join(__dirname, '../packages/frontend/src/app/(auth)/login/page.tsx');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');

// Extract IAF users from the login page
const iafUsers = [];
const lines = loginPageContent.split('\n');
let inIafSection = false;
let currentUser = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('Indonesia Airawata Finance (IAF) Users')) {
    inIafSection = true;
    console.log('✅ Found IAF section in login page');
    continue;
  }
  
  if (inIafSection && line.includes('// Metro Bank Users')) {
    inIafSection = false;
    if (Object.keys(currentUser).length > 0) {
      iafUsers.push(currentUser);
    }
    break;
  }
  
  if (inIafSection && line.includes('email:')) {
    if (Object.keys(currentUser).length > 0) {
      iafUsers.push(currentUser);
    }
    currentUser = {};
    const emailMatch = line.match(/email: ['"`]([^'"`]+)['"`]/);
    if (emailMatch) currentUser.email = emailMatch[1];
  }
  
  if (inIafSection && line.includes('name:')) {
    const nameMatch = line.match(/name: ['"`]([^'"`]+)['"`]/);
    if (nameMatch) currentUser.name = nameMatch[1];
  }
  
  if (inIafSection && line.includes('role:')) {
    const roleMatch = line.match(/role: ['"`]([^'"`]+)['"`]/);
    if (roleMatch) currentUser.role = roleMatch[1];
  }
  
  if (inIafSection && line.includes('tenantId:')) {
    const tenantMatch = line.match(/tenantId: ['"`]([^'"`]+)['"`]/);
    if (tenantMatch) currentUser.tenantId = tenantMatch[1];
  }
}

// Add the last user if we ended in IAF section
if (inIafSection && Object.keys(currentUser).length > 0) {
  iafUsers.push(currentUser);
}

console.log(`\n📊 Found ${iafUsers.length} IAF users in login page:\n`);

iafUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name || 'Unknown Name'}`);
  console.log(`   Email: ${user.email || 'No email found'}`);
  console.log(`   Role: ${user.role || 'No role found'}`);
  console.log(`   Tenant: ${user.tenantId || 'No tenant found'}`);
  console.log('');
});

// Verify against database
const expectedUsers = [
  { email: 'cro@iaf.co.id', name: 'Budi Hartono', role: 'BANK_CRO' },
  { email: 'ifrs.manager@iaf.co.id', name: 'Sri Mulyani', role: 'BANK_IFRS_MANAGER' },
  { email: 'risk.analyst@iaf.co.id', name: 'Ahmad Syahril', role: 'BANK_RISK_ANALYST' }
];

console.log('🔍 Verification Results:');
let allFound = true;

expectedUsers.forEach(expectedUser => {
  const found = iafUsers.find(u => u.email === expectedUser.email);
  if (found) {
    console.log(`✅ ${expectedUser.email} - Found with correct details`);
    if (found.name !== expectedUser.name) {
      console.log(`⚠️  Name mismatch: Expected "${expectedUser.name}", got "${found.name}"`);
    }
    if (found.role !== expectedUser.role) {
      console.log(`⚠️  Role mismatch: Expected "${expectedUser.role}", got "${found.role}"`);
    }
    if (found.tenantId !== 'iaf') {
      console.log(`⚠️  Tenant mismatch: Expected "iaf", got "${found.tenantId}"`);
    }
  } else {
    console.log(`❌ ${expectedUser.email} - NOT FOUND`);
    allFound = false;
  }
});

console.log('\n' + '='.repeat(60));
if (allFound && iafUsers.length === 3) {
  console.log('🎉 SUCCESS: All 3 IAF users are properly configured in the login page!');
  console.log('🌐 They should now appear at: https://ifrs9.ifrspro.id/login');
} else {
  console.log('❌ ISSUE: Some IAF users are missing or misconfigured');
}
console.log('='.repeat(60));