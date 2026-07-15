import mongoose from 'mongoose';
import { config } from '../../config/env';
import { LibraryCategory } from '../../models/training/LibraryCategory';
import { LibraryDocument } from '../../models/training/LibraryDocument';
import { LibraryDocumentVersion } from '../../models/training/LibraryDocumentVersion';
import { Employee } from '../../models/Employee';

/**
 * Seed: 10 documentos adicionales + 3 categorías nuevas para validar paginación.
 *
 * Ejecutar: npx ts-node --transpile-only src/database/seeds/seed-library-extra-docs.ts
 */

async function seedExtraDocs() {
  try {
    console.log('🌱 Seed: Documentos extra + categorías nuevas\n');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado\n');

    const admin = await Employee.findOne().sort({ createdAt: 1 });
    if (!admin) { console.error('❌ No hay empleados'); process.exit(1); }

    // Crear 3 categorías nuevas de nivel raíz
    const newCategories = [
      { name: 'Manuales Técnicos', slug: 'manuales-tecnicos', icon: 'wrench', color: '#F97316', order: 3 },
      { name: 'Whitepapers', slug: 'whitepapers', icon: 'file-text', color: '#8B5CF6', order: 4 },
      { name: 'Boletines', slug: 'boletines', icon: 'book-open', color: '#EC4899', order: 5 },
    ];

    const catMap: Record<string, any> = {};
    for (const cat of newCategories) {
      let existing = await LibraryCategory.findOne({ slug: cat.slug }).setOptions({ includeDeleted: true });
      if (!existing) {
        const newCat = new LibraryCategory({ ...cat, isSystem: false, active: true, depth: 0, parent: null, documentsCount: 0, createdBy: admin._id });
        await newCat.save();
        existing = newCat;
        console.log(`   📁 Categoría: "${cat.name}"`);
      }
      catMap[cat.slug] = existing;
    }

    // Obtener categorías existentes
    const cursos = await LibraryCategory.findOne({ slug: 'cursos' });
    const politicas = await LibraryCategory.findOne({ slug: 'politicas' });
    const nivel1 = await LibraryCategory.findOne({ slug: 'nivel-1-fundamentos' });
    const nivel2 = await LibraryCategory.findOne({ slug: 'nivel-2-intermedio' });

    const documents = [
      {
        title: 'Guía de Git y Control de Versiones',
        slug: 'guia-git-control-versiones',
        description: 'Flujo de trabajo con Git, branching, commits y pull requests',
        category: nivel1?._id || cursos?._id,
        type: 'article' as const,
        content: '# Git — Control de Versiones\n\n## Comandos básicos\n\n```bash\ngit init\ngit add .\ngit commit -m "feat: mensaje"\ngit push origin main\n```\n\n## Branching\n\n- `main` — producción\n- `develop` — integración\n- `feature/` — nuevas funcionalidades\n- `bugfix/` — correcciones\n\n## Convenciones de commits\n\n- `feat()`: nueva funcionalidad\n- `fix()`: corrección\n- `docs()`: documentación\n- `chore()`: mantenimiento',
        tags: ['git', 'versionamiento', 'desarrollo'],
        published: true,
        featured: false,
      },
      {
        title: 'Introducción a Docker y Contenedores',
        slug: 'introduccion-docker-contenedores',
        description: 'Conceptos básicos de Docker, imágenes y contenedores',
        category: nivel2?._id || cursos?._id,
        type: 'article' as const,
        content: '# Docker — Contenedores\n\n## ¿Qué es Docker?\n\nDocker permite empaquetar aplicaciones en contenedores ligeros y portables.\n\n## Comandos esenciales\n\n```bash\ndocker build -t mi-app .\ndocker run -p 3000:3000 mi-app\ndocker-compose up -d\n```\n\n## Dockerfile básico\n\n```dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n```',
        tags: ['docker', 'contenedores', 'devops'],
        published: true,
        featured: true,
      },
      {
        title: 'Política de Seguridad de Contraseñas',
        slug: 'politica-seguridad-contrasenas',
        description: 'Requisitos y buenas prácticas para contraseñas corporativas',
        category: politicas?._id,
        type: 'article' as const,
        content: '# Política de Contraseñas\n\n## Requisitos mínimos\n\n- 8 caracteres mínimo\n- Al menos 1 mayúscula\n- Al menos 1 número\n- Al menos 1 carácter especial\n\n## Rotación\n\n- Cambiar cada 90 días\n- No reutilizar las últimas 5 contraseñas\n\n## 2FA\n\nTodos los empleados DEBEN activar autenticación de dos factores en:\n- Email corporativo\n- GitHub/GitLab\n- AWS Console\n- Slack',
        tags: ['seguridad', 'contraseñas', 'política'],
        published: true,
        featured: false,
      },
      {
        title: 'Manual de Configuración de Ambiente Local',
        slug: 'manual-configuracion-ambiente-local',
        description: 'Paso a paso para configurar el ambiente de desarrollo',
        category: catMap['manuales-tecnicos']?._id,
        type: 'article' as const,
        content: '# Configuración de Ambiente Local\n\n## Requisitos\n\n- Node.js 20+\n- MongoDB 7+\n- Git\n- VS Code (recomendado)\n\n## Instalación\n\n1. Clonar el repositorio\n2. `npm install` en backend y frontend\n3. Copiar `.env.example` a `.env`\n4. Levantar MongoDB\n5. Ejecutar seeds\n6. `npm run dev`\n\n## Puertos\n\n| Servicio | Puerto |\n|----------|--------|\n| Backend | 9050 |\n| Frontend | 5173 |\n| MongoDB | 27017 |',
        tags: ['ambiente', 'configuración', 'local', 'setup'],
        published: true,
        featured: false,
      },
      {
        title: 'Whitepaper: Arquitectura de Microservicios',
        slug: 'whitepaper-arquitectura-microservicios',
        description: 'Análisis detallado de patrones de microservicios para escalar',
        category: catMap['whitepapers']?._id,
        type: 'article' as const,
        content: '# Arquitectura de Microservicios\n\n## Resumen Ejecutivo\n\nEste documento analiza los patrones arquitectónicos para sistemas distribuidos.\n\n## Patrones Clave\n\n1. **API Gateway** — Punto de entrada único\n2. **Service Discovery** — Registro dinámico\n3. **Circuit Breaker** — Tolerancia a fallos\n4. **Event Sourcing** — Historial de eventos\n5. **CQRS** — Separación lectura/escritura\n\n## Recomendaciones\n\nPara nuestra escala actual (< 50 desarrolladores), un monolito modular es más apropiado que microservicios.',
        tags: ['arquitectura', 'microservicios', 'whitepaper'],
        published: true,
        featured: true,
      },
      {
        title: 'Boletín Julio 2026 — Novedades del Equipo',
        slug: 'boletin-julio-2026-novedades',
        description: 'Resumen mensual de logros, nuevos miembros y próximos eventos',
        category: catMap['boletines']?._id,
        type: 'article' as const,
        content: '# Boletín Julio 2026\n\n## Bienvenidos\n\n- Jhoann se unió al equipo de QA\n- Oscar lidera el módulo de Training\n\n## Logros del mes\n\n- 244 criterios de aceptación automatizados\n- Módulo CSW con flujo de 3 niveles\n- Video corporativo publicado\n\n## Próximos eventos\n\n- 20 Jul: Demo del módulo Training\n- 25 Jul: Hackathon interno\n- 30 Jul: Cierre de sprint',
        tags: ['boletín', 'julio', 'novedades'],
        published: true,
        featured: false,
      },
      {
        title: 'Curso de Testing E2E con Playwright',
        slug: 'curso-testing-e2e-playwright',
        description: 'Enlace al curso completo de testing automatizado',
        category: nivel2?._id || cursos?._id,
        type: 'link' as const,
        externalLink: 'https://playwright.dev/docs/intro',
        tags: ['testing', 'e2e', 'playwright', 'automatización'],
        published: true,
        featured: false,
      },
      {
        title: 'Manual de Despliegue en Producción',
        slug: 'manual-despliegue-produccion',
        description: 'Procedimiento paso a paso para deploy en AWS',
        category: catMap['manuales-tecnicos']?._id,
        type: 'mixed' as const,
        content: '# Despliegue en Producción\n\n## Pre-requisitos\n\n- Branch `main` actualizado\n- Tests pasando al 100%\n- PR aprobado por al menos 2 reviewers\n\n## Pasos\n\n1. Merge a `main`\n2. GitHub Actions ejecuta el pipeline\n3. Build de Docker images\n4. Push a ECR\n5. Deploy a ECS\n6. Verificar health check\n\n## Rollback\n\nSi algo falla:\n```bash\naws ecs update-service --force-new-deployment --cluster main --service api\n```',
        externalLink: 'https://docs.aws.amazon.com/ecs/',
        tags: ['deploy', 'producción', 'aws', 'devops'],
        published: true,
        featured: false,
      },
      {
        title: 'Whitepaper: IA Aplicada a RRHH',
        slug: 'whitepaper-ia-aplicada-rrhh',
        description: 'Cómo usar IA para optimizar procesos de recursos humanos',
        category: catMap['whitepapers']?._id,
        type: 'article' as const,
        content: '# IA Aplicada a Recursos Humanos\n\n## Casos de Uso\n\n### 1. Análisis de CVs\n\nProcesar PDFs → Markdown → JSON estructurado. Costo estimado: $0.04/candidato.\n\n### 2. Matching de Vacantes\n\nMotor de reglas (80%) + IA para explicación (20%). Score compuesto por:\n- Hard Skills: 40%\n- Experiencia: 30%\n- Soft Skills: 20%\n- Cultura: 10%\n\n### 3. Generación de Preguntas\n\nIA genera preguntas de entrevista específicas basadas en gaps detectados en el CV.\n\n## ROI Estimado\n\n- Reducción 60% tiempo de screening\n- Mejora 40% calidad de contratación',
        tags: ['ia', 'rrhh', 'reclutamiento', 'whitepaper'],
        published: true,
        featured: false,
      },
      {
        title: 'Borrador: Política de Trabajo Híbrido 2027',
        slug: 'borrador-politica-trabajo-hibrido-2027',
        description: 'En revisión — nueva política de modalidad híbrida',
        category: politicas?._id,
        type: 'article' as const,
        content: '# Política de Trabajo Híbrido 2027 (BORRADOR)\n\n## Propuesta\n\n- 3 días presenciales / 2 días remotos\n- Core hours: 9am-12pm (reuniones)\n- Flexibilidad total en horario restante\n\n## Requisitos\n\n- Internet estable (min 50 Mbps)\n- Espacio dedicado de trabajo\n- Cámara activa en reuniones\n\n**Estado: En revisión por Dirección**',
        tags: ['híbrido', 'remoto', 'política', 'borrador'],
        published: false,
        featured: false,
      },
    ];

    let created = 0;
    for (const doc of documents) {
      const existing = await LibraryDocument.findOne({ slug: doc.slug }).setOptions({ includeDeleted: true });
      if (existing) { console.log(`   ⏭️  "${doc.title}"`); continue; }

      const newDoc = new LibraryDocument({
        ...doc,
        author: admin._id,
        version: 1,
        visibility: 'all',
        viewCount: Math.floor(Math.random() * 80),
        publishedAt: doc.published ? new Date() : undefined,
      });
      await newDoc.save();

      if (doc.content) {
        const version = new LibraryDocumentVersion({ document: newDoc._id, version: 1, content: doc.content, editedBy: admin._id, changeNote: 'Versión inicial' });
        await version.save();
      }

      await LibraryCategory.findByIdAndUpdate(doc.category, { $inc: { documentsCount: 1 } });
      created++;
      console.log(`   📄 "${doc.title}" (${doc.type})`);
    }

    console.log(`\n📊 ${created} documentos creados + ${Object.keys(catMap).length} categorías`);
    console.log('✅ Seed completado\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedExtraDocs();
