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
import { EmployeeTrainingProgress } from '../models/training/EmployeeTrainingProgress';
import { progressService } from '../services/training/progress.service';

/**
 * Seed Complete — Recrea toda la BD desde cero con datos limpios de producción.
 *
 * ⚠️  BORRA TODA LA BD antes de insertar.
 *
 * Uso: npx ts-node --transpile-only src/scripts/seed-complete.ts
 *
 * Datos incluidos:
 * - 41 Permissions (RBAC completo)
 * - 13 Roles (CEO, VP, Founder, Talent, Tech, Dev, QA, etc.)
 * - 7 Divisions (Talento, Diseminación, Finanzas, Infra, Calidad, RRPP, Ejecutiva)
 * - 10 Employees reales de Unlimitech Cloud
 * - Training: 2 Badges, 3 Levels, 6 Courses, 2 Exams
 * - Calendar: 18 festivos Colombia 2026 + 3 eventos corporativos
 * - SystemConfig singleton
 * - Progress inicializado para todos los empleados
 */

const DEFAULT_PASSWORD = 'Pass2014!';

// ─── PERMISSIONS ────────────────────────────────────────────────────────────────

const PERMISSIONS = [
  // employees
  { resource: 'employees', action: 'read' }, { resource: 'employees', action: 'create' },
  { resource: 'employees', action: 'update' }, { resource: 'employees', action: 'delete' },
  // csw
  { resource: 'csw', action: 'read' }, { resource: 'csw', action: 'create' },
  { resource: 'csw', action: 'update' }, { resource: 'csw', action: 'approve' },
  { resource: 'csw', action: 'cancel' }, { resource: 'csw', action: 'delete' },
  // csw_categories
  { resource: 'csw_categories', action: 'read' }, { resource: 'csw_categories', action: 'create' },
  { resource: 'csw_categories', action: 'update' }, { resource: 'csw_categories', action: 'delete' },
  // approval_flows
  { resource: 'approval_flows', action: 'read' }, { resource: 'approval_flows', action: 'create' },
  { resource: 'approval_flows', action: 'update' }, { resource: 'approval_flows', action: 'delete' },
  // training
  { resource: 'training', action: 'read' }, { resource: 'training', action: 'create' },
  { resource: 'training', action: 'update' }, { resource: 'training', action: 'delete' },
  { resource: 'training', action: 'report' }, { resource: 'training', action: 'content' },
  { resource: 'training', action: 'manage' },
  // divisions
  { resource: 'divisions', action: 'read' }, { resource: 'divisions', action: 'create' },
  { resource: 'divisions', action: 'update' }, { resource: 'divisions', action: 'delete' },
  // roles
  { resource: 'roles', action: 'read' }, { resource: 'roles', action: 'create' },
  { resource: 'roles', action: 'update' }, { resource: 'roles', action: 'delete' },
  // permissions
  { resource: 'permissions', action: 'read' }, { resource: 'permissions', action: 'create' },
  { resource: 'permissions', action: 'update' }, { resource: 'permissions', action: 'delete' },
  // projects
  { resource: 'projects', action: 'read' }, { resource: 'projects', action: 'create' },
  { resource: 'projects', action: 'update' }, { resource: 'projects', action: 'delete' },
];

// ─── ROLES (con sus permisos por nombre) ────────────────────────────────────────

