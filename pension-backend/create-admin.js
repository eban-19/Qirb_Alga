const { executeQuery } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await executeQuery('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    if (existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await executeQuery(
        'INSERT INTO users (full_name, email, password_hash, role, approved) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@pension.com', hashedPassword, 'admin', 1]
      );
      console.log('✅ Admin user created: admin@pension.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
  process.exit(0);
}

createAdmin();
