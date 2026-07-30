import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Employee } from '../models/Employee';
import { Role } from '../models/Role';
import { Division } from '../models/Division';
import { Permission } from '../models/Permission';
import { Badge } from '../models/training/Badge';
import { Level } from '../models/training/Level';
import { Course } from '../models/training/Course';
import { Exam } from '../models/training/Exam';
import { CalendarEvent } from '../models/CalendarEvent';
import { SystemConfig } from '../models/SystemConfig';
import * as fs from 'fs';

/**
 * Export DB — Exporta todos los datos actuales de la BD en formato JSON.
 * Uso: npx ts-node --transpile-only src/scripts/export-db.ts
 */
async function exportDB() {
  await connectDB();
  console.log('🔗 Conectado a MongoDB');

  const data: any = {};

  // Permissions
  data.permissions = await Permission.find({}).lean();
  console.log(`  Permissions: ${data.permissions.length}`);

  // Roles (Hats)
  data.roles = await Role.find({}).populate('permissions', 'resource action').lean();
  console.log(`  Roles: ${data.roles.length}`);

  // Divisions
  data.divisions = await Division.find({}).lean();
  console.log(`  Divisions: ${data.divisions.length}`);

  // Employees (sin password)
  data.employees = await Employee.find({}).select('+password +deleted').lean();
  console.log(`  Employees: ${data.employees.length}`);

  // Training: Badges
  data.badges = await Badge.find({}).lean();
  console.log(`  Badges: ${data.badges.length}`);

  // Training: Levels
  data.levels = await Level.find({}).lean();
  console.log(`  Levels: ${data.levels.length}`);

  // Training: Courses
  data.courses = await Course.find({}).lean();
  console.log(`  Courses: ${data.courses.length}`);

  // Training: Exams
  data.exams = await Exam.find({}).lean();
  console.log(`  Exams: ${data.exams.length}`);

  // Calendar Events
  data.calendarEvents = await CalendarEvent.find({}).lean();
  console.log(`  Calendar Events: ${data.calendarEvents.length}`);

  // System Config
  data.systemConfig = await SystemConfig.findOne({}).lean();
  console.log(`  System Config: ${data.systemConfig ? 'yes' : 'none'}`);

  // Write to file
  const outputPath = './src/scripts/db-export.json';
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n✅ Exported to ${outputPath}`);

  await mongoose.disconnect();
  process.exit(0);
}

exportDB();
