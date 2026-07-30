import { connectDB } from '../config/database';
import { Badge } from '../models/training/Badge';
import mongoose from 'mongoose';

async function check() {
  await connectDB();
  
  // Find ALL badges including deleted (bypass plugin)
  const all = await Badge.find({}).setOptions({ includeDeleted: true }).select('name deleted active').lean();
  console.log('ALL badges (including deleted):');
  all.forEach(b => console.log(`  ${b.name} | deleted:${b.deleted} active:${b.active}`));
  
  // Try direct collection query (no mongoose filters)
  const raw = await mongoose.connection.db!.collection('badges').find({ name: /E2E/i }).toArray();
  console.log('\nRAW E2E badges from collection:');
  raw.forEach(b => console.log(`  ${b.name} | deleted:${b.deleted} active:${b.active} _id:${b._id}`));
  
  await mongoose.disconnect();
  process.exit(0);
}
check();