const ROLES: Array<{ name: string; permissions: string[] }> = [
  {
    name: 'CHIEF EXECUTIVE OFFICER',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'employees:delete', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'csw:cancel', 'csw:delete', 'csw_categories:read', 'csw_categories:create', 'csw_categories:update', 'csw_categories:delete', 'approval_flows:read', 'approval_flows:create', 'approval_flows:update', 'approval_flows:delete', 'training:read', 'training:create', 'training:update', 'training:delete', 'training:report', 'training:content', 'divisions:read', 'divisions:create', 'divisions:update', 'divisions:delete', 'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete', 'projects:read', 'projects:create', 'projects:update', 'projects:delete'],
  },
  {
    name: 'EXECUTIVE VICE PRESIDENT',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'employees:delete', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'csw:cancel', 'csw:delete', 'csw_categories:read', 'csw_categories:create', 'csw_categories:update', 'csw_categories:delete', 'approval_flows:read', 'approval_flows:create', 'approval_flows:update', 'approval_flows:delete', 'training:read', 'training:create', 'training:update', 'training:delete', 'training:report', 'training:content', 'divisions:read', 'divisions:create', 'divisions:update', 'divisions:delete', 'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete'],
  },
  {
    name: 'FOUNDER & SOLUTIONS ARCHITECT',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'employees:delete', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'csw:cancel', 'csw:delete', 'csw_categories:read', 'csw_categories:create', 'csw_categories:update', 'csw_categories:delete', 'approval_flows:read', 'approval_flows:create', 'approval_flows:update', 'approval_flows:delete', 'training:read', 'training:create', 'training:update', 'training:delete', 'training:report', 'training:content', 'training:manage', 'divisions:read', 'divisions:create', 'divisions:update', 'divisions:delete', 'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete', 'projects:read', 'projects:create', 'projects:update', 'projects:delete'],
  },
  {
    name: 'HUMAN TALENT MANAGER',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'employees:delete', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'csw:cancel', 'csw:delete', 'csw_categories:read', 'csw_categories:create', 'csw_categories:update', 'csw_categories:delete', 'training:read', 'training:create', 'training:update', 'training:delete', 'training:report', 'training:content', 'training:manage', 'divisions:read', 'divisions:create', 'divisions:update', 'divisions:delete', 'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete'],
  },
  {
    name: 'TECHNICAL ARCHITECT MANAGER',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'approval_flows:read', 'approval_flows:create', 'approval_flows:update', 'training:read', 'training:create', 'training:update', 'training:report', 'training:content', 'divisions:read', 'divisions:create', 'divisions:update', 'projects:read', 'csw_categories:read', 'csw_categories:create', 'csw_categories:update', 'csw_categories:delete', 'roles:read', 'permissions:read'],
  },
  {
    name: 'TECHNICAL LEADER',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'training:read', 'training:create', 'training:update', 'training:report', 'training:content', 'projects:read'],
  },
  {
    name: 'PROJECT MANAGER',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'csw:read', 'csw:create', 'csw:update', 'training:read', 'training:create', 'training:update', 'training:report', 'training:content', 'projects:read'],
  },
  {
    name: 'DEVELOPER',
    permissions: ['csw:read', 'csw:create', 'csw:update', 'csw:cancel', 'csw:delete', 'csw_categories:read', 'projects:read', 'training:read', 'training:report'],
  },
  {
    name: 'QA ANALYST',
    permissions: ['csw:read', 'csw:create', 'csw:update', 'csw:delete', 'csw:cancel', 'csw_categories:read', 'projects:read', 'training:read', 'training:report'],
  },
  {
    name: 'UI/UX DESIGNER',
    permissions: ['employees:read', 'employees:create', 'csw:read', 'csw:create', 'training:read', 'training:create', 'training:report', 'training:content', 'projects:read'],
  },
  {
    name: 'SALES REPRESENTATIVE',
    permissions: ['employees:read', 'employees:create', 'csw:read', 'csw:create', 'training:read', 'training:report'],
  },
  {
    name: 'ETHICS OFFICER',
    permissions: ['employees:read', 'csw:read', 'training:read', 'training:report'],
  },
  {
    name: 'QUALITY & TRAINING OFFICER',
    permissions: ['employees:read', 'employees:create', 'employees:update', 'csw:read', 'csw:create', 'csw:update', 'csw:approve', 'csw_categories:read', 'csw_categories:create', 'csw_categories:update', 'csw_categories:delete', 'training:read', 'training:create', 'training:update', 'training:report', 'training:content', 'training:manage'],
  },
];

// ─── DIVISIONS ──────────────────────────────────────────────────────────────────

const DIVISIONS = [
  { name: 'División 1 — Talento Humano' },
  { name: 'División 2 — Diseminación' },
  { name: 'División 3 — Finanzas' },
  { name: 'División 4 — Infraestructura' },
  { name: 'División 5 — Calidad' },
  { name: 'División 6 — Relaciones Públicas' },
  { name: 'División 7 — Ejecutiva' },
];

// ─── EMPLOYEES ──────────────────────────────────────────────────────────────────

