const { executeQuery } = require('./src/config/database');

async function checkBookingsColumns() {
  try {
    console.log('=== CHECKING BOOKINGS TABLE COLUMNS ===');
    
    // Get column information
    const columns = await executeQuery('DESCRIBE bookings');
    
    console.log('Bookings table columns:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Test a simple query
    console.log('\n=== TESTING SIMPLE QUERY ===');
    const testQuery = await executeQuery('SELECT COUNT(*) as count FROM bookings');
    console.log(`Bookings count: ${testQuery[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkBookingsColumns();
