const { executeQuery } = require('./src/config/database');

async function debugOwnerLogin() {
  try {
    console.log('=== DEBUGGING OWNER LOGIN ===');
    
    // Check the owner's current status
    const owner = await executeQuery(
      'SELECT user_id, email, full_name, role, approved, created_at FROM users WHERE email = ?',
      ['owner@test.com']
    );
    
    if (owner.length === 0) {
      console.log('❌ Owner not found with email: owner@test.com');
      return;
    }
    
    console.log('✅ Owner found:');
    console.log(`- ID: ${owner[0].user_id}`);
    console.log(`- Email: ${owner[0].email}`);
    console.log(`- Name: ${owner[0].full_name}`);
    console.log(`- Role: ${owner[0].role}`);
    console.log(`- Approved: ${owner[0].approved}`);
    console.log(`- Should pass approval check: ${owner[0].role?.toLowerCase() !== 'admin' && owner[0].approved !== 1}`);
    
    // Check if there are other owners
    const allOwners = await executeQuery(
      'SELECT user_id, email, role, approved FROM users WHERE role = "Owner"'
    );
    
    console.log(`\n📊 All owners (${allOwners.length}):`);
    allOwners.forEach(o => {
      console.log(`- ${o.email}: role=${o.role}, approved=${o.approved}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

debugOwnerLogin();
