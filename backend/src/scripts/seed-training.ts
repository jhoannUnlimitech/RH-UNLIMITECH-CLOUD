/**
 * Seed Training — Crea datos de ejemplo para el módulo de capacitación.
 *
 * Genera: 2 Insignias → 3 Niveles → 6 Cursos (con documentos) → 2 Exámenes
 *
 * Ejecutar: npx tsx src/scripts/seed-training.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rh_management';
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');

  // Imports dinámicos para evitar problemas con plugins
  const { Badge } = await import('../models/training/Badge');
  const { Level } = await import('../models/training/Level');
  const { Course } = await import('../models/training/Course');
  const { Exam } = await import('../models/training/Exam');
  const { LibraryCategory } = await import('../models/training/LibraryCategory');
  const { LibraryDocument } = await import('../models/training/LibraryDocument');
  const { Employee } = await import('../models/Employee');

  // Obtener admin para createdBy/author
  const admin = await Employee.findOne({ email: 'admin@unlimitech.cloud' });
  if (!admin) {
    console.error('❌ No se encontró admin@unlimitech.cloud. Ejecuta seed.ts primero.');
    process.exit(1);
  }
  const adminId = admin._id;

  // ─── Limpiar datos previos del seed ──────────────────────────────────────

  console.log('\n🧹 Limpiando datos de training previos...');
  await Course.deleteMany({ name: /^\[SEED\]/ });
  await Exam.deleteMany({ title: /^\[SEED\]/ });
  await Level.deleteMany({ name: /^\[SEED\]/ });
  await Badge.deleteMany({ name: /^\[SEED\]/ });
  await LibraryDocument.deleteMany({ title: /^\[SEED\]/ });

  // ─── Categoría de cursos (si no existe) ──────────────────────────────────

  let cursosCat = await LibraryCategory.findOne({ slug: 'cursos' });
  if (!cursosCat) {
    cursosCat = await LibraryCategory.create({
      name: 'Cursos',
      slug: 'cursos',
      icon: 'book-open',
      color: '#3B82F6',
      isSystem: true,
      createdBy: adminId,
    });
    console.log('  📁 Categoría "Cursos" creada');
  }

  // ─── Documentos de la Biblioteca (material de estudio) ───────────────────

  console.log('\n📄 Creando documentos...');

  const docs = await Promise.all([
    LibraryDocument.create({
      title: '[SEED] Introducción a TypeScript',
      slug: 'seed-intro-typescript',
      description: 'Conceptos básicos de TypeScript: tipos, interfaces y funciones.',
      category: cursosCat._id,
      type: 'article',
      content: '# Introducción a TypeScript\n\nTypeScript es un superset de JavaScript que agrega tipos estáticos.\n\n## Tipos básicos\n- `string`\n- `number`\n- `boolean`\n- `array`\n\n## Interfaces\n```typescript\ninterface User {\n  name: string;\n  age: number;\n}\n```',
      author: adminId,
      published: true,
      tags: ['typescript', 'básico'],
      version: 1,
    }),
    LibraryDocument.create({
      title: '[SEED] TypeScript Avanzado - Generics',
      slug: 'seed-ts-generics',
      description: 'Generics, utility types y patterns avanzados.',
      category: cursosCat._id,
      type: 'article',
      content: '# TypeScript Avanzado — Generics\n\n## ¿Qué son los Generics?\n\nPermiten crear componentes reutilizables que trabajan con múltiples tipos.\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\n\n## Utility Types\n- `Partial<T>`\n- `Required<T>`\n- `Pick<T, K>`\n- `Omit<T, K>`',
      author: adminId,
      published: true,
      tags: ['typescript', 'avanzado', 'generics'],
      version: 1,
    }),
    LibraryDocument.create({
      title: '[SEED] React Hooks Fundamentals',
      slug: 'seed-react-hooks',
      description: 'useState, useEffect, useContext y custom hooks.',
      category: cursosCat._id,
      type: 'article',
      content: '# React Hooks\n\n## useState\n```tsx\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n```tsx\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\n## Custom Hooks\nExtraer lógica reutilizable en hooks personalizados.',
      author: adminId,
      published: true,
      tags: ['react', 'hooks', 'fundamentals'],
      version: 1,
    }),
    LibraryDocument.create({
      title: '[SEED] React State Management con MobX',
      slug: 'seed-react-mobx',
      description: 'Patrones de state management con MobX y observer.',
      category: cursosCat._id,
      type: 'article',
      content: '# State Management con MobX\n\n## Conceptos\n- **Observable**: estado reactivo\n- **Action**: modifica el estado\n- **Computed**: valores derivados\n- **Observer**: componente que re-renderiza\n\n## Ejemplo\n```typescript\nclass TodoStore {\n  @observable todos = [];\n  @action addTodo(text: string) { ... }\n}\n```',
      author: adminId,
      published: true,
      tags: ['react', 'mobx', 'state-management'],
      version: 1,
    }),
    LibraryDocument.create({
      title: '[SEED] Node.js y Express - API REST',
      slug: 'seed-node-express',
      description: 'Construcción de APIs RESTful con Express y middleware.',
      category: cursosCat._id,
      type: 'article',
      content: '# Node.js y Express\n\n## Estructura de un API\n```\nsrc/\n├── routes/\n├── controllers/\n├── services/\n└── models/\n```\n\n## Middleware\n```typescript\napp.use(express.json());\napp.use(cors());\napp.use(authMiddleware);\n```',
      author: adminId,
      published: true,
      tags: ['node', 'express', 'api'],
      version: 1,
    }),
    LibraryDocument.create({
      title: '[SEED] MongoDB y Mongoose - Modelado',
      slug: 'seed-mongodb-mongoose',
      description: 'Diseño de schemas, índices y queries con Mongoose.',
      category: cursosCat._id,
      type: 'article',
      content: '# MongoDB con Mongoose\n\n## Schema\n```typescript\nconst UserSchema = new Schema({\n  name: { type: String, required: true },\n  email: { type: String, unique: true },\n});\n```\n\n## Índices\n- Simple: `{ email: 1 }`\n- Compuesto: `{ resource: 1, action: 1 }`\n- Unique: `{ slug: 1 }, { unique: true }`',
      author: adminId,
      published: true,
      tags: ['mongodb', 'mongoose', 'backend'],
      version: 1,
    }),
  ]);
  console.log(`  ✅ ${docs.length} documentos creados`);

  // ─── Insignias ───────────────────────────────────────────────────────────

  console.log('\n🏆 Creando insignias...');

  const badgeFullstack = await Badge.create({
    name: '[SEED] Fullstack Developer',
    description: 'Dominio de frontend y backend con TypeScript, React y Node.js',
    icon: 'code-2',
    shape: 'hexagon',
    color: '#8B5CF6',
  });

  const badgeReact = await Badge.create({
    name: '[SEED] React Specialist',
    description: 'Especialización en React: hooks, state management y patterns',
    icon: 'atom',
    shape: 'shield',
    color: '#06B6D4',
  });
  console.log('  ✅ 2 insignias creadas');

  // ─── Niveles ─────────────────────────────────────────────────────────────

  console.log('\n📊 Creando niveles...');

  const levelTsBasic = await Level.create({
    name: '[SEED] TypeScript Básico',
    description: 'Fundamentos del lenguaje TypeScript',
    badge: badgeFullstack._id,
    order: 0,
  });

  const levelTsAdvanced = await Level.create({
    name: '[SEED] TypeScript Avanzado',
    description: 'Patterns avanzados: generics, utility types, decorators',
    badge: badgeFullstack._id,
    order: 1,
  });

  const levelReactBasic = await Level.create({
    name: '[SEED] React Fundamentals',
    description: 'Hooks, componentes y lifecycle en React',
    badge: badgeReact._id,
    order: 0,
  });

  // Actualizar badges con los niveles
  badgeFullstack.levels = [levelTsBasic._id, levelTsAdvanced._id] as any;
  await badgeFullstack.save();
  badgeReact.levels = [levelReactBasic._id] as any;
  await badgeReact.save();

  console.log('  ✅ 3 niveles creados');

  // ─── Cursos ──────────────────────────────────────────────────────────────

  console.log('\n📚 Creando cursos...');

  const coursesData = [
    { name: '[SEED] Intro a TypeScript', desc: 'Tipos básicos y interfaces', level: levelTsBasic._id, doc: docs[0]._id, hours: 2, order: 0 },
    { name: '[SEED] TypeScript Generics', desc: 'Generics y utility types', level: levelTsAdvanced._id, doc: docs[1]._id, hours: 3, order: 0 },
    { name: '[SEED] React Hooks', desc: 'useState, useEffect, custom hooks', level: levelReactBasic._id, doc: docs[2]._id, hours: 2.5, order: 0 },
    { name: '[SEED] React + MobX', desc: 'State management con MobX', level: levelReactBasic._id, doc: docs[3]._id, hours: 3, order: 1 },
    { name: '[SEED] Node.js Express API', desc: 'Construcción de APIs REST', level: levelTsAdvanced._id, doc: docs[4]._id, hours: 4, order: 1 },
    { name: '[SEED] MongoDB Mongoose', desc: 'Modelado y queries', level: levelTsBasic._id, doc: docs[5]._id, hours: 2.5, order: 1 },
  ];

  const createdCourses = [];
  for (const c of coursesData) {
    const course = await Course.create({
      name: c.name,
      description: c.desc,
      level: c.level,
      libraryDocument: c.doc,
      estimatedHours: c.hours,
      order: c.order,
    });
    createdCourses.push(course);
  }

  // Actualizar niveles con cursos
  levelTsBasic.courses = createdCourses.filter(c => c.level.toString() === levelTsBasic._id.toString()).map(c => c._id) as any;
  await levelTsBasic.save();
  levelTsAdvanced.courses = createdCourses.filter(c => c.level.toString() === levelTsAdvanced._id.toString()).map(c => c._id) as any;
  await levelTsAdvanced.save();
  levelReactBasic.courses = createdCourses.filter(c => c.level.toString() === levelReactBasic._id.toString()).map(c => c._id) as any;
  await levelReactBasic.save();

  console.log(`  ✅ ${createdCourses.length} cursos creados`);

  // ─── Exámenes ────────────────────────────────────────────────────────────

  console.log('\n📝 Creando exámenes...');

  await Exam.create({
    title: '[SEED] Examen TypeScript Básico',
    description: 'Evaluación de fundamentos de TypeScript',
    level: levelTsBasic._id,
    passingScore: 80,
    maxAttempts: 2,
    createdBy: adminId,
    questions: [
      {
        question: '¿Cuál es el tipo de dato para números en TypeScript?',
        type: 'multiple_choice',
        options: [
          { text: 'int', isCorrect: false },
          { text: 'number', isCorrect: true },
          { text: 'float', isCorrect: false },
          { text: 'integer', isCorrect: false },
        ],
        points: 10,
        order: 0,
      },
      {
        question: '¿Qué keyword se usa para definir una interfaz?',
        type: 'multiple_choice',
        options: [
          { text: 'type', isCorrect: false },
          { text: 'interface', isCorrect: true },
          { text: 'class', isCorrect: false },
          { text: 'struct', isCorrect: false },
        ],
        points: 10,
        order: 1,
      },
      {
        question: 'Explique la diferencia entre type e interface en TypeScript.',
        type: 'open_text',
        expectedAnswer: 'Las interfaces se pueden extender y fusionar (declaration merging). Los types son más flexibles: soportan unions, intersections y mapped types. Interfaces son mejores para objetos que se extienden; types para uniones y tipos complejos.',
        points: 20,
        order: 2,
      },
      {
        question: '¿TypeScript se ejecuta directamente en el navegador?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí, directamente', isCorrect: false },
          { text: 'No, se transpila a JavaScript primero', isCorrect: true },
          { text: 'Solo con Deno', isCorrect: false },
        ],
        points: 10,
        order: 3,
      },
    ],
  });

  await Exam.create({
    title: '[SEED] Examen React Fundamentals',
    description: 'Evaluación de hooks y componentes React',
    level: levelReactBasic._id,
    passingScore: 80,
    maxAttempts: 1,
    createdBy: adminId,
    questions: [
      {
        question: '¿Qué hook se usa para manejar estado local en un componente?',
        type: 'multiple_choice',
        options: [
          { text: 'useEffect', isCorrect: false },
          { text: 'useState', isCorrect: true },
          { text: 'useContext', isCorrect: false },
          { text: 'useRef', isCorrect: false },
        ],
        points: 10,
        order: 0,
      },
      {
        question: '¿Cuándo se ejecuta useEffect con un array de dependencias vacío []?',
        type: 'multiple_choice',
        options: [
          { text: 'En cada render', isCorrect: false },
          { text: 'Solo al montar el componente', isCorrect: true },
          { text: 'Solo al desmontar', isCorrect: false },
          { text: 'Nunca', isCorrect: false },
        ],
        points: 10,
        order: 1,
      },
      {
        question: 'Describa cuándo usaría un custom hook vs un componente wrapper.',
        type: 'open_text',
        expectedAnswer: 'Custom hooks extraen lógica de estado reutilizable (sin UI). Componentes wrapper agregan comportamiento visual (layout, estilos, providers). Usar hook cuando solo necesitas lógica; wrapper cuando necesitas envolver UI.',
        points: 20,
        order: 2,
      },
    ],
  });

  // Asignar exámenes a los niveles
  const examTs = await Exam.findOne({ level: levelTsBasic._id });
  const examReact = await Exam.findOne({ level: levelReactBasic._id });
  if (examTs) { levelTsBasic.exam = examTs._id as any; await levelTsBasic.save(); }
  if (examReact) { levelReactBasic.exam = examReact._id as any; await levelReactBasic.save(); }

  console.log('  ✅ 2 exámenes creados');

  // ─── Resumen ─────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(50));
  console.log('✅ SEED TRAINING COMPLETADO');
  console.log('═'.repeat(50));
  console.log(`
  📄 Documentos:  6 (en categoría "Cursos")
  🏆 Insignias:   2 (Fullstack Developer, React Specialist)
  📊 Niveles:     3 (TS Básico, TS Avanzado, React Fundamentals)
  📚 Cursos:      6 (2 por nivel)
  📝 Exámenes:    2 (TS Básico + React Fundamentals)

  Flujo de prueba:
  1. Login como admin → /training/manage
  2. Verificar tabs: Insignias (2), Niveles (3), Cursos (6), Exámenes (2)
  3. Editar un examen → /training/manage/exams/edit/:id
  4. Crear un nuevo curso asociado a un documento
  `);

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
