/**
 * Migración: Agregar permisos training:content, training:manage, training:report
 *
 * Estructura de permisos del módulo Training:
 *   - read:    Ver biblioteca, progreso propio, exámenes asignados
 *   - report:  Reportar horas de estudio
 *   - content: CRUD documentos y categorías de la Biblioteca
 *   - manage:  CRUD cursos/niveles/badges/exámenes + asignar + evaluar + ver progreso de todos
 *   - delete:  Hard-delete (eliminación permanente)
 *
 * Los permisos create/update se mantienen por retrocompatibilidad pero
 * content es el nuevo permiso unificado para la Biblioteca.
 *
 * Ejecutar: npx tsx src/scripts/add-training-permissions.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rh_management';
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');

  const db = mongoose.connection.db!;
  const permissionsCol = db.collection('permissions');
  const rolesCol = db.collection('roles');

  // 1. Crear permisos nuevos si no existen
  const newPerms = [
    { resource: 'training', action: 'content' },
    { resource: 'training', action: 'manage' },
    { resource: 'training', action: 'report' },
  ];

  const createdIds: string[] = [];

  for (const perm of newPerms) {
    const existing = await permissionsCol.findOne(perm);
    if (existing) {
      console.log(`  ⏭️  ${perm.resource}:${perm.action} ya existe`);
      createdIds.push(existing._id.toString());
    } else {
      const result = await permissionsCol.insertOne({
        ...perm,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✅ Creado: ${perm.resource}:${perm.action}`);
      createdIds.push(result.insertedId.toString());
    }
  }

  // 2. Obtener IDs de los permisos nuevos
  const contentPerm = await permissionsCol.findOne({ resource: 'training', action: 'content' });
  const managePerm = await permissionsCol.findOne({ resource: 'training', action: 'manage' });
  const reportPerm = await permissionsCol.findOne({ resource: 'training', action: 'report' });

  if (!contentPerm || !managePerm || !reportPerm) {
    console.error('❌ No se pudieron obtener los permisos creados');
    process.exit(1);
  }

  // 3. Asignar permisos a roles
  // - Todos los roles: training:report (reportar horas)
  // - Roles con training:create → agregar training:content
  // - HUMAN TALENT + QUALITY & TRAINING OFFICER → agregar training:manage

  // Agregar report a TODOS los roles
  const allRoles = await rolesCol.find({}).toArray();
  for (const role of allRoles) {
    const hasReport = role.permissions?.some((id: any) => id.toString() === reportPerm._id.toString());
    if (!hasReport) {
      await rolesCol.updateOne(
        { _id: role._id },
        { $addToSet: { permissions: reportPerm._id } }
      );
      console.log(`  📝 report → ${role.name}`);
    }
  }

  // Agregar content a roles que tienen training:create
  const createPerm = await permissionsCol.findOne({ resource: 'training', action: 'create' });
  if (createPerm) {
    const rolesWithCreate = await rolesCol.find({ permissions: createPerm._id }).toArray();
    for (const role of rolesWithCreate) {
      await rolesCol.updateOne(
        { _id: role._id },
        { $addToSet: { permissions: contentPerm._id } }
      );
      console.log(`  📄 content → ${role.name}`);
    }
  }

  // Agregar manage a HUMAN TALENT y roles que ya tienen ALL training perms
  const humanTalent = await rolesCol.findOne({ name: /HUMAN TALENT/i });
  if (humanTalent) {
    await rolesCol.updateOne(
      { _id: humanTalent._id },
      { $addToSet: { permissions: managePerm._id } }
    );
    console.log(`  👑 manage → ${humanTalent.name}`);
  }

  // Buscar rol de Oscar (QUALITY & TRAINING OFFICER o similar)
  const trainingOfficer = await rolesCol.findOne({ name: /TRAINING|QUALITY/i });
  if (trainingOfficer && trainingOfficer._id.toString() !== humanTalent?._id.toString()) {
    await rolesCol.updateOne(
      { _id: trainingOfficer._id },
      { $addToSet: { permissions: managePerm._id } }
    );
    console.log(`  👑 manage → ${trainingOfficer.name}`);
  }

  // Manuel (FOUNDER / ARCHITECT) — acceso total
  const founder = await rolesCol.findOne({ name: /FOUNDER|ARCHITECT.*SOLUTION/i });
  if (founder) {
    await rolesCol.updateOne(
      { _id: founder._id },
      { $addToSet: { permissions: { $each: [contentPerm._id, managePerm._id] } } }
    );
    console.log(`  👑 content + manage → ${founder.name}`);
  }

  console.log('\n✅ Migración completada');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
