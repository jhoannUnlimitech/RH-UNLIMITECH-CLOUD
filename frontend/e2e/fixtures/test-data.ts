/**
 * Test Data — Typed datasets for E2E tests.
 *
 * Contains interfaces and concrete datasets for each form/flow.
 * The test user (developer) is created via seed-test-user.ts.
 */

// ─── Login ──────────────────────────────────────────────────────────────────

export interface LoginData {
  /** Valid email address */
  email: string;
  /** Valid password */
  password: string;
}

export interface InvalidLoginData {
  /** Email that may or may not exist */
  email: string;
  /** Incorrect password */
  password: string;
  /** Expected error message substring */
  expectedError: string;
}

// ─── Datasets ───────────────────────────────────────────────────────────────

/**
 * E2E Test Developer — created by seed-test-user.ts
 * Role: AI DRIVEN DEVELOPER (Desarrollador)
 * Division: División 1 (Frontend)
 */
export const LOGIN_DEVELOPER: LoginData = {
  email: 'greatly-hide@emxeecta.mailosaur.net',
  password: 'Pass2014!',
};

/** Admin credentials — from backend seed */
export const LOGIN_ADMIN: LoginData = {
  email: 'admin@rh.com',
  password: 'admin123',
};

/** Invalid credentials — correct email, wrong password */
export const LOGIN_WRONG_PASSWORD: InvalidLoginData = {
  email: 'greatly-hide@emxeecta.mailosaur.net',
  password: 'WrongPassword123!',
  expectedError: 'Credenciales inválidas',
};

/** Invalid credentials — non-existent user */
export const LOGIN_NONEXISTENT_USER: InvalidLoginData = {
  email: 'noexiste@emxeecta.mailosaur.net',
  password: 'Pass2014!',
  expectedError: 'Credenciales inválidas',
};

/** Empty fields — for validation edge case */
export const LOGIN_EMPTY: LoginData = {
  email: '',
  password: '',
};


// ─── CSW (Solicitudes) ──────────────────────────────────────────────────────

export interface CSWFormData {
  /** Category name to select from dropdown */
  category: string;
  /** "¿Qué sucede?" field content */
  situation: string;
  /** "¿Qué datos tienes?" field content */
  information: string;
  /** "¿Cómo se resuelve?" field content */
  solution: string;
}

export interface ApprovalData {
  /** Comments for approve/reject action */
  comments: string;
}

export interface CSWCategoryData {
  /** Name for the new category */
  name: string;
  /** Description of the category */
  description: string;
}

// ─── CSW Datasets ───────────────────────────────────────────────────────────

/** Solicitud de Permiso — will go through 3-level approval (Moises → Manuel → Laura) */
export const CSW_PERMISO: CSWFormData = {
  category: 'Permiso',
  situation: 'Necesito un día libre para atender una cita médica programada con el especialista cardiólogo que tengo agendada desde hace dos meses.',
  information: 'La cita es el próximo viernes 18 de julio a las 10:00 AM en la Clínica del Norte. El horario de atención es de 9:00 AM a 12:00 PM por lo que necesitaré la mañana completa.',
  solution: 'Mi compañero Jorge Jimenez cubrirá mis tareas pendientes ese día. Ya he dejado documentación actualizada del sprint actual y los tickets asignados están al día.',
};

/** Solicitud de Orden de Estudio — 1-level approval (Oscar only) */
export const CSW_ORDEN_ESTUDIO: CSWFormData = {
  category: 'Orden de Estudio',
  situation: 'Solicito cambio de horario para asistir a clases de la maestría en Ingeniería de Software que inicio el próximo mes.',
  information: 'Las clases son los martes y jueves de 6:00 PM a 9:00 PM en la Universidad Nacional. El programa tiene una duración de 2 años.',
  solution: 'Propongo adelantar mi horario de entrada a las 7:00 AM para compensar la salida a las 5:00 PM en los días de clase. Mis entregables diarios quedarán listos antes de las 5 PM.',
};

/** Approval comment for Moises (level 1) */
export const APPROVAL_MOISES: ApprovalData = {
  comments: 'Aprobado. El compañero tiene buen desempeño y la cobertura está bien planificada.',
};

/** Rejection comment for Manuel (level 2) */
export const REJECTION_MANUEL: ApprovalData = {
  comments: 'Rechazado: Necesito más detalle sobre cómo se cubrirá el turno de soporte crítico que tiene asignado ese día.',
};

/** Approval comment for Manuel (level 2, second round) */
export const APPROVAL_MANUEL: ApprovalData = {
  comments: 'Aprobado en segunda revisión. La cobertura del soporte crítico está resuelta.',
};

/** Approval comment for Laura (level 3) */
export const APPROVAL_LAURA: ApprovalData = {
  comments: 'Aprobado por Talento Humano. Registrado en el sistema.',
};

/** Approval comment for Oscar (Orden de Estudio) */
export const APPROVAL_OSCAR: ApprovalData = {
  comments: 'Aprobado. El cambio de horario es viable y no afecta la operación.',
};

/** New category to be created by Moises */
export const CSW_NEW_CATEGORY: CSWCategoryData = {
  name: 'Solicitud de Certificado Laboral',
  description: 'Solicitud de certificado laboral para trámites personales o legales',
};

