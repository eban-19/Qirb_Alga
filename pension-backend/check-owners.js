const { executeQuery } = require('./src/config/database');

async function checkOwners() {
  try {
    console.log('=== CHECKING OWNERS IN DATABASE ===');
    
    // Check all owners
    const owners = await executeQuery(`
      SELECT user_id, email, full_name, role, approved, created_at
      FROM users 
      WHERE role = 'Owner' OR role = 'owner'
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${owners.length} owners:`);
    owners.forEach(owner => {
      console.log(`- ID: ${owner.user_id}, Email: ${owner.email}, Name: ${owner.full_name}, Role: ${owner.role}, Approved: ${owner.approved}`);
    });
    
    // Check properties linked to owners
    const properties = await executeQuery(`
      SELECT p.pension_id, p.owner_id, p.name, p.status, u.full_name as owner_name
      FROM pensions p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.created_at DESC
    `);
    
    console.log(`\nFound ${properties.length} properties:`);
    properties.forEach(property => {
      console.log(`- Property: ${property.name}, Owner: ${property.owner_name}, Status: ${property.status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkOwners();