const EMPLOYEES = [
  { name: 'Manuel Lara', email: 'admin@unlimitech.cloud', role: 'FOUNDER & SOLUTIONS ARCHITECT', division: 'División 7 — Ejecutiva', approve_csw: true, nationalId: '1234567890', phone: '3001234567', nationality: 'Colombiana', birthDate: '1990-01-15' },
  { name: 'Catherine Quiñonez', email: 'catherine@unlimitech.cloud', role: 'CHIEF EXECUTIVE OFFICER', division: 'División 7 — Ejecutiva', approve_csw: true, nationalId: '1234567891', phone: '3001234568', nationality: 'Colombiana', birthDate: '1988-05-20' },
  { name: 'Andres Quintero', email: 'coo@unlimitech.cloud', role: 'EXECUTIVE VICE PRESIDENT', division: 'División 7 — Ejecutiva', approve_csw: true, nationalId: '1234567899', phone: '3001234576', nationality: 'Colombiana', birthDate: '1985-11-08' },
  { name: 'Laura Hernandez', email: 'talent@unlimitech.cloud', role: 'HUMAN TALENT MANAGER', division: 'División 1 — Talento Humano', approve_csw: true, nationalId: '1234567897', phone: '3001234574', nationality: 'Colombiana', birthDate: '1992-08-12' },
  { name: 'Moises Gonzalez', email: 'moises@unlimitech.cloud', role: 'TECHNICAL ARCHITECT MANAGER', division: 'División 4 — Infraestructura', approve_csw: true, nationalId: '1234567892', phone: '3001234569', nationality: 'Colombiana', birthDate: '1991-03-25' },
  { name: 'Wenser Olmos', email: 'wenser@unlimitech.cloud', role: 'TECHNICAL LEADER', division: 'División 4 — Infraestructura', approve_csw: false, nationalId: '1234567893', phone: '3001234570', nationality: 'Colombiana', birthDate: '1993-07-10' },
  { name: 'Jair Zea', email: 'jair@unlimitech.cloud', role: 'DEVELOPER', division: 'División 4 — Infraestructura', approve_csw: false, nationalId: '1234567894', phone: '3001234571', nationality: 'Colombiana', birthDate: '1995-09-18' },
  { name: 'Jhoann Acosta', email: 'jhoann@unlimitech.cloud', role: 'QA ANALYST', division: 'División 4 — Infraestructura', approve_csw: false, nationalId: '1234567895', phone: '3001234572', nationality: 'Colombiana', birthDate: '1994-02-28' },
  { name: 'Jorge Jimenez', email: 'jorge@unlimitech.cloud', role: 'DEVELOPER', division: 'División 4 — Infraestructura', approve_csw: false, nationalId: '1234567896', phone: '3001234573', nationality: 'Colombiana', birthDate: '1996-12-05' },
  { name: 'Oscar Hernandez', email: 'training@unlimitech.cloud', role: 'QUALITY & TRAINING OFFICER', division: 'División 5 — Calidad', approve_csw: true, nationalId: '1234567898', phone: '3001234575', nationality: 'Colombiana', birthDate: '1990-06-14' },
];


// ─── TRAINING DATA ──────────────────────────────────────────────────────────────

const BADGES = [
  { name: 'Fullstack Developer', description: 'Dominio completo del stack TypeScript + React + Node', icon: 'code-2', shape: 'hexagon', color: '#8B5CF6' },
  { name: 'React Specialist', description: 'Especialización en React y ecosistema frontend', icon: 'brain', shape: 'medal', color: '#d56307' },
];

const LEVELS = [
  { name: 'TypeScript Básico', description: 'Fundamentos de TypeScript', order: 1, badgeName: 'Fullstack Developer' },
  { name: 'TypeScript Avanzado', description: 'Patterns avanzados, generics, utility types', order: 2, badgeName: 'Fullstack Developer' },
  { name: 'React Fundamentals', description: 'Hooks, componentes, estado, efectos', order: 1, badgeName: 'React Specialist' },
];

const COURSES = [
  { name: 'Intro a TypeScript', description: 'Tipos básicos, interfaces, type vs interface', levelName: 'TypeScript Básico', estimatedHours: 2, order: 1 },
  { name: 'MongoDB Mongoose', description: 'Schemas, queries, aggregation pipeline', levelName: 'TypeScript Básico', estimatedHours: 2.5, order: 2 },
  { name: 'TypeScript Generics', description: 'Generics, conditional types, mapped types', levelName: 'TypeScript Avanzado', estimatedHours: 3, order: 1 },
  { name: 'Node.js Express API', description: 'REST APIs, middleware, error handling', levelName: 'TypeScript Avanzado', estimatedHours: 4, order: 2 },
  { name: 'React Hooks', description: 'useState, useEffect, custom hooks', levelName: 'React Fundamentals', estimatedHours: 2.5, order: 1 },
  { name: 'React + MobX', description: 'State management con MobX observables', levelName: 'React Fundamentals', estimatedHours: 3, order: 2 },
];