// ─── Approver Credentials ───────────────────────────────────────────────────

/** Moises — Level 1 approver (Technical Architect Manager, Div 4) */
export const LOGIN_MOISES: LoginData = {
  email: 'moises@unlimitech.cloud',
  password: 'Pass2014!',
};

/** Manuel (admin) — Level 2 approver (Founder & Solutions Architect) */
export const LOGIN_MANUEL: LoginData = {
  email: 'admin@unlimitech.cloud',
  password: 'Pass2014!',
};

/** Laura — Level 3 approver (Human Talent Manager) */
export const LOGIN_LAURA: LoginData = {
  email: 'talent@unlimitech.cloud',
  password: 'Pass2014!',
};

/** Oscar — Direct approver for "Orden de Estudio" (Quality & Training Officer) */
export const LOGIN_OSCAR: LoginData = {
  email: 'training@unlimitech.cloud',
  password: 'Pass2014!',
};


// ─── Employees ──────────────────────────────────────────────────────────────

export interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nationalId: string;
  nationality: string;
  birthDate: string;
  hat: string;
  division: string;
  forcePasswordChange: boolean;
}

/** Employee to create during e2e test */
export const EMPLOYEE_CREATE: EmployeeFormData = {
  name: 'QA Test Employee',
  email: `qa-employee-${Date.now().toString().slice(-8)}@emxeecta.mailosaur.net`,
  password: 'TestPass2024!',
  phone: '+573109876543',
  nationalId: `${Date.now().toString().slice(-10)}`,
  nationality: 'Colombia',
  birthDate: '1990-05-15',
  hat: 'DEVELOPER',
  division: 'Infraestructura',
  forcePasswordChange: true,
};


// ─── Library (Training Phase 1) ─────────────────────────────────────────────

export interface LibraryCategoryData {
  name: string;
  description?: string;
  icon?: string;
  parent?: string; // parent name (for selecting in modal)
}

export interface LibraryDocumentData {
  title: string;
  description?: string;
  type: 'article' | 'link' | 'file' | 'mixed';
  content?: string;
  externalLink?: string;
  tags?: string[];
  featured?: boolean;
  category?: string; // category name (for selecting in form)
}

/** Category to create during E2E — unique prefix avoids collisions */
export const LIB_CATEGORY: LibraryCategoryData = {
  name: 'E2E Cat Automated',
  description: 'Categoría creada por tests E2E automatizados',
};

/** Sub-category (child of LIB_CATEGORY) */
export const LIB_SUBCATEGORY: LibraryCategoryData = {
  name: 'E2E SubCat Child',
  description: 'Sub-categoría hija para tests',
  parent: 'E2E Cat Automated',
};

/** Article document */
export const LIB_DOC_ARTICLE: LibraryDocumentData = {
  title: 'E2E Artículo Prueba',
  description: 'Documento de artículo creado por test automatizado',
  type: 'article',
  content: '# Documento E2E\n\nContenido de **prueba** con _formato_ markdown.\n\n## Sección 2\n\n- Item 1\n- Item 2\n- Item 3\n\n```javascript\nconsole.log("hello");\n```',
  tags: ['e2e', 'test', 'automation'],
  featured: true,
};

/** Link document */
export const LIB_DOC_LINK: LibraryDocumentData = {
  title: 'E2E Link Externo',
  description: 'Documento tipo link para validación E2E',
  type: 'link',
  externalLink: 'https://playwright.dev/docs/intro',
  tags: ['e2e', 'link'],
};

/** Mixed document (content + link) */
export const LIB_DOC_MIXED: LibraryDocumentData = {
  title: 'E2E Mixto Completo',
  description: 'Documento mixto con contenido y link',
  type: 'mixed',
  content: '# Recurso Mixto\n\nEste documento tiene contenido y un enlace externo.',
  externalLink: 'https://example.com/resource',
  tags: ['e2e', 'mixed'],
};

/** Draft document (not published) */
export const LIB_DOC_DRAFT: LibraryDocumentData = {
  title: 'E2E Borrador Draft',
  description: 'Este documento no se publica',
  type: 'article',
  content: '# Borrador\n\nEsto no debería verse en /library.',
  tags: ['draft', 'e2e'],
};

// ─── Training API CRUD Data ─────────────────────────────────────────────────

export interface TrainingCourseData {
  name: string;
  description: string;
  categoryId?: string;
}

export interface TrainingLevelData {
  name: string;
  description: string;
  order: number;
}

export interface TrainingBadgeData {
  name: string;
  description: string;
  icon: string;
  shape?: string;
  color?: string;
}

export const TRAINING_COURSE: TrainingCourseData = {
  name: 'E2E Curso TypeScript Avanzado',
  description: 'Curso de prueba creado por test automatizado',
};

export const TRAINING_LEVEL: TrainingLevelData = {
  name: 'E2E Nivel Básico',
  description: 'Nivel básico de prueba',
  order: 1,
};

export const TRAINING_BADGE: TrainingBadgeData = {
  name: 'E2E Badge Completado',
  description: 'Insignia de prueba E2E automatizada',
  icon: 'trophy',
  shape: 'hexagon',
  color: '#F59E0B',
};
