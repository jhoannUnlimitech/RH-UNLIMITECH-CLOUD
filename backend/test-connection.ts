import { config } from './src/config/env';
import mongoose from 'mongoose';

console.log('🔍 Testing MongoDB connection...');
console.log('📍 MONGO_URI:', config.mongodb.uri);
console.log('🖥️  System: WSL2 Ubuntu 24.04');
console.log('🐳 Container: rh-management-mongodb (Linux)');

mongoose.connect(config.mongodb.uri, { dbName: 'rh_management' })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