const EXAMS = [
  {
    title: 'Examen TypeScript Básico', description: 'Evaluación de fundamentos TS',
    levelName: 'TypeScript Básico', passingScore: 80, maxAttempts: 2,
    questions: [
      { question: '¿Cuál es la diferencia entre type e interface en TypeScript?', type: 'multiple_choice', points: 25, order: 1, options: [{ text: 'No hay diferencia', isCorrect: false }, { text: 'type es más flexible, interface es extensible', isCorrect: true }, { text: 'Solo interface existe en TS', isCorrect: false }] },
      { question: '¿Qué tipo tiene una variable declarada con let x = 5?', type: 'multiple_choice', points: 25, order: 2, options: [{ text: 'any', isCorrect: false }, { text: 'number', isCorrect: true }, { text: 'string', isCorrect: false }, { text: 'unknown', isCorrect: false }] },
      { question: '¿Para qué sirve el operador "as" en TypeScript?', type: 'multiple_choice', points: 25, order: 3, options: [{ text: 'Type assertion', isCorrect: true }, { text: 'Type casting', isCorrect: false }, { text: 'Type guard', isCorrect: false }] },
      { question: 'Explica cuándo usarías un generic en TypeScript', type: 'open_text', points: 25, order: 4, expectedAnswer: 'Cuando necesitas crear funciones o clases que trabajen con múltiples tipos manteniendo type safety' },
    ],
  },
  {
    title: 'Examen React Fundamentals', description: 'Evaluación de React core',
    levelName: 'React Fundamentals', passingScore: 80, maxAttempts: 1,
    questions: [
      { question: '¿Qué hook se usa para manejar estado local?', type: 'multiple_choice', points: 34, order: 1, options: [{ text: 'useEffect', isCorrect: false }, { text: 'useState', isCorrect: true }, { text: 'useContext', isCorrect: false }] },
      { question: '¿Cuándo se ejecuta useEffect sin dependencias?', type: 'multiple_choice', points: 33, order: 2, options: [{ text: 'Solo al montar', isCorrect: true }, { text: 'En cada render', isCorrect: false }, { text: 'Nunca', isCorrect: false }] },
      { question: 'Describe el patrón Observer en MobX y cómo se integra con React', type: 'open_text', points: 33, order: 3, expectedAnswer: 'MobX usa observables que auto-notifican a los componentes React envueltos en observer() cuando cambian' },
    ],
  },
];

// ─── HOLIDAYS COLOMBIA 2026 ─────────────────────────────────────────────────────

const HOLIDAYS = [
  { date: '2026-01-01', title: 'Año Nuevo' },
  { date: '2026-01-12', title: 'Día de los Reyes Magos' },
  { date: '2026-03-23', title: 'Día de San José' },
  { date: '2026-04-02', title: 'Jueves Santo' },
  { date: '2026-04-03', title: 'Viernes Santo' },
  { date: '2026-05-01', title: 'Día del Trabajo' },
  { date: '2026-05-18', title: 'Ascensión del Señor' },
  { date: '2026-06-08', title: 'Corpus Christi' },
  { date: '2026-06-15', title: 'Sagrado Corazón de Jesús' },
  { date: '2026-06-29', title: 'San Pedro y San Pablo' },
  { date: '2026-07-20', title: 'Día de la Independencia' },
  { date: '2026-08-07', title: 'Batalla de Boyacá' },
  { date: '2026-08-17', title: 'Asunción de la Virgen' },
  { date: '2026-10-12', title: 'Día de la Raza' },
  { date: '2026-11-02', title: 'Todos los Santos' },
  { date: '2026-11-16', title: 'Independencia de Cartagena' },
  { date: '2026-12-08', title: 'Inmaculada Concepción' },
  { date: '2026-12-25', title: 'Navidad' },
];

// ─── MAIN SEED FUNCTION ─────────────────────────────────────────────────────────

