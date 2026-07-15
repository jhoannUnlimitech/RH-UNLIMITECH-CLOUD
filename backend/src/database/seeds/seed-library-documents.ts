import mongoose from 'mongoose';
import { config } from '../../config/env';
import { LibraryCategory } from '../../models/training/LibraryCategory';
import { LibraryDocument } from '../../models/training/LibraryDocument';
import { LibraryDocumentVersion } from '../../models/training/LibraryDocumentVersion';
import { Employee } from '../../models/Employee';

/**
 * Seed: Documentos de ejemplo para la Biblioteca
 *
 * Crea sub-categorías y documentos de ejemplo para validar la UI.
 * Idempotente: no duplica si ya existen (busca por slug).
 *
 * Ejecutar: npx ts-node --transpile-only src/database/seeds/seed-library-documents.ts
 */

const SAMPLE_MARKDOWN = `# Introducción

Este es un documento de ejemplo con contenido en **Markdown**.

## Secciones

### 1. Listas

- Item uno
- Item dos
- Item tres

### 2. Código

\`\`\`typescript
function saludar(nombre: string): string {
  return \`Hola, \${nombre}!\`;
}
\`\`\`

### 3. Tabla

| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Valor A   | Valor B   | Valor C   |
| Dato 1    | Dato 2    | Dato 3    |

### 4. Links

Visita [Unlimitech Cloud](https://unlimitech.cloud) para más información.

> **Nota importante:** Este contenido es de ejemplo para validar el renderizado Markdown.
`;

const POLITICA_ETICA = `# Código de Ética — Unlimitech Cloud

## Principios Fundamentales

1. **Integridad:** Actuamos con honestidad y transparencia en todas nuestras interacciones.
2. **Respeto:** Valoramos la diversidad y tratamos a todos con dignidad.
3. **Responsabilidad:** Asumimos las consecuencias de nuestras acciones y decisiones.
4. **Confidencialidad:** Protegemos la información sensible de la empresa y clientes.

## Conductas Esperadas

- Cumplir con los horarios y compromisos adquiridos
- Reportar cualquier situación que afecte el ambiente laboral
- Usar los recursos de la empresa de manera responsable
- Mantener un trato profesional con compañeros y clientes

## Sanciones

El incumplimiento del código de ética puede resultar en:

1. Llamado de atención verbal
2. Memorando escrito
3. Suspensión temporal
4. Terminación del contrato

---

*Última actualización: Julio 2026*
`;

const GUIA_ONBOARDING = `# Guía de Onboarding — Nuevos Empleados

## Bienvenido a Unlimitech Cloud 🎉

### Semana 1: Inducción

- [ ] Configurar correo corporativo
- [ ] Acceso a herramientas (Slack, GitHub, Jira)
- [ ] Reunión con el equipo
- [ ] Leer el código de ética
- [ ] Configurar ambiente de desarrollo

### Semana 2: Capacitación Técnica

- [ ] Completar cursos de la plataforma de Training
- [ ] Revisar documentación del proyecto asignado
- [ ] Primer pair programming con mentor
- [ ] Primer commit en el repositorio

### Semana 3-4: Integración

- [ ] Asumir primera tarea del sprint
- [ ] Participar en daily standup
- [ ] Presentar avance al equipo
- [ ] Feedback con líder técnico

## Contactos Importantes

| Rol | Persona | Contacto |
|-----|---------|----------|
| CEO | Manuel | admin@unlimitech.cloud |
| Human Talent | Laura | talent@unlimitech.cloud |
| Training | Oscar | oscar@unlimitech.cloud |
`;

