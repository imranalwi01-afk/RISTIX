// Generate bcrypt hash for superadmin@iaf.co.id user
const bcrypt = require('bcryptjs');

const password = '1019181716';
const saltRounds = 12;

console.log('🔐 Generating bcrypt hash for superadmin@iaf.co.id');
console.log('Password:', password);
console.log('Salt rounds:', saltRounds);

// Generate hash
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('❌ Error generating hash:', err);
        process.exit(1);
    }

    console.log('✅ Generated hash:');
    console.log(hash);

    // Verify the hash works
    bcrypt.compare(password, hash, (err, result) => {
        if (err) {
            console.error('❌ Error verifying hash:', err);
            process.exit(1);
        }

        console.log('✅ Hash verification:', result ? 'SUCCESS' : 'FAILED');
        console.log('');
        console.log('📋 SQL Update:');
        console.log("password_hash = '" + hash + "'");
        process.exit(0);
    });
});