async function seed() {
  await connectDB();
  console.log('🔗 Conectado a MongoDB\n');

  // ⚠️ Drop all collections
  console.log('🗑️  Limpiando base de datos...');
  const collections = await mongoose.connection.db!.collections();
  for (const col of collections) {
    await col.drop().catch(() => {}); // Ignore if collection doesn't exist
  }
  console.log('   Base de datos limpia.\n');

  // 1. Permissions
  console.log('📋 Creando permisos...');
  const permDocs = await Permission.insertMany(PERMISSIONS);
  const permMap: Record<string, string> = {};
  for (const p of permDocs) {
    permMap[`${p.resource}:${p.action}`] = p._id.toString();
  }
  console.log(`   ${permDocs.length} permisos creados.\n`);

  // 2. Roles
  console.log('🎩 Creando roles...');
  const roleMap: Record<string, string> = {};
  for (const roleData of ROLES) {
    const permIds = roleData.permissions.map(p => permMap[p]).filter(Boolean);
    const role = await Role.create({ name: roleData.name, permissions: permIds });
    roleMap[roleData.name] = role._id.toString();
  }
  console.log(`   ${ROLES.length} roles creados.\n`);

  // 3. Create admin employee first (needed for divisions)
  console.log('👤 Creando empleado admin (para managers)...');
  const adminEmp = await Employee.create({
    name: 'Manuel Lara', email: 'admin@unlimitech.cloud',
    password: DEFAULT_PASSWORD, // Pre-save hook will hash it
    role: roleMap['FOUNDER & SOLUTIONS ARCHITECT'],
    division: new mongoose.Types.ObjectId(), // Temporal, se actualiza después
    approve_csw: true, nationalId: '1234567890', phone: '3001234567',
    nationality: 'Colombiana', birthDate: new Date('1990-01-15'),
    status: 'active', forcePasswordChange: false,
  });
  const adminId = adminEmp._id.toString();
  console.log(`   Admin creado: ${adminId}\n`);

  // 4. Divisions (with admin as manager initially)
  console.log('🏢 Creando divisiones...');
  const divMap: Record<string, string> = {};
  const divCodes = ['TH', 'DIS', 'FIN', 'INF', 'CAL', 'RRPP', 'EJEC'];
  for (let i = 0; i < DIVISIONS.length; i++) {
    const div = await Division.create({ name: DIVISIONS[i].name, code: divCodes[i], managerId: adminId });
    divMap[DIVISIONS[i].name] = div._id.toString();
  }
  console.log(`   ${DIVISIONS.length} divisiones creadas.\n`);

  // Update admin's division
  await Employee.updateOne({ _id: adminId }, { division: divMap['División 7 — Ejecutiva'] });

  // 5. Employees (skip admin, already created)
  console.log('👥 Creando empleados...');
  const empMap: Record<string, string> = { 'admin@unlimitech.cloud': adminId };
  for (const empData of EMPLOYEES.filter(e => e.email !== 'admin@unlimitech.cloud')) {
    const emp = await Employee.create({
      name: empData.name, email: empData.email,
      password: DEFAULT_PASSWORD, // Pre-save hook will hash it
      role: roleMap[empData.role],
      division: divMap[empData.division], approve_csw: empData.approve_csw,
      nationalId: empData.nationalId, phone: empData.phone,
      nationality: empData.nationality, birthDate: new Date(empData.birthDate),
      status: 'active', forcePasswordChange: false,
    });
    empMap[empData.email] = emp._id.toString();
  }
  console.log(`   ${EMPLOYEES.length} empleados creados.\n`);

  // 6. Update division managers
  console.log('🔗 Asignando managers a divisiones...');
  await Division.updateOne({ name: 'División 1 — Talento Humano' }, { managerId: empMap['talent@unlimitech.cloud'] });
  await Division.updateOne({ name: 'División 2 — Diseminación' }, { managerId: empMap['admin@unlimitech.cloud'] });
  await Division.updateOne({ name: 'División 3 — Finanzas' }, { managerId: empMap['coo@unlimitech.cloud'] });
  await Division.updateOne({ name: 'División 4 — Infraestructura' }, { managerId: empMap['moises@unlimitech.cloud'] });
  await Division.updateOne({ name: 'División 5 — Calidad' }, { managerId: empMap['training@unlimitech.cloud'] });
  await Division.updateOne({ name: 'División 6 — Relaciones Públicas' }, { managerId: empMap['admin@unlimitech.cloud'] });
  await Division.updateOne({ name: 'División 7 — Ejecutiva' }, { managerId: empMap['catherine@unlimitech.cloud'] });
  console.log('   Managers asignados.\n');

  // 7. Training: Badges
  console.log('🏅 Creando insignias...');
  const badgeMap: Record<string, string> = {};
  for (const b of BADGES) {
    const badge = await Badge.create(b);
    badgeMap[b.name] = badge._id.toString();
  }
  console.log(`   ${BADGES.length} insignias creadas.\n`);

  // 8. Training: Levels
  console.log('📊 Creando niveles...');
  const levelMap: Record<string, string> = {};
  for (const l of LEVELS) {
    const level = await Level.create({
      name: l.name, description: l.description,
      order: l.order, badge: badgeMap[l.badgeName],
    });
    levelMap[l.name] = level._id.toString();
  }
  console.log(`   ${LEVELS.length} niveles creados.\n`);

  // 9. Training: Courses
  console.log('📚 Creando cursos...');
  for (const c of COURSES) {
    await Course.create({
      name: c.name, description: c.description,
      level: levelMap[c.levelName],
      estimatedHours: c.estimatedHours, order: c.order,
    });
  }
  console.log(`   ${COURSES.length} cursos creados.\n`);

  // 10. Training: Exams
  console.log('📝 Creando exámenes...');
  for (const e of EXAMS) {
    const exam = await Exam.create({
      title: e.title, description: e.description,
      level: levelMap[e.levelName],
      passingScore: e.passingScore, maxAttempts: e.maxAttempts,
      questions: e.questions, createdBy: empMap['admin@unlimitech.cloud'],
    });
    // Associate exam to level
    await Level.updateOne({ _id: levelMap[e.levelName] }, { exam: exam._id });
  }
  console.log(`   ${EXAMS.length} exámenes creados.\n`);

  // 11. Calendar Events
  console.log('📅 Creando eventos de calendario...');
  for (const h of HOLIDAYS) {
    await CalendarEvent.create({
      title: h.title, description: `Festivo Colombia — ${h.title}`,
      startDate: new Date(h.date + 'T00:00:00'), endDate: new Date(h.date + 'T23:59:59'),
      color: 'danger', type: 'holiday', allDay: true, createdBy: adminId,
    });
  }
  // Corporate events
  await CalendarEvent.create({ title: 'Reunión semanal de equipo', startDate: new Date('2026-06-26T09:00:00'), endDate: new Date('2026-06-26T10:00:00'), startTime: '09:00', endTime: '10:00', color: 'primary', type: 'meeting', allDay: false, createdBy: adminId });
  await CalendarEvent.create({ title: 'Entrega Sprint 12', startDate: new Date('2026-06-30T17:00:00'), endDate: new Date('2026-06-30T17:00:00'), color: 'warning', type: 'deadline', allDay: true, createdBy: adminId });
  await CalendarEvent.create({ title: 'Capacitación AWS', startDate: new Date('2026-07-02T14:00:00'), endDate: new Date('2026-07-02T16:00:00'), startTime: '14:00', endTime: '16:00', color: 'success', type: 'training', allDay: false, createdBy: adminId });
  console.log(`   ${HOLIDAYS.length + 3} eventos creados.\n`);

  // 12. System Config
  console.log('⚙️  Creando configuración del sistema...');
  await SystemConfig.create({
    general: { companyName: 'Unlimitech Cloud', timezone: 'America/Bogota', locale: 'es-CO', dateFormat: 'DD/MM/YYYY' },
    schedule: { workDays: [1, 2, 3, 4, 5], workHoursStart: '08:00', workHoursEnd: '18:00', studyDays: [1, 3, 5] },
    training: { minWeeklyHours: 3, examPassingScore: 80, maxExamAttempts: 3, studyReportMaxHoursPerDay: 12 },
    notifications: { retentionDays: 90, emailEnabled: false, summaryFrequency: 'none' },
  });
  console.log('   Configuración creada.\n');

  // 13. Initialize training progress
  console.log('🎯 Inicializando progreso de training...');
  for (const empData of EMPLOYEES) {
    try {
      await progressService.initializeForEmployee(empMap[empData.email]);
    } catch { /* may fail if no badges/levels */ }
  }
  console.log(`   Progreso inicializado para ${EMPLOYEES.length} empleados.\n`);

  console.log('═══════════════════════════════════════════════════');
  console.log('🎉 SEED COMPLETADO');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\n  Login: ${EMPLOYEES[0].email} / ${DEFAULT_PASSWORD}`);
  console.log(`  Todos los empleados usan: ${DEFAULT_PASSWORD}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
