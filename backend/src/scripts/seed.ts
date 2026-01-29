import { connectDB } from '../config/database';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';
import { Division } from '../models/Division';
import { Employee } from '../models/Employee';
import { CSWCategory } from '../models/CSWCategory';
import ApprovalFlow from '../models/ApprovalFlow';
import mongoose from 'mongoose';

/**
 * Script para poblar la base de datos con datos iniciales
 * Ejecutar con: npm run seed
 */
const seed = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🌱 Iniciando seed...\n');

    // Limpiar colecciones existentes
    console.log('🧹 Limpiando base de datos...');
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await Division.deleteMany({});
    await Employee.deleteMany({});
    await CSWCategory.deleteMany({});
    await ApprovalFlow.deleteMany({});

    // 1. Crear Permisos
    console.log('📋 Creando permisos...');
    const permissions = await Permission.create([
      // Empleados
      { resource: 'employees', action: 'read' },
      { resource: 'employees', action: 'create' },
      { resource: 'employees', action: 'update' },
      { resource: 'employees', action: 'delete' },
      
      // CSW
      { resource: 'csw', action: 'read' },
      { resource: 'csw', action: 'create' },
      { resource: 'csw', action: 'update' },
      { resource: 'csw', action: 'approve' },
      { resource: 'csw', action: 'cancel' },
      { resource: 'csw', action: 'delete' },
      
      // Categorías CSW
      { resource: 'csw_categories', action: 'read' },
      { resource: 'csw_categories', action: 'create' },
      { resource: 'csw_categories', action: 'update' },
      { resource: 'csw_categories', action: 'delete' },
      
      // Flujos de Aprobación
      { resource: 'approval_flows', action: 'read' },
      { resource: 'approval_flows', action: 'create' },
      { resource: 'approval_flows', action: 'update' },
      { resource: 'approval_flows', action: 'delete' },
      
      // Capacitaciones
      { resource: 'training', action: 'read' },
      { resource: 'training', action: 'create' },
      { resource: 'training', action: 'update' },
      { resource: 'training', action: 'delete' },
      
      // Divisiones
      { resource: 'divisions', action: 'read' },
      { resource: 'divisions', action: 'create' },
      { resource: 'divisions', action: 'update' },
      { resource: 'divisions', action: 'delete' },
      
      // Roles
      { resource: 'roles', action: 'read' },
      { resource: 'roles', action: 'create' },
      { resource: 'roles', action: 'update' },
      { resource: 'roles', action: 'delete' },
      
      // Permisos
      { resource: 'permissions', action: 'read' },
      { resource: 'permissions', action: 'create' },
      { resource: 'permissions', action: 'update' },
      { resource: 'permissions', action: 'delete' },
    ]);
    console.log(`✅ ${permissions.length} permisos creados`);

    // 2. Crear Roles
    console.log('\n👔 Creando roles...');
    
    // Rol: Admin (todos los permisos)
    const adminRole = await Role.create({
      name: 'ARCHITECT SOLUTIONS',
      permissions: permissions.map(p => p._id)
    });

    // Rol: Arquitecto Técnico
    const techArchitectRole = await Role.create({
      name: 'ARCHITECT TECHNICAL',
      permissions: permissions.filter(p => 
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create', 'update', 'approve'].includes(p.action)
      ).map(p => p._id)
    });

    // Rol: Desarrollador
    const developerRole = await Role.create({
      name: 'AI DRIVEN DEVELOPER',
      permissions: permissions.filter(p => 
        ['employees', 'csw', 'training'].includes(p.resource) &&
        ['read', 'create'].includes(p.action)
      ).map(p => p._id)
    });

    // Rol: QA
    const qaRole = await Role.create({
      name: 'AI DRIVEN QA',
      permissions: permissions.filter(p => 
        ['employees', 'training'].includes(p.resource) &&
        ['read'].includes(p.action)
      ).map(p => p._id)
    });

    // Rol: Talento Humano
    const hrRole = await Role.create({
      name: 'HUMAN TALENT',
      permissions: permissions.filter(p => 
        ['employees', 'csw', 'csw_categories', 'training', 'divisions', 'roles'].includes(p.resource)
      ).map(p => p._id)
    });

    console.log('✅ 5 roles creados');

    // 3. Crear Usuario Admin (sin división temporalmente)
    console.log('\n👤 Creando usuario administrador...');
    const tempDivisionId = new mongoose.Types.ObjectId();
    const admin = await Employee.create({
      name: 'Admin Principal',
      email: 'admin@rh.com',
      password: 'admin123',
      role: adminRole._id,
      division: tempDivisionId, // ID temporal
      birthDate: new Date('1985-03-15'),
      nationalId: '1234567890',
      phone: '+1234567890',
      nationality: 'Generic Country'
    });

    // 4. Crear Divisiones con el admin real
    console.log('\n🏢 Creando divisiones...');
    const divisions = await Division.create([
      { name: 'División 1', code: 'DIV01', description: 'Desarrollo Frontend', managerId: admin._id },
      { name: 'División 2', code: 'DIV02', description: 'Desarrollo Backend', managerId: admin._id },
      { name: 'División 3', code: 'DIV03', description: 'QA y Testing', managerId: admin._id },
      { name: 'División 4', code: 'DIV04', description: 'DevOps', managerId: admin._id },
      { name: 'División 5', code: 'DIV05', description: 'UX/UI', managerId: admin._id },
      { name: 'División 6', code: 'DIV06', description: 'Arquitectura', managerId: admin._id },
      { name: 'División 7', code: 'DIV07', description: 'Datos', managerId: admin._id },
      { name: 'División 8', code: 'DIV08', description: 'Seguridad', managerId: admin._id },
      { name: 'División 9', code: 'DIV09', description: 'Mobile', managerId: admin._id },
      { name: 'División 10', code: 'DIV10', description: 'Talento Humano', managerId: admin._id },
    ]);
    console.log(`✅ ${divisions.length} divisiones creadas`);

    // 5. Actualizar admin con división real
    admin.division = divisions[9]._id; // División 10 (Talento Humano)
    await admin.save();

    // 6. Crear Empleados de Ejemplo
    console.log('\n👥 Creando empleados de ejemplo...');
    const employees = await Employee.create([
      // Frontend Division
      {
        name: 'Jordan Blake',
        email: 'jordan.blake@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[0]._id,
        birthDate: new Date('1992-06-20'),
        nationalId: '2345678901',
        phone: '+1234567891',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      {
        name: 'Morgan Lee',
        email: 'morgan.lee@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[0]._id,
        birthDate: new Date('1995-08-12'),
        nationalId: '2345678902',
        phone: '+1234567895',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // Backend Division
      {
        name: 'Casey Johnson',
        email: 'casey.johnson@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[1]._id,
        birthDate: new Date('1993-04-18'),
        nationalId: '5678901234',
        phone: '+1234567894',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      {
        name: 'Riley Parker',
        email: 'riley.parker@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[1]._id,
        birthDate: new Date('1991-11-25'),
        nationalId: '5678901235',
        phone: '+1234567896',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // QA Division
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@rh.com',
        password: 'qa123456',
        role: qaRole._id,
        division: divisions[2]._id,
        birthDate: new Date('1994-09-10'),
        nationalId: '3456789012',
        phone: '+1234567892',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      {
        name: 'Jamie Collins',
        email: 'jamie.collins@rh.com',
        password: 'qa123456',
        role: qaRole._id,
        division: divisions[2]._id,
        birthDate: new Date('1996-02-28'),
        nationalId: '3456789013',
        phone: '+1234567897',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // DevOps Division
      {
        name: 'Avery Santos',
        email: 'avery.santos@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[3]._id,
        birthDate: new Date('1990-07-14'),
        nationalId: '6789012345',
        phone: '+1234567898',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // UX/UI Division
      {
        name: 'Dakota Kim',
        email: 'dakota.kim@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[4]._id,
        birthDate: new Date('1993-05-22'),
        nationalId: '7890123456',
        phone: '+1234567899',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // Arquitectura Division
      {
        name: 'Taylor Morgan',
        email: 'taylor.morgan@rh.com',
        password: 'arch123456',
        role: techArchitectRole._id,
        division: divisions[5]._id,
        birthDate: new Date('1988-12-05'),
        nationalId: '4567890123',
        phone: '+1234567893',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      {
        name: 'Skyler Chen',
        email: 'skyler.chen@rh.com',
        password: 'arch123456',
        role: techArchitectRole._id,
        division: divisions[5]._id,
        birthDate: new Date('1987-03-30'),
        nationalId: '4567890124',
        phone: '+1234567900',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // Datos Division
      {
        name: 'Phoenix Martinez',
        email: 'phoenix.martinez@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[6]._id,
        birthDate: new Date('1991-09-18'),
        nationalId: '8901234567',
        phone: '+1234567901',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // Seguridad Division
      {
        name: 'River Thompson',
        email: 'river.thompson@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[7]._id,
        birthDate: new Date('1989-01-08'),
        nationalId: '9012345678',
        phone: '+1234567902',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // Mobile Division
      {
        name: 'Quinn Anderson',
        email: 'quinn.anderson@rh.com',
        password: 'dev123456',
        role: developerRole._id,
        division: divisions[8]._id,
        birthDate: new Date('1994-10-15'),
        nationalId: '0123456789',
        phone: '+1234567903',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      // Talento Humano Division
      {
        name: 'Sage Wilson',
        email: 'sage.wilson@rh.com',
        password: 'hr123456',
        role: hrRole._id,
        division: divisions[9]._id,
        birthDate: new Date('1990-06-12'),
        nationalId: '1357924680',
        phone: '+1234567904',
        nationality: 'Generic Country',
        managerId: admin._id
      },
      {
        name: 'Rowan Davis',
        email: 'rowan.davis@rh.com',
        password: 'hr123456',
        role: hrRole._id,
        division: divisions[9]._id,
        birthDate: new Date('1992-08-28'),
        nationalId: '2468013579',
        phone: '+1234567905',
        nationality: 'Generic Country',
        managerId: admin._id
      }
    ]);
    console.log(`✅ ${employees.length} empleados de ejemplo creados`);

    // Resumen
    console.log('\n📊 ============= RESUMEN =============');
    console.log(`✅ ${permissions.length} permisos`);
    console.log('✅ 5 roles');
    console.log(`✅ ${divisions.length} divisiones`);
    console.log(`✅ ${employees.length + 1} empleados totales`);
    console.log('\n🔐 ============= CREDENCIALES DE ACCESO =============');
    console.log('📧 Admin: admin@rh.com | admin123');
    console.log('\n👥 Empleados (todos pueden hacer login):');
    console.log('📧 jordan.blake@rh.com | dev123456 (Frontend Dev)');
    console.log('📧 morgan.lee@rh.com | dev123456 (Frontend Dev)');
    console.log('📧 casey.johnson@rh.com | dev123456 (Backend Dev)');
    console.log('📧 riley.parker@rh.com | dev123456 (Backend Dev)');
    console.log('📧 alex.rivera@rh.com | qa123456 (QA)');
    console.log('📧 jamie.collins@rh.com | qa123456 (QA)');
    console.log('📧 avery.santos@rh.com | dev123456 (DevOps)');
    console.log('📧 dakota.kim@rh.com | dev123456 (UX/UI)');
    console.log('📧 taylor.morgan@rh.com | arch123456 (Arquitecto)');
    console.log('📧 skyler.chen@rh.com | arch123456 (Arquitecto)');
    console.log('📧 phoenix.martinez@rh.com | dev123456 (Datos)');
    console.log('📧 river.thompson@rh.com | dev123456 (Seguridad)');
    console.log('📧 quinn.anderson@rh.com | dev123456 (Mobile)');
    console.log('📧 sage.wilson@rh.com | hr123456 (RRHH)');
    console.log('📧 rowan.davis@rh.com | hr123456 (RRHH)');
    console.log('=====================================================\n');

    // 7. Crear Categorías CSW
    console.log('\n📂 Creando categorías CSW...');
    const categories = await CSWCategory.create([
      { name: 'Permiso', description: 'Solicitud de permiso laboral por asuntos personales', active: true, order: 1 },
      { name: 'Vacaciones', description: 'Solicitud de días de vacaciones', active: true, order: 2 },
      { name: 'Incapacidad', description: 'Reporte de incapacidad médica o certificado médico', active: true, order: 3 },
      { name: 'Aumento Salarial', description: 'Solicitud de incremento de salario', active: true, order: 4 },
      { name: 'Cambio de Turno', description: 'Solicitud de cambio de horario o turno laboral', active: true, order: 5 },
      { name: 'Cambio de Puesto', description: 'Solicitud de cambio de cargo o posición', active: true, order: 6 },
      { name: 'Capacitación', description: 'Solicitud de capacitación, curso o certificación', active: true, order: 7 },
      { name: 'Trabajo Remoto', description: 'Solicitud de trabajo desde casa o remoto', active: true, order: 8 },
      { name: 'Horas Extra', description: 'Reporte o solicitud de horas extras', active: true, order: 9 },
      { name: 'Préstamo', description: 'Solicitud de préstamo o anticipo de nómina', active: true, order: 10 },
      { name: 'Licencia Maternidad/Paternidad', description: 'Solicitud de licencia por nacimiento o adopción', active: true, order: 11 },
      { name: 'Renuncia', description: 'Notificación de renuncia voluntaria', active: true, order: 12 },
      { name: 'Queja o Reclamo', description: 'Reporte de inconformidad o queja laboral', active: true, order: 13 },
      { name: 'Solicitud de Equipos', description: 'Solicitud de equipos de cómputo o herramientas', active: true, order: 14 },
      { name: 'Otros', description: 'Otras solicitudes no categorizadas', active: true, order: 99 }
    ]);
    console.log(`✅ ${categories.length} categorías CSW creadas`);

    // 8. Crear Flujos de Aprobación por División
    console.log('\n🔄 Creando flujos de aprobación...');
    
    // Flujo para División 1-9 (Tecnología) - Tech Lead → Arq. Técnico → Arq. Soluciones
    const techFlows = await Promise.all(
      divisions.slice(0, 9).map(division => 
        ApprovalFlow.create({
          divisionId: division._id,
          name: `Flujo ${division.name}`,
          description: `Flujo de aprobación para solicitudes de ${division.name}`,
          levels: [
            {
              order: 1,
              name: 'Arquitecto Técnico',
              approverType: 'role',
              approverRoleId: techArchitectRole._id,
              required: true,
              autoApprove: false
            },
            {
              order: 2,
              name: 'Arquitecto de Soluciones',
              approverType: 'role',
              approverRoleId: adminRole._id,
              required: true,
              autoApprove: false
            }
          ],
          active: true,
          isDefault: false
        })
      )
    );

    // Flujo para División 10 (Talento Humano) - Directo al Admin (CEO)
    const hrFlow = await ApprovalFlow.create({
      divisionId: divisions[9]._id,
      name: 'Flujo Talento Humano',
      description: 'Flujo de aprobación para solicitudes de Talento Humano',
      levels: [
        {
          order: 1,
          name: 'CEO / Arquitecto de Soluciones',
          approverType: 'user',
          approverUserId: admin._id,
          required: true,
          autoApprove: false
        }
      ],
      active: true,
      isDefault: false
    });

    console.log(`✅ ${techFlows.length + 1} flujos de aprobación creados`);

    console.log('=====================================================\n');

    console.log('✅ Seed completado exitosamente!');
    console.log('💡 Todos los empleados tienen acceso al login del aplicativo');
    console.log('\n📋 Categorías CSW disponibles:');
    console.log('  - Permiso, Aumento, Incapacidad, Vacaciones, Cambio de Turno, Capacitación, Otros');
    console.log('\n🔄 Flujos de Aprobación:');
    console.log('  - Divisiones 1-9: Arq. Técnico → Arq. Soluciones');
    console.log('  - División 10 (RRHH): CEO directo');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seed();
