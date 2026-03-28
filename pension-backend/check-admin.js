const { executeQuery } = require('./src/config/database');

async function checkAdmin() {
  try {
    const admin = await executeQuery('SELECT * FROM users WHERE role = "admin"');
    console.log('Admin users found:', admin.length);
    admin.forEach(user => {
      console.log('Admin:', { id: user.user_id, email: user.email, role: user.role, approved: user.approved });
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkAdmin();
