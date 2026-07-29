import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Badge } from '../models/training/Badge';
import { Level } from '../models/training/Level';
import { Course } from '../models/training/Course';
import { Exam } from '../models/training/Exam';
import { ExamAttempt } from '../models/training/ExamAttempt';

/**
 * Hard-delete all E2E test data (including soft-deleted).
 */
async function cleanup() {
  await connectDB();
  
  // Hard delete (bypass soft delete) all E2E data
  const exams = await Exam.deleteMany({ title: /^E2E /i });
  const attempts = await ExamAttempt.deleteMany({ exam: { $in: (await Exam.find({ title: /^E2E/i })).map(e => e._id) } });
  const courses = await Course.deleteMany({ name: /^E2E /i });
  const levels = await Level.deleteMany({ name: /^E2E /i });
  const badges = await Badge.deleteMany({ name: /^E2E /i });
  
  console.log(`Deleted: ${badges.deletedCount} badges, ${levels.deletedCount} levels, ${courses.deletedCount} courses, ${exams.deletedCount} exams`);
  
  await mongoose.disconnect();
  process.exit(0);
}

cleanup();
