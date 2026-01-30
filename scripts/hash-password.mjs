#!/usr/bin/env node
// Reset admin password to "1019181716" using Bun's bcrypt

const password = "1019181716";

async function hashPassword() {
  const hash = await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 10,
  });
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL to update:');
  console.log(`UPDATE core.users SET password_hash = '${hash}' WHERE email = 'admin@iaf.co.id';`);
}

hashPassword();
