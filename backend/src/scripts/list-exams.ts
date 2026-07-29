import { connectDB } from '../config/database';
import { Exam } from '../models/training/Exam';
import mongoose from 'mongoose';

async function main() {
  await connectDB();
  const exams = await Exam.find({}).select('title level').lean();
  console.log(JSON.stringify(exams, null, 2));
  await mongoose.disconnect();
  process.exit(0);
}
main();
