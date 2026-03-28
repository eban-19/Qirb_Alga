const { executeQuery } = require('./src/config/database');

async function checkExpensesTable() {
  try {
    console.log('=== CHECKING EXPENSES TABLE STRUCTURE ===');
    
    // Get table structure
    const structure = await executeQuery('DESCRIBE expenses');
    console.log('Expenses table columns:');
    structure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Get sample data
    const sampleData = await executeQuery('SELECT * FROM expenses LIMIT 5');
    console.log('\nSample expenses data:');
    console.log(JSON.stringify(sampleData, null, 2));
    
  } catch (error) {
    console.error('Error checking expenses table:', error);
  }
  process.exit(0);
}

checkExpensesTable();
