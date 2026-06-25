import mongoose from 'mongoose';
import { config } from '../../config/env';
import { Project } from '../../models/Project';
import { Employee } from '../../models/Employee';
import { Division } from '../../models/Division';

/**
 * Seed de Proyectos — Crea proyectos de ejemplo asignados a División 4 (Infraestructura)
 * 
 * Ejecutar con: npx ts-node src/database/seeds/seed-projects.ts
 */
async function seedProjects() {
  await mongoose.connect(config.mongodb.uri);
  console.log('🌱 Seed de Proyectos\n');

  // Limpiar proyectos existentes
  await Project.deleteMany({});

  // Obtener División 4 — Infraestructura
  const div4 = await Division.findOne({ code: 'DIV04' });
  if (!div4) {
    console.log('❌ División 4 no encontrada. Ejecuta seed-real.ts primero.');
    process.exit(1);
  }

  // Obtener empleados de Infraestructura
  const moises = await Employee.findOne({ name: /Moises/i });
  const jhoann = await Employee.findOne({ name: /Jhoann/i });
  const wenser = await Employee.findOne({ name: /Wenser/i });
  const jair = await Employee.findOne({ name: /Jair/i });

  // Obtener todos los empleados de div4
  const div4Employees = await Employee.find({ division: div4._id });
  const devs = div4Employees.filter(e => !['Moises Gonzalez'].includes(e.name));

  const projectsData = [
    {
      name: 'RH Unlimitech Cloud',
      code: 'RH-UC',
      description: 'Sistema de gestión de RRHH interno de Unlimitech Cloud',
      divisionId: div4._id,
      status: 'active' as const,
      startDate: new Date('2026-01-15'),
      members: [jhoann?._id, wenser?._id, jair?._id, moises?._id].filter(Boolean),
      leadId: moises?._id,
    },
    {
      name: 'Website Factory Platform',
      code: 'WF-PLT',
      description: 'Plataforma de producción de sitios web para agencias',
      divisionId: div4._id,
      status: 'active' as const,
      startDate: new Date('2025-08-01'),
      members: devs.slice(0, 4).map(e => e._id),
      leadId: moises?._id,
    },
    {
      name: 'Cloud Migration Client A',
      code: 'CMA-01',
      description: 'Migración a la nube para cliente corporativo',
      divisionId: div4._id,
      status: 'active' as const,
      startDate: new Date('2026-05-10'),
      members: devs.slice(2, 5).map(e => e._id),
      leadId: moises?._id,
    },
    {
      name: 'E-commerce Redesign',
      code: 'ECR-22',
      description: 'Rediseño de plataforma e-commerce para cliente retail',
      divisionId: div4._id,
      status: 'on_hold' as const,
      startDate: new Date('2026-03-01'),
      members: [wenser?._id, ...devs.slice(0, 2).map(e => e._id)].filter(Boolean),
      leadId: moises?._id,
    },
    {
      name: 'Internal Tooling v2',
      code: 'IT-V2',
      description: 'Herramientas internas de automatización y CI/CD',
      divisionId: div4._id,
      status: 'completed' as const,
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-04-30'),
      members: devs.slice(1, 4).map(e => e._id),
      leadId: moises?._id,
    },
  ];

  const projects = [];
  for (const data of projectsData) {
    const p = new Project(data);
    await p.save();
    projects.push(p);
  }

  console.log(`✅ ${projects.length} proyectos creados`);
  projects.forEach(p => {
    console.log(`   • ${p.code} — ${p.name} (${p.status}) — ${p.members.length} miembros`);
  });

  process.exit(0);
}

seedProjects().catch(e => { console.error(e); process.exit(1); });
