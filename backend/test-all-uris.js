const { MongoClient } = require('mongodb');

const testVersions = [
  'mongodb://127.0.0.1:27017/?authSource=admin',
  'mongodb://admin:admin123@127.0.0.1:27017/',
  'mongodb://admin:admin123@127.0.0.1:27017/admin',
  'mongodb://admin:admin123@127.0.0.1:27017/rh_management?authSource=admin',
];

async function testConnection(uri) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log(`✅ SUCCESS: ${uri}`);
    const adminDb = client.db('admin').admin();
    const dbs = await adminDb.listDatabases();
    console.log('  Databases:', dbs.databases.map(db => db.name).join(', '));
  } catch (error) {
    console.log(`❌ FAILED: ${uri}`);
    console.log(`  Error: ${error.message}`);
  } finally {
    await client.close();
  }
}

(async () => {
  for (const uri of testVersions) {
    console.log(`\nTesting: ${uri}`);
    await testConnection(uri);
  }
})();
