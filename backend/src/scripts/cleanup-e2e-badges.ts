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
  
  // 1. Find all E2E levels (to also delete their exams regardless of exam title)
  const e2eLevels = await Level.find({ name: /E2E/i }).select('_id');
  const e2eLevelIds = e2eLevels.map(l => l._id);

  // 2. Delete exam attempts for E2E exams
  const e2eExams = await Exam.find({ $or: [{ title: /E2E/i }, { level: { $in: e2eLevelIds } }] }).select('_id');
  const attempts = await ExamAttempt.deleteMany({ exam: { $in: e2eExams.map(e => e._id) } });

  // 3. Delete exams (by title OR by level)
  const exams = await Exam.deleteMany({ $or: [{ title: /E2E/i }, { level: { $in: e2eLevelIds } }] });
  
  // 4. Delete courses, levels, badges with E2E in name
  const courses = await Course.deleteMany({ name: /E2E/i });
  const levels = await Level.deleteMany({ name: /E2E/i });
  const badges = await Badge.deleteMany({ name: /E2E/i });
  
  console.log(`Deleted: ${badges.deletedCount} badges, ${levels.deletedCount} levels, ${courses.deletedCount} courses, ${exams.deletedCount} exams, ${attempts.deletedCount} attempts`);
  
  await mongoose.disconnect();
  process.exit(0);
}

cleanup();
