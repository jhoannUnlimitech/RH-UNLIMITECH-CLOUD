const { MongoClient } = require('mongodb');

const uri = 'mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin&appName=rh-app&tls=false';

console.log('Testing with native MongoDB driver...');
console.log('URI:', uri);

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected successfully to server');
    
    const admin = client.db('admin').admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await client.close();
  }
}

run();
