import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Badge } from '../models/training/Badge';
import { Level } from '../models/training/Level';
import { Course } from '../models/training/Course';
import { Exam } from '../models/training/Exam';
import { ExamAttempt } from '../models/training/ExamAttempt';
import { EmployeeTrainingProgress } from '../models/training/EmployeeTrainingProgress';
import { Employee } from '../models/Employee';

/**
 * Hard-delete all E2E test data (including soft-deleted) and reset E2E employee progress.
 */
async function cleanup() {
  await connectDB();
  
  // 1. Find all E2E levels (to also delete their exams regardless of exam title)
  const e2eLevels = await Level.find({ name: /E2E/i }).select('_id');
  const e2eLevelIds = e2eLevels.map(l => l._id);

  // 2. Delete exam attempts for E2E exams or E2E employee
  const e2eExams = await Exam.find({ $or: [{ title: /E2E/i }, { level: { $in: e2eLevelIds } }] }).select('_id');
  const e2eEmployee = await Employee.findOne({ email: 'e2e-test@unlimitech.cloud' });
  
  let attempts: any = { deletedCount: 0 };
  if (e2eExams.length > 0 || e2eEmployee) {
    const attemptFilter: any = { $or: [] };
    if (e2eExams.length > 0) attemptFilter.$or.push({ exam: { $in: e2eExams.map(e => e._id) } });
    if (e2eEmployee) attemptFilter.$or.push({ employee: e2eEmployee._id });
    if (attemptFilter.$or.length > 0) {
      attempts = await ExamAttempt.deleteMany(attemptFilter);
    }
  }

  // 3. Delete exams (by title OR by level)
  const exams = await Exam.deleteMany({ $or: [{ title: /E2E/i }, { level: { $in: e2eLevelIds } }] });
  
  // 4. Delete courses, levels, badges with E2E in name
  const courses = await Course.deleteMany({ name: /E2E/i });
  const levels = await Level.deleteMany({ name: /E2E/i });
  const badges = await Badge.deleteMany({ name: /E2E/i });

  // 5. Reset E2E employee progress (so it can be re-initialized with new courses)
  if (e2eEmployee) {
    await EmployeeTrainingProgress.deleteOne({ employee: e2eEmployee._id });
  }
  
  console.log(`Deleted: ${badges.deletedCount} badges, ${levels.deletedCount} levels, ${courses.deletedCount} courses, ${exams.deletedCount} exams, ${attempts.deletedCount} attempts`);
  
  await mongoose.disconnect();
  process.exit(0);
}

cleanup();
