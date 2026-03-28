const { executeQuery } = require('./src/config/database');

async function createPensionForOwner() {
  try {
    console.log('=== Creating pension for owner ID 46 ===');
    
    // Check if owner exists
    const owner = await executeQuery(
      'SELECT user_id, full_name, email FROM users WHERE user_id = ?',
      [46]
    );
    
    if (owner.length === 0) {
      console.log('❌ Owner 46 not found');
      return;
    }
    
    console.log('✅ Owner found:', owner[0]);
    
    // Check if pension already exists for this owner
    const existingPension = await executeQuery(
      'SELECT pension_id, name FROM pensions WHERE owner_id = ?',
      [46]
    );
    
    if (existingPension.length > 0) {
      console.log('✅ Pension already exists:', existingPension[0]);
    } else {
      // Create a sample pension for this owner
      const result = await executeQuery(`
        INSERT INTO pensions (owner_id, name, phone, email, description, city, capacity, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        46, // owner_id
        'Test Pension', // name
        '+251911587690', // phone
        'owner@test.com', // email
        'A test pension created for owner', // description
        'Addis Ababa', // city
        10 // capacity
      ]);
      
      console.log('✅ Pension created with ID:', result.insertId);
    }
    
  } catch (error) {
    console.error('Error creating pension:', error);
  }
  process.exit(0);
}

createPensionForOwner();
