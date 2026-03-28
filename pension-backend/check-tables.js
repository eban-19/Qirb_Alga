const { executeQuery } = require('./src/config/database');

async function checkTables() {
  try {
    // Get all tables
    const tables = await executeQuery('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });

    // Check specific tables
    const requiredTables = ['users', 'pensions', 'bookings'];
    for (const tableName of requiredTables) {
      const exists = tables.some(table => Object.values(table)[0] === tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName} table`);
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  }
  process.exit(0);
}

checkTables();
