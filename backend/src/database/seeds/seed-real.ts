import { connectDB } from '../../config/database';
import { Permission } from '../../models/Permission';
import { Role } from '../../models/Role';
import { Division } from '../../models/Division';
import { Employee } from '../../models/Employee';
import { CSWCategory } from '../../models/CSWCategory';
import ApprovalFlow from '../../models/ApprovalFlow';
import mongoose from 'mongoose';

/**
 * Seed REAL — Datos reales de Unlimitech Cloud según organigrama
 * 
 * Ejecutar con: npx ts-node src/database/seeds/seed-real.ts
 * 
 * ⚠️  ADVERTENCIA: Este script BORRA todos los datos existentes
 */
const seedReal = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🌱 Seed REAL — Organigrama Unlimitech Cloud\n');

    // Limpiar
    console.log('🧹 Limpiando base de datos...');
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await Division.deleteMany({});
    await Employee.deleteMany({});
    await CSWCategory.deleteMany({});
    await ApprovalFlow.deleteMany({});

    // 1. PERMISOS
    console.log('📋 Creando permisos...');
    const permissions = await Permission.create([
      { resource: 'employees', action: 'read' },
      { resource: 'employees', action: 'create' },
      { resource: 'employees', action: 'update' },
      { resource: 'employees', action: 'delete' },
      { resource: 'csw', action: 'read' },
      { resource: 'csw', action: 'create' },
      { resource: 'csw', action: 'update' },
      { resource: 'csw', action: 'approve' },
      { resource: 'csw', action: 'cancel' },
      { resource: 'csw', action: 'delete' },
      { resource: 'csw_categories', action: 'read' },
      { resource: 'csw_categories', action: 'create' },
      { resource: 'csw_categories', action: 'update' },
      { resource: 'csw_categories', action: 'delete' },
      { resource: 'approval_flows', action: 'read' },
      { resource: 'approval_flows', action: 'create' },
      { resource: 'approval_flows', action: 'update' },
      { resource: 'approval_flows', action: 'delete' },
      { resource: 'training', action: 'read' },
      { resource: 'training', action: 'create' },
      { resource: 'training', action: 'update' },
      { resource: 'training', action: 'delete' },
      { resource: 'divisions', action: 'read' },
      { resource: 'divisions', action: 'create' },
      { resource: 'divisions', action: 'update' },
      { resource: 'divisions', action: 'delete' },
      { resource: 'roles', action: 'read' },
      { resource: 'roles', action: 'create' },
      { resource: 'roles', action: 'update' },
      { resource: 'roles', action: 'delete' },
      { resource: 'permissions', action: 'read' },
      { resource: 'permissions', action: 'create' },
      { resource: 'permissions', action: 'update' },
      { resource: 'permissions', action: 'delete' },
    ]);
    console.log(`✅ ${permissions.length} permisos`);

    // 2. HATS (Roles) — Basados en el organigrama real
    console.log('\n🎩 Creando hats...');
    const allPermsIds = permissions.map(p => p._id);

    const ceoHat = await Role.create({ name: 'CHIEF EXECUTIVE OFFICER', permissions: allPermsIds });
    const evpHat = await Role.create({ name: 'EXECUTIVE VICE PRESIDENT', permissions: allPermsIds });
    const founderHat = await Role.create({ name: 'FOUNDER & SOLUTIONS ARCHITECT', permissions: allPermsIds });
    const htmHat = await Role.create({
      name: 'HUMAN TALENT MANAGER',
      permissions: permissions.filter(p =>
        ['employees', 'divisions', 'roles', 'permissions', 'csw', 'csw_categories', 'training'].includes(p.resource)
      ).map(p => p._id)
    });
    const tamHat = await Role.create({
      name: 'TECHNICAL ARCHITECT MANAGER',
      permissions: permissions.filter(p =>
        ['employees', 'csw', 'training', 'divisions', 'approval_flows'].includes(p.resource) &&
        ['read', 'create', 'update', 'approve'].includes(p.action)
      ).map(p => p._id)
    });
    const tlHat = await Role.create({
      name: 'TECHNICAL LEADER',
      permissions: permissions.filter(p =>
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create', 'update', 'approve'].includes(p.action)
      ).map(p => p._id)
    });
    const pmHat = await Role.create({
      name: 'PROJECT MANAGER',
      permissions: permissions.filter(p =>
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create', 'update'].includes(p.action)
      ).map(p => p._id)
    });
    const devHat = await Role.create({
      name: 'DEVELOPER',
      permissions: permissions.filter(p =>
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create'].includes(p.action)
      ).map(p => p._id)
    });
    const qaHat = await Role.create({
      name: 'QA ANALYST',
      permissions: permissions.filter(p =>
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create'].includes(p.action)
      ).map(p => p._id)
    });
    const designerHat = await Role.create({
      name: 'UI/UX DESIGNER',
      permissions: permissions.filter(p =>
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create'].includes(p.action)
      ).map(p => p._id)
    });
    const salesHat = await Role.create({
      name: 'SALES REPRESENTATIVE',
      permissions: permissions.filter(p =>
        ['employees', 'csw'].includes(p.resource) && ['read', 'create'].includes(p.action)
      ).map(p => p._id)
    });
    const ethicsHat = await Role.create({
      name: 'ETHICS OFFICER',
      permissions: permissions.filter(p =>
        ['employees', 'csw'].includes(p.resource) && ['read'].includes(p.action)
      ).map(p => p._id)
    });
    const qualityHat = await Role.create({
      name: 'QUALITY & TRAINING OFFICER',
      permissions: permissions.filter(p =>
        ['employees', 'training', 'csw'].includes(p.resource) &&
        ['read', 'create', 'update'].includes(p.action)
      ).map(p => p._id)
    });

    console.log('✅ 13 hats creados');

    // 3. DIVISIONES — 7 divisiones reales
    console.log('\n🏢 Creando divisiones...');
    const tempId = new mongoose.Types.ObjectId();

    // Crear admin primero para usarlo como managerId temporal
    const adminUser = await Employee.create({
      name: 'Manuel Lara', email: 'admin@rh.com', password: 'Pass2014!',
      role: founderHat._id, division: tempId, birthDate: new Date('1985-01-15'),
      nationalId: 'FOUNDER001', phone: '+573001000001', nationality: 'Colombia',
      approve_csw: true, forcePasswordChange: false
    });

    const divisions = await Division.create([
      { name: 'División 1 — Talento Humano', code: 'DIV01', description: 'Contrata, forma personal y mantiene comunicaciones y ética', managerId: adminUser._id },
      { name: 'División 2 — Diseminación', code: 'DIV02', description: 'Marketing, publicaciones y ventas', managerId: adminUser._id },
      { name: 'División 3 — Finanzas', code: 'DIV03', description: 'Ingreso, pagos, activos y materiales', managerId: adminUser._id },
      { name: 'División 4 — Infraestructura', code: 'DIV04', description: 'Planeación, Cloud Services y Desarrollo de Software', managerId: adminUser._id },
      { name: 'División 5 — Calidad', code: 'DIV05', description: 'Exámenes, revisión, certificaciones y premios', managerId: adminUser._id },
      { name: 'División 6 — Relaciones Públicas', code: 'DIV06', description: 'Información al público, servicios y éxito', managerId: adminUser._id },
      { name: 'División 7 — Ejecutiva', code: 'DIV07', description: 'Oficina del CEO, Asuntos Especiales y Fundador', managerId: adminUser._id },
    ]);
    console.log(`✅ ${divisions.length} divisiones`);

    // Asignar división al admin
    adminUser.division = divisions[6]._id; // Div 7 Ejecutiva
    await adminUser.save();

    // 4. EMPLEADOS REALES
    console.log('\n👥 Creando empleados...');
    const defaultPassword = 'Pass2014!';

    const employees = await Employee.create([
      // División 7 — Ejecutiva
      { name: 'Catherine Quiñonez', email: 'catherine@unlimitech.com', password: defaultPassword, role: ceoHat._id, division: divisions[6]._id, birthDate: new Date('1988-05-20'), nationalId: 'CEO001', phone: '+573001000002', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      { name: 'Oscar Avila', email: 'oscar@unlimitech.com', password: defaultPassword, role: evpHat._id, division: divisions[6]._id, birthDate: new Date('1990-03-10'), nationalId: 'EVP001', phone: '+573001000003', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      // División 1 — Talento Humano
      { name: 'Carmenza Trejos', email: 'carmenza@unlimitech.com', password: defaultPassword, role: htmHat._id, division: divisions[0]._id, birthDate: new Date('1975-08-12'), nationalId: 'HTM001', phone: '+573001000004', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      { name: 'Vanesa Mora', email: 'vanesa@unlimitech.com', password: defaultPassword, role: ethicsHat._id, division: divisions[0]._id, birthDate: new Date('1992-11-05'), nationalId: 'ETH001', phone: '+573001000005', nationality: 'Colombia', forcePasswordChange: false },
      // División 2 — Diseminación
      { name: 'Natalia Rocha', email: 'natalia@unlimitech.com', password: defaultPassword, role: salesHat._id, division: divisions[1]._id, birthDate: new Date('1994-06-18'), nationalId: 'SAL001', phone: '+573001000006', nationality: 'Colombia', forcePasswordChange: false },
      // División 4 — Infraestructura
      { name: 'Moises Gonzalez', email: 'moises@unlimitech.com', password: defaultPassword, role: tamHat._id, division: divisions[3]._id, birthDate: new Date('1987-09-25'), nationalId: 'TAM001', phone: '+573001000007', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      { name: 'Joel Castro', email: 'joel@unlimitech.com', password: defaultPassword, role: pmHat._id, division: divisions[3]._id, birthDate: new Date('1991-02-14'), nationalId: 'PM001', phone: '+573001000008', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Orlando Bohorquez', email: 'orlando@unlimitech.com', password: defaultPassword, role: tlHat._id, division: divisions[3]._id, birthDate: new Date('1989-07-30'), nationalId: 'TL001', phone: '+573001000009', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      { name: 'Juan Maldonado', email: 'juan.maldonado@unlimitech.com', password: defaultPassword, role: tlHat._id, division: divisions[3]._id, birthDate: new Date('1990-04-22'), nationalId: 'TL002', phone: '+573001000010', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      { name: 'Julian Castaño', email: 'julian@unlimitech.com', password: defaultPassword, role: tlHat._id, division: divisions[3]._id, birthDate: new Date('1988-12-01'), nationalId: 'TL003', phone: '+573001000011', nationality: 'Colombia', approve_csw: true, forcePasswordChange: false },
      { name: 'Wenser Olmos', email: 'wenser@unlimitech.com', password: defaultPassword, role: designerHat._id, division: divisions[3]._id, birthDate: new Date('1993-10-15'), nationalId: 'DES001', phone: '+573001000012', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Camilo Perez', email: 'camilo@unlimitech.com', password: defaultPassword, role: devHat._id, division: divisions[3]._id, birthDate: new Date('1995-01-28'), nationalId: 'DEV001', phone: '+573001000013', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Andres Alizo', email: 'andres@unlimitech.com', password: defaultPassword, role: devHat._id, division: divisions[3]._id, birthDate: new Date('1994-03-12'), nationalId: 'DEV002', phone: '+573001000014', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Kevin Gutierrez', email: 'kevin@unlimitech.com', password: defaultPassword, role: devHat._id, division: divisions[3]._id, birthDate: new Date('1996-08-07'), nationalId: 'DEV003', phone: '+573001000015', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Lautaro Garcia', email: 'lautaro@unlimitech.com', password: defaultPassword, role: devHat._id, division: divisions[3]._id, birthDate: new Date('1997-05-19'), nationalId: 'DEV004', phone: '+573001000016', nationality: 'Argentina', forcePasswordChange: false },
      { name: 'Gabriel Hernandez', email: 'gabriel@unlimitech.com', password: defaultPassword, role: devHat._id, division: divisions[3]._id, birthDate: new Date('1993-11-23'), nationalId: 'DEV005', phone: '+573001000017', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Stiven Colorado', email: 'stiven@unlimitech.com', password: defaultPassword, role: devHat._id, division: divisions[3]._id, birthDate: new Date('1995-07-04'), nationalId: 'DEV006', phone: '+573001000018', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Jair Zea', email: 'jair@unlimitech.com', password: defaultPassword, role: qaHat._id, division: divisions[3]._id, birthDate: new Date('1992-09-16'), nationalId: 'QA001', phone: '+573001000019', nationality: 'Colombia', forcePasswordChange: false },
      { name: 'Jhoann Acosta', email: 'jeacosta37@gmail.com', password: defaultPassword, role: qaHat._id, division: divisions[3]._id, birthDate: new Date('1993-06-30'), nationalId: 'QA002', phone: '+573001000020', nationality: 'Colombia', forcePasswordChange: false },
      // División 5 — Calidad
      { name: 'Laura Corredor', email: 'laura@unlimitech.com', password: defaultPassword, role: qualityHat._id, division: divisions[4]._id, birthDate: new Date('1991-04-10'), nationalId: 'QAL001', phone: '+573001000021', nationality: 'Colombia', forcePasswordChange: false },
    ]);
    console.log(`✅ ${employees.length + 1} empleados (incluyendo admin)`);

    // Actualizar managerId de divisiones
    await Division.findByIdAndUpdate(divisions[0]._id, { managerId: employees[2]._id }); // Carmenza → Div 1
    await Division.findByIdAndUpdate(divisions[3]._id, { managerId: employees[5]._id }); // Moises → Div 4

    // 5. CATEGORÍAS CSW
    console.log('\n📂 Creando categorías CSW...');
    const categories = await CSWCategory.create([
      { name: 'Permiso', description: 'Solicitud de permiso laboral', active: true, order: 1 },
      { name: 'Vacaciones', description: 'Solicitud de días de vacaciones', active: true, order: 2 },
      { name: 'Incapacidad', description: 'Reporte de incapacidad médica', active: true, order: 3 },
      { name: 'Aumento Salarial', description: 'Solicitud de incremento salarial', active: true, order: 4 },
      { name: 'Cambio de Turno', description: 'Cambio de horario laboral', active: true, order: 5 },
      { name: 'Capacitación', description: 'Solicitud de curso o certificación', active: true, order: 6 },
      { name: 'Trabajo Remoto', description: 'Solicitud de trabajo remoto', active: true, order: 7 },
      { name: 'Horas Extra', description: 'Reporte de horas extras', active: true, order: 8 },
      { name: 'Solicitud de Equipos', description: 'Equipos de cómputo o herramientas', active: true, order: 9 },
      { name: 'Queja o Reclamo', description: 'Inconformidad laboral', active: true, order: 10 },
      { name: 'Orden de Estudio', description: 'Solicitud de cambio de horario para horas de estudio', active: true, order: 11, useDefaultFlow: false, directApproverId: employees[1]._id },
      { name: 'Otros', description: 'Solicitudes no categorizadas', active: true, order: 99 },
    ]);
    console.log(`✅ ${categories.length} categorías CSW`);

    // 6. FLUJOS DE APROBACIÓN
    console.log('\n🔄 Creando flujos de aprobación...');
    // Div 4 (Infraestructura): TL → Technical Architect → CEO
    await ApprovalFlow.create({
      divisionId: divisions[3]._id,
      name: 'Flujo Infraestructura',
      description: 'TL → Technical Architect → CEO',
      levels: [
        { order: 1, name: 'Technical Leader', approverType: 'role', approverRoleId: tlHat._id, required: true, autoApprove: false },
        { order: 2, name: 'Technical Architect Manager', approverType: 'user', approverUserId: employees[5]._id, required: true, autoApprove: false },
        { order: 3, name: 'CEO', approverType: 'user', approverUserId: employees[0]._id, required: true, autoApprove: false },
      ],
      active: true, isDefault: false
    });

    // Div 1 (Talento Humano): HT Manager → CEO
    await ApprovalFlow.create({
      divisionId: divisions[0]._id,
      name: 'Flujo Talento Humano',
      description: 'Human Talent Manager → CEO',
      levels: [
        { order: 1, name: 'Human Talent Manager', approverType: 'user', approverUserId: employees[2]._id, required: true, autoApprove: false },
        { order: 2, name: 'CEO', approverType: 'user', approverUserId: employees[0]._id, required: true, autoApprove: false },
      ],
      active: true, isDefault: false
    });

    // Default para demás divisiones: CEO directo
    for (const div of [divisions[1], divisions[2], divisions[4], divisions[5], divisions[6]]) {
      await ApprovalFlow.create({
        divisionId: div._id,
        name: `Flujo ${div.name.split('—')[1]?.trim() || div.name}`,
        description: 'Aprobación directa CEO',
        levels: [
          { order: 1, name: 'CEO', approverType: 'user', approverUserId: employees[0]._id, required: true, autoApprove: false },
        ],
        active: true, isDefault: false
      });
    }
    console.log('✅ 7 flujos de aprobación');

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED REAL COMPLETADO — Organigrama Unlimitech Cloud');
    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`   • ${permissions.length} permisos`);
    console.log(`   • 13 hats`);
    console.log(`   • ${divisions.length} divisiones`);
    console.log(`   • ${employees.length + 1} empleados`);
    console.log(`   • ${categories.length} categorías CSW`);
    console.log(`   • 7 flujos de aprobación`);
    console.log(`\n🔐 Credenciales (todos: Pass2014!):`);
    console.log(`   📧 admin@rh.com — Founder & Solutions Architect`);
    console.log(`   📧 catherine@unlimitech.com — CEO`);
    console.log(`   📧 moises@unlimitech.com — Technical Architect Manager`);
    console.log(`   📧 jeacosta37@gmail.com — QA Analyst`);
    console.log(`\n✅ Empleados con approve_csw=true:`);
    console.log(`   • Manuel Lara, Catherine Quiñonez, Oscar Avila`);
    console.log(`   • Carmenza Trejos, Moises Gonzalez`);
    console.log(`   • Orlando Bohorquez, Juan Maldonado, Julian Castaño`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedReal();