async function seedLibraryDocuments() {
  try {
    console.log('🌱 Seed: Documentos de ejemplo para la Biblioteca\n');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado a MongoDB\n');

    // Obtener admin como autor
    const admin = await Employee.findOne().sort({ createdAt: 1 });
    if (!admin) {
      console.error('   ❌ No se encontró ningún empleado.');
      process.exit(1);
    }

    // Obtener categorías base
    const cursosCategory = await LibraryCategory.findOne({ slug: 'cursos' });
    const politicasCategory = await LibraryCategory.findOne({ slug: 'politicas' });

    if (!cursosCategory || !politicasCategory) {
      console.error('   ❌ Ejecuta primero: seed-library-categories.ts');
      process.exit(1);
    }

    // Crear sub-categorías
    const subCategories = [
      { name: 'Nivel 1 — Fundamentos', slug: 'nivel-1-fundamentos', icon: '📗', color: '#10B981', parent: cursosCategory._id, order: 0, depth: 1 },
      { name: 'Nivel 2 — Intermedio', slug: 'nivel-2-intermedio', icon: '📙', color: '#F59E0B', parent: cursosCategory._id, order: 1, depth: 1 },
      { name: 'Código de Ética', slug: 'codigo-de-etica', icon: '⚖️', color: '#6366F1', parent: politicasCategory._id, order: 0, depth: 1 },
      { name: 'Guías de Onboarding', slug: 'guias-onboarding', icon: '🚀', color: '#EC4899', parent: politicasCategory._id, order: 1, depth: 1 },
    ];

    let createdCats = 0;
    const catMap: Record<string, any> = {};

    for (const cat of subCategories) {
      let existing = await LibraryCategory.findOne({ slug: cat.slug }).setOptions({ includeDeleted: true });
      if (!existing) {
        const newCat = new LibraryCategory({ ...cat, isSystem: false, active: true, documentsCount: 0, createdBy: admin._id });
        await newCat.save();
        existing = newCat;
        createdCats++;
        console.log(`   📁 Sub-categoría: "${cat.name}"`);
      }
      catMap[cat.slug] = existing;
    }

    // Crear documentos de ejemplo
    const documents = [
      {
        title: 'Introducción a TypeScript',
        slug: 'introduccion-typescript',
        description: 'Guía básica de TypeScript para nuevos desarrolladores',
        category: catMap['nivel-1-fundamentos']?._id || cursosCategory._id,
        type: 'article' as const,
        content: SAMPLE_MARKDOWN,
        tags: ['typescript', 'fundamentos', 'desarrollo'],
        published: true,
        featured: true,
      },
      {
        title: 'Código de Ética Empresarial',
        slug: 'codigo-etica-empresarial',
        description: 'Principios y conductas esperadas de todos los empleados',
        category: catMap['codigo-de-etica']?._id || politicasCategory._id,
        type: 'article' as const,
        content: POLITICA_ETICA,
        tags: ['ética', 'política', 'compliance'],
        published: true,
        featured: true,
      },
      {
        title: 'Guía de Onboarding',
        slug: 'guia-onboarding-nuevos',
        description: 'Checklist para las primeras 4 semanas del nuevo empleado',
        category: catMap['guias-onboarding']?._id || politicasCategory._id,
        type: 'article' as const,
        content: GUIA_ONBOARDING,
        tags: ['onboarding', 'nuevos', 'inducción'],
        published: true,
        featured: false,
      },
      {
        title: 'Curso React Avanzado — Udemy',
        slug: 'curso-react-avanzado-udemy',
        description: 'Enlace al curso de React avanzado en Udemy',
        category: catMap['nivel-2-intermedio']?._id || cursosCategory._id,
        type: 'link' as const,
        externalLink: 'https://www.udemy.com/course/react-advanced/',
        tags: ['react', 'frontend', 'avanzado'],
        published: true,
        featured: false,
      },
      {
        title: 'Manual de Seguridad de la Información',
        slug: 'manual-seguridad-informacion',
        description: 'Documento mixto con contenido y link a la política completa',
        category: politicasCategory._id,
        type: 'mixed' as const,
        content: '# Seguridad de la Información\n\nTodos los empleados deben seguir las prácticas de seguridad definidas.\n\n## Reglas básicas\n\n- No compartir contraseñas\n- Usar 2FA en todas las cuentas\n- Reportar intentos de phishing\n\nVer la política completa en el link adjunto.',
        externalLink: 'https://docs.google.com/document/d/security-policy',
        tags: ['seguridad', 'información', 'política'],
        published: true,
        featured: false,
      },
      {
        title: 'Borrador: Política de Trabajo Remoto',
        slug: 'borrador-politica-trabajo-remoto',
        description: 'En revisión — política de trabajo remoto y horarios flexibles',
        category: politicasCategory._id,
        type: 'article' as const,
        content: '# Política de Trabajo Remoto (BORRADOR)\n\nEste documento está en revisión y no ha sido publicado oficialmente.\n\n## Horarios\n\n- Horario core: 9am - 12pm (reuniones obligatorias)\n- Resto del día: flexible\n- Disponibilidad en Slack durante horario laboral',
        tags: ['remoto', 'horarios', 'política'],
        published: false, // BORRADOR
        featured: false,
      },
    ];

    let createdDocs = 0;
    for (const doc of documents) {
      const existing = await LibraryDocument.findOne({ slug: doc.slug }).setOptions({ includeDeleted: true });
      if (existing) {
        console.log(`   ⏭️  Doc ya existe: "${doc.title}"`);
        continue;
      }

      const newDoc = new LibraryDocument({
        ...doc,
        author: admin._id,
        version: 1,
        visibility: 'all',
        viewCount: Math.floor(Math.random() * 50),
        publishedAt: doc.published ? new Date() : undefined,
      });
      await newDoc.save();

      // Crear primera versión
      if (doc.content) {
        const version = new LibraryDocumentVersion({
          document: newDoc._id,
          version: 1,
          content: doc.content,
          editedBy: admin._id,
          changeNote: 'Versión inicial',
        });
        await version.save();
      }

      // Actualizar documentsCount en la categoría
      await LibraryCategory.findByIdAndUpdate(doc.category, { $inc: { documentsCount: 1 } });

      createdDocs++;
      console.log(`   📄 Doc creado: "${doc.title}" (${doc.type}, ${doc.published ? 'publicado' : 'borrador'})`);
    }

    console.log(`\n📊 Resultado: ${createdCats} sub-categorías + ${createdDocs} documentos creados`);
    console.log('✅ Seed de documentos completado\n');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedLibraryDocuments();
