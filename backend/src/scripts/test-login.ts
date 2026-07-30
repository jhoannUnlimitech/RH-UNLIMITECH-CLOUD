import { connectDB } from '../config/database';
import { Employee } from '../models/Employee';
import mongoose from 'mongoose';

async function testLogin() {
  await connectDB();
  
  const emp = await Employee.findOne({ email: 'admin@unlimitech.cloud' }).select('+password');
  if (!emp) {
    console.log('❌ Employee NOT FOUND');
    process.exit(1);
  }
  
  console.log('Found:', emp.name, emp.email);
  console.log('Password hash (first 30):', emp.password?.substring(0, 30));
  console.log('Hash starts with $2: ', emp.password?.startsWith('$2'));
  
  const valid = await emp.comparePassword('Pass2014!');
  console.log('Password "Pass2014!" valid:', valid);
  
  await mongoose.disconnect();
  process.exit(0);
}

testLogin();
