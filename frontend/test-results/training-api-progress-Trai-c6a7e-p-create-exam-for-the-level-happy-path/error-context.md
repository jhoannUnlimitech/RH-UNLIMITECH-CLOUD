# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path/training-api-progress.spec.ts >> Training API — Progress + Exams (AC-44 to AC-66) >> setup: create exam for the level
- Location: e2e/specs/happy-path/training-api-progress.spec.ts:163:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Unlimitech Cloud" [ref=e6] [cursor=pointer]:
      - /url: /
      - img "Unlimitech Cloud" [ref=e8]
    - navigation [ref=e10]:
      - generic [ref=e12]:
        - heading "Menú" [level=2] [ref=e13]
        - list [ref=e14]:
          - listitem [ref=e15]:
            - link "Dashboard" [ref=e16] [cursor=pointer]:
              - /url: /
              - img [ref=e18]
              - generic [ref=e20]: Dashboard
          - listitem [ref=e21]:
            - button "Empleados" [ref=e22] [cursor=pointer]:
              - img [ref=e24]
              - generic [ref=e26]: Empleados
              - img [ref=e27]
            - list [ref=e29]:
              - listitem [ref=e30]:
                - link "Lista de Empleados" [ref=e31] [cursor=pointer]:
                  - /url: /employees
              - listitem [ref=e32]:
                - link "Divisiones" [ref=e33] [cursor=pointer]:
                  - /url: /divisions
              - listitem [ref=e34]:
                - link "Hats" [ref=e35] [cursor=pointer]:
                  - /url: /roles
          - listitem [ref=e36]:
            - link "Proyectos" [ref=e37] [cursor=pointer]:
              - /url: /projects
              - img [ref=e39]
              - generic [ref=e41]: Proyectos
          - listitem [ref=e42]:
            - button "CSW" [ref=e43] [cursor=pointer]:
              - img [ref=e45]
              - generic [ref=e47]: CSW
              - img [ref=e48]
            - list [ref=e50]:
              - listitem [ref=e51]:
                - link "Categorías" [ref=e52] [cursor=pointer]:
                  - /url: /csw-categories
              - listitem [ref=e53]:
                - link "Mis Solicitudes" [ref=e54] [cursor=pointer]:
                  - /url: /csw/my-requests
              - listitem [ref=e55]:
                - link "Pendientes de Aprobación" [ref=e56] [cursor=pointer]:
                  - /url: /csw/pending
              - listitem [ref=e57]:
                - link "Todas las Solicitudes" [ref=e58] [cursor=pointer]:
                  - /url: /csw/all
          - listitem [ref=e59]:
            - link "Calendario" [ref=e60] [cursor=pointer]:
              - /url: /calendar
              - img [ref=e62]
              - generic [ref=e64]: Calendario
          - listitem [ref=e65]:
            - button "Training" [ref=e66] [cursor=pointer]:
              - img [ref=e68]
              - generic [ref=e70]: Training
              - img [ref=e71]
            - list [ref=e73]:
              - listitem [ref=e74]:
                - link "Biblioteca" [ref=e75] [cursor=pointer]:
                  - /url: /library
              - listitem [ref=e76]:
                - link "Mi Progreso" [ref=e77] [cursor=pointer]:
                  - /url: /training/my-progress
              - listitem [ref=e78]:
                - link "Reportar Estudio" [ref=e79] [cursor=pointer]:
                  - /url: /training/report
              - listitem [ref=e80]:
                - link "Tabla de Honor" [ref=e81] [cursor=pointer]:
                  - /url: /training/honor-table
              - listitem [ref=e82]:
                - link "Mis Certificados" [ref=e83] [cursor=pointer]:
                  - /url: /training/certificates
              - listitem [ref=e84]:
                - link "Gestión Contenido" [ref=e85] [cursor=pointer]:
                  - /url: /training/manage
              - listitem [ref=e86]:
                - link "Gestión Biblioteca" [ref=e87] [cursor=pointer]:
                  - /url: /library/manage
              - listitem [ref=e88]:
                - link "Pase de Lista" [ref=e89] [cursor=pointer]:
                  - /url: /training/admin/attendance
              - listitem [ref=e90]:
                - link "Dashboard" [ref=e91] [cursor=pointer]:
                  - /url: /training/admin/dashboard
          - listitem [ref=e92]:
            - link "Configuración" [ref=e93] [cursor=pointer]:
              - /url: /settings
              - img [ref=e95]
              - generic [ref=e98]: Configuración
  - generic [ref=e99]:
    - banner [ref=e100]:
      - generic [ref=e101]:
        - generic [ref=e102]:
          - button "Toggle Sidebar" [ref=e103] [cursor=pointer]:
            - img [ref=e104]
          - generic [ref=e108]:
            - generic:
              - img
            - textbox "Buscar o escribe un comando..." [ref=e109]
            - button "⌘ K" [ref=e110] [cursor=pointer]:
              - generic [ref=e111]: ⌘
              - generic [ref=e112]: K
        - generic [ref=e113]:
          - generic [ref=e114]:
            - button [ref=e115] [cursor=pointer]:
              - img [ref=e116]
            - button "1" [ref=e119] [cursor=pointer]:
              - generic [ref=e120]: "1"
              - img [ref=e121]
          - button "M Manuel Lara" [ref=e124] [cursor=pointer]:
            - generic [ref=e126]: M
            - generic [ref=e127]: Manuel Lara
            - img [ref=e128]
    - generic [ref=e131]:
      - generic [ref=e132]:
        - heading "Hola, Manuel 👋" [level=1] [ref=e133]
        - paragraph [ref=e134]: FOUNDER & SOLUTIONS ARCHITECT • División 7 — Ejecutiva
      - generic [ref=e135]:
        - generic [ref=e136]:
          - generic [ref=e137]:
            - paragraph [ref=e138]: Total Empleados
            - img [ref=e140]
          - generic [ref=e142]:
            - heading "17" [level=4] [ref=e144]
            - generic [ref=e145]:
              - generic [ref=e147]: 10 activos
              - generic [ref=e148]: 0 inactivos
        - generic [ref=e149]:
          - generic [ref=e150]:
            - paragraph [ref=e151]: Empleados Activos
            - img [ref=e153]
          - generic [ref=e155]:
            - heading "10" [level=4] [ref=e157]
            - generic [ref=e158]:
              - generic [ref=e160]: 58.8%
              - generic [ref=e161]: del total
        - generic [ref=e162]:
          - generic [ref=e163]:
            - paragraph [ref=e164]: Divisiones
            - img [ref=e166]
          - generic [ref=e168]:
            - heading "11" [level=4] [ref=e170]
            - generic [ref=e171]:
              - generic [ref=e173]: 2 prom
              - generic [ref=e174]: empleados por división
        - generic [ref=e175]:
          - generic [ref=e176]:
            - paragraph [ref=e177]: Empleados Inactivos
            - img [ref=e179]
          - generic [ref=e181]:
            - heading "0" [level=4] [ref=e183]
            - generic [ref=e184]:
              - generic [ref=e186]: 0.0%
              - generic [ref=e187]: del total
      - generic [ref=e188]:
        - generic [ref=e189]:
          - generic [ref=e190]:
            - paragraph [ref=e191]: Total Solicitudes
            - img [ref=e193]
          - heading "0" [level=4] [ref=e195]
        - generic [ref=e196]:
          - generic [ref=e197]:
            - paragraph [ref=e198]: En Trámite
            - img [ref=e200]
          - heading "0" [level=4] [ref=e202]
        - generic [ref=e203]:
          - generic [ref=e204]:
            - paragraph [ref=e205]: Aprobadas
            - img [ref=e207]
          - heading "0" [level=4] [ref=e209]
        - generic [ref=e210]:
          - generic [ref=e211]:
            - paragraph [ref=e212]: Rechazadas
            - img [ref=e214]
          - heading "0" [level=4] [ref=e216]
        - link "Por Firmar 0" [ref=e217] [cursor=pointer]:
          - /url: /csw/pending
          - generic [ref=e218]:
            - paragraph [ref=e219]: Por Firmar
            - img [ref=e221]
          - heading "0" [level=4] [ref=e223]
      - generic [ref=e224]:
        - generic [ref=e225]:
          - generic [ref=e226]:
            - generic [ref=e227]:
              - heading "Divisiones Principales" [level=4] [ref=e228]
              - link "Ver todas" [ref=e229] [cursor=pointer]:
                - /url: /divisions
                - text: Ver todas
                - img [ref=e230]
            - generic [ref=e232]:
              - link "División 1 — Talento Humano Contrata, forma personal y mantiene comunicaciones y ética 1 1 activos" [ref=e233] [cursor=pointer]:
                - /url: /divisions
                - generic [ref=e234]:
                  - heading "División 1 — Talento Humano" [level=5] [ref=e235]
                  - paragraph [ref=e236]: Contrata, forma personal y mantiene comunicaciones y ética
                - generic [ref=e237]:
                  - generic [ref=e238]:
                    - paragraph [ref=e239]: "1"
                    - paragraph [ref=e240]: 1 activos
                  - img [ref=e241]
              - link "División 2 — Diseminación Marketing, publicaciones y ventas 0 0 activos" [ref=e243] [cursor=pointer]:
                - /url: /divisions
                - generic [ref=e244]:
                  - heading "División 2 — Diseminación" [level=5] [ref=e245]
                  - paragraph [ref=e246]: Marketing, publicaciones y ventas
                - generic [ref=e247]:
                  - generic [ref=e248]:
                    - paragraph [ref=e249]: "0"
                    - paragraph [ref=e250]: 0 activos
                  - img [ref=e251]
              - link "División 3 — Finanzas Ingreso, pagos, activos y materiales 0 0 activos" [ref=e253] [cursor=pointer]:
                - /url: /divisions
                - generic [ref=e254]:
                  - heading "División 3 — Finanzas" [level=5] [ref=e255]
                  - paragraph [ref=e256]: Ingreso, pagos, activos y materiales
                - generic [ref=e257]:
                  - generic [ref=e258]:
                    - paragraph [ref=e259]: "0"
                    - paragraph [ref=e260]: 0 activos
                  - img [ref=e261]
              - link "División 4 — Infraestructura Planeación, Cloud Services y Desarrollo de Software 7 7 activos" [ref=e263] [cursor=pointer]:
                - /url: /divisions
                - generic [ref=e264]:
                  - heading "División 4 — Infraestructura" [level=5] [ref=e265]
                  - paragraph [ref=e266]: Planeación, Cloud Services y Desarrollo de Software
                - generic [ref=e267]:
                  - generic [ref=e268]:
                    - paragraph [ref=e269]: "7"
                    - paragraph [ref=e270]: 7 activos
                  - img [ref=e271]
              - link "División 5 — Calidad Exámenes, revisión, certificaciones y premios 1 1 activos" [ref=e273] [cursor=pointer]:
                - /url: /divisions
                - generic [ref=e274]:
                  - heading "División 5 — Calidad" [level=5] [ref=e275]
                  - paragraph [ref=e276]: Exámenes, revisión, certificaciones y premios
                - generic [ref=e277]:
                  - generic [ref=e278]:
                    - paragraph [ref=e279]: "1"
                    - paragraph [ref=e280]: 1 activos
                  - img [ref=e281]
          - generic [ref=e283]:
            - generic [ref=e284]:
              - heading "Empleados Recientes" [level=4] [ref=e285]
              - link "Ver todos" [ref=e286] [cursor=pointer]:
                - /url: /employees
                - text: Ver todos
                - img [ref=e287]
            - generic [ref=e289]:
              - generic [ref=e290]:
                - generic [ref=e293]: L
                - generic [ref=e294]:
                  - generic [ref=e295]:
                    - heading "Lifecycle 809125" [level=5] [ref=e296]
                    - generic [ref=e297]: Activo
                  - generic [ref=e298]:
                    - generic [ref=e299]:
                      - img [ref=e300]
                      - text: DEVELOPER
                    - generic [ref=e302]:
                      - img [ref=e303]
                      - text: División 4 — Infraestructura
                - paragraph [ref=e306]: Colombia
              - generic [ref=e307]:
                - generic [ref=e310]: L
                - generic [ref=e311]:
                  - generic [ref=e312]:
                    - heading "Login Test 990482" [level=5] [ref=e313]
                    - generic [ref=e314]: Activo
                  - generic [ref=e315]:
                    - generic [ref=e316]:
                      - img [ref=e317]
                      - text: DEVELOPER
                    - generic [ref=e319]:
                      - img [ref=e320]
                      - text: División 4 — Infraestructura
                - paragraph [ref=e323]: Colombia
              - generic [ref=e324]:
                - generic [ref=e327]: Q
                - generic [ref=e328]:
                  - generic [ref=e329]:
                    - heading "QA Test Employee" [level=5] [ref=e330]
                    - generic [ref=e331]: Activo
                  - generic [ref=e332]:
                    - generic [ref=e333]:
                      - img [ref=e334]
                      - text: DEVELOPER
                    - generic [ref=e336]:
                      - img [ref=e337]
                      - text: División 4 — Infraestructura
                - paragraph [ref=e340]: Colombia
              - generic [ref=e341]:
                - generic [ref=e344]: L
                - generic [ref=e345]:
                  - generic [ref=e346]:
                    - heading "Login Test 926580" [level=5] [ref=e347]
                    - generic [ref=e348]: Activo
                  - generic [ref=e349]:
                    - generic [ref=e350]:
                      - img [ref=e351]
                      - text: DEVELOPER
                    - generic [ref=e353]:
                      - img [ref=e354]
                      - text: División 4 — Infraestructura
                - paragraph [ref=e357]: Colombia
              - generic [ref=e358]:
                - generic [ref=e361]: Q
                - generic [ref=e362]:
                  - generic [ref=e363]:
                    - heading "QA Test Employee" [level=5] [ref=e364]
                    - generic [ref=e365]: Activo
                  - generic [ref=e366]:
                    - generic [ref=e367]:
                      - img [ref=e368]
                      - text: DEVELOPER
                    - generic [ref=e370]:
                      - img [ref=e371]
                      - text: División 4 — Infraestructura
                - paragraph [ref=e374]: Colombia
        - generic [ref=e375]:
          - generic [ref=e376]:
            - heading "Estado de Empleados" [level=4] [ref=e377]
            - generic [ref=e378]:
              - generic [ref=e380]:
                - generic [ref=e383]: Activos
                - generic [ref=e384]:
                  - text: "10"
                  - generic [ref=e385]: (58.8%)
              - generic [ref=e389]:
                - generic [ref=e392]: Inactivos
                - generic [ref=e393]:
                  - text: "0"
                  - generic [ref=e394]: (0.0%)
              - generic [ref=e397]:
                - generic [ref=e398]: Total de Empleados
                - generic [ref=e399]: "17"
          - generic [ref=e400]:
            - heading "Accesos Rápidos" [level=4] [ref=e401]
            - generic [ref=e402]:
              - link "Mis Solicitudes" [ref=e403] [cursor=pointer]:
                - /url: /csw/my-requests
                - img [ref=e405]
                - generic [ref=e407]: Mis Solicitudes
              - link "Pendientes de Aprobación" [ref=e408] [cursor=pointer]:
                - /url: /csw/pending
                - img [ref=e410]
                - generic [ref=e412]: Pendientes de Aprobación
              - link "Directorio de Empleados" [ref=e413] [cursor=pointer]:
                - /url: /employees
                - img [ref=e415]
                - generic [ref=e417]: Directorio de Empleados
              - link "Gestionar Hats" [ref=e418] [cursor=pointer]:
                - /url: /roles
                - img [ref=e420]
                - generic [ref=e422]: Gestionar Hats
```

# Test source

```ts
  100 |     }
  101 |   });
  102 | 
  103 |   e2e('setup: create test badge', async () => {
  104 |     const page = getPage();
  105 |     const res = await apiExec(page, 'POST', '/training/badges', {
  106 |       name: 'E2E Progress Badge',
  107 |       description: 'Badge for testing progress flow',
  108 |       icon: 'BookOpen',
  109 |       shape: 'circle',
  110 |       color: '#3b82f6',
  111 |     });
  112 |     if (!res.success) {
  113 |       // If it already exists, try to find it
  114 |       const list = await apiExec(page, 'GET', '/training/badges');
  115 |       const existing = list?.data?.find((b: any) => b.name === 'E2E Progress Badge');
  116 |       if (existing) {
  117 |         testBadgeId = existing._id;
  118 |         return;
  119 |       }
  120 |     }
  121 |     expect(res.success).toBe(true);
  122 |     testBadgeId = res.data._id;
  123 |   });
  124 | 
  125 |   e2e('setup: create test level', async () => {
  126 |     const page = getPage();
  127 |     const res = await apiExec(page, 'POST', '/training/levels', {
  128 |       name: 'E2E Level 1',
  129 |       description: 'Test level for progress',
  130 |       badge: testBadgeId,
  131 |       order: 1,
  132 |     });
  133 |     expect(res.success).toBe(true);
  134 |     testLevelId = res.data._id;
  135 |   });
  136 | 
  137 |   e2e('setup: create course 1', async () => {
  138 |     const page = getPage();
  139 |     const res = await apiExec(page, 'POST', '/training/courses', {
  140 |       name: 'E2E Course A',
  141 |       description: 'First test course',
  142 |       level: testLevelId,
  143 |       estimatedHours: 2,
  144 |       order: 1,
  145 |     });
  146 |     expect(res.success).toBe(true);
  147 |     testCourse1Id = res.data._id;
  148 |   });
  149 | 
  150 |   e2e('setup: create course 2', async () => {
  151 |     const page = getPage();
  152 |     const res = await apiExec(page, 'POST', '/training/courses', {
  153 |       name: 'E2E Course B',
  154 |       description: 'Second test course',
  155 |       level: testLevelId,
  156 |       estimatedHours: 1.5,
  157 |       order: 2,
  158 |     });
  159 |     expect(res.success).toBe(true);
  160 |     testCourse2Id = res.data._id;
  161 |   });
  162 | 
  163 |   e2e('setup: create exam for the level', async () => {
  164 |     const page = getPage();
  165 |     const res = await apiExec(page, 'POST', '/training/exams', {
  166 |       title: 'E2E Exam Level 1',
  167 |       description: 'Exam for testing',
  168 |       level: testLevelId,
  169 |       passingScore: 80,
  170 |       maxAttempts: 3,
  171 |       timeLimit: 30,
  172 |       questions: [
  173 |         {
  174 |           type: 'multiple_choice',
  175 |           text: 'What is 2+2?',
  176 |           options: [
  177 |             { text: '3', isCorrect: false },
  178 |             { text: '4', isCorrect: true },
  179 |             { text: '5', isCorrect: false },
  180 |           ],
  181 |           points: 50,
  182 |           order: 1,
  183 |         },
  184 |         {
  185 |           type: 'multiple_choice',
  186 |           text: 'What is the capital of Colombia?',
  187 |           options: [
  188 |             { text: 'Medellín', isCorrect: false },
  189 |             { text: 'Bogotá', isCorrect: true },
  190 |             { text: 'Cali', isCorrect: false },
  191 |           ],
  192 |           points: 50,
  193 |           order: 2,
  194 |         },
  195 |       ],
  196 |     });
  197 |     if (!res.success) {
  198 |       console.log('Exam creation failed:', res.message, 'levelId:', testLevelId);
  199 |     }
> 200 |     expect(res.success).toBe(true);
      |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  201 |     testExamId = res.data._id;
  202 |   });
  203 | 
  204 |   e2e('setup: associate exam to level', async () => {
  205 |     const page = getPage();
  206 |     const res = await apiExec(page, 'PUT', `/training/levels/${testLevelId}`, {
  207 |       exam: testExamId,
  208 |     });
  209 |     expect(res.success).toBe(true);
  210 |   });
  211 | 
  212 |   e2e('setup: initialize progress for admin employee', async () => {
  213 |     const page = getPage();
  214 |     // Try to init (may already exist)
  215 |     const res = await apiExec(page, 'POST', '/training/progress/initialize', {
  216 |       employeeId: testEmployeeId,
  217 |     });
  218 |     // Either success or already exists
  219 |     expect(res.success === true || res.message?.includes('ya') || res.status === 'error').toBeTruthy();
  220 |   });
  221 | 
  222 |   // ─── Course Completion Flow (AC-59 to AC-66) ────────────────────────────────
  223 | 
  224 |   e2e('AC-59: complete course 1 via API', async () => {
  225 |     const page = getPage();
  226 |     const res = await apiExec(page, 'POST', `/training/progress/complete-course/${testCourse1Id}`, {
  227 |       hoursSpent: 2,
  228 |     });
  229 |     expect(res.success).toBe(true);
  230 |     expect(res.data.levelStatus).toBe('in_progress'); // Not all courses done yet
  231 |   });
  232 | 
  233 |   e2e('AC-60: cannot complete course from different level', async () => {
  234 |     const page = getPage();
  235 |     // Try to complete a non-existent course
  236 |     const res = await apiExec(page, 'POST', '/training/progress/complete-course/000000000000000000000000', {
  237 |       hoursSpent: 1,
  238 |     });
  239 |     expect(res.success).toBe(false);
  240 |   });
  241 | 
  242 |   e2e('AC-61: cannot complete same course twice', async () => {
  243 |     const page = getPage();
  244 |     const res = await apiExec(page, 'POST', `/training/progress/complete-course/${testCourse1Id}`, {
  245 |       hoursSpent: 1,
  246 |     });
  247 |     expect(res.success).toBe(false);
  248 |     expect(res.message).toContain('ya está completado');
  249 |   });
  250 | 
  251 |   e2e('AC-63: complete course 2 → level becomes exam_pending', async () => {
  252 |     const page = getPage();
  253 |     const res = await apiExec(page, 'POST', `/training/progress/complete-course/${testCourse2Id}`, {
  254 |       hoursSpent: 1.5,
  255 |     });
  256 |     expect(res.success).toBe(true);
  257 |     // Level has exam, so it should go to exam_pending
  258 |     expect(res.data.examUnlocked).toBe(true);
  259 |     expect(res.data.levelStatus).toBe('exam_pending');
  260 |   });
  261 | 
  262 |   // ─── Exam Attempts (AC-44 to AC-52) ────────────────────────────────────────
  263 | 
  264 |   e2e('AC-44: start exam attempt', async () => {
  265 |     const page = getPage();
  266 |     const res = await apiExec(page, 'POST', `/training/exam-attempts/${testExamId}/start`, {});
  267 |     expect(res.success).toBe(true);
  268 |     testAttemptId = res.data._id;
  269 |     expect(res.data.status).toBe('in_progress');
  270 |   });
  271 | 
  272 |   e2e('AC-45: cannot start another attempt while one is in progress', async () => {
  273 |     const page = getPage();
  274 |     const res = await apiExec(page, 'POST', `/training/exam-attempts/${testExamId}/start`, {});
  275 |     // Should fail because there's already an in_progress attempt
  276 |     expect(res.success).toBe(false);
  277 |   });
  278 | 
  279 |   e2e('AC-47: cache answers', async () => {
  280 |     const page = getPage();
  281 |     const res = await apiExec(page, 'PUT', `/training/exam-attempts/${testAttemptId}/cache`, {
  282 |       answers: [
  283 |         { questionIndex: 0, selectedOption: 1 }, // "4" (correct)
  284 |       ],
  285 |     });
  286 |     expect(res.success).toBe(true);
  287 |   });
  288 | 
  289 |   e2e('AC-48: submit exam with all correct answers → passed', async () => {
  290 |     const page = getPage();
  291 |     const res = await apiExec(page, 'PUT', `/training/exam-attempts/${testAttemptId}/submit`, {
  292 |       answers: [
  293 |         { questionIndex: 0, selectedOption: 1 }, // "4" (correct, 50pts)
  294 |         { questionIndex: 1, selectedOption: 1 }, // "Bogotá" (correct, 50pts)
  295 |       ],
  296 |     });
  297 |     expect(res.success).toBe(true);
  298 |     expect(res.data.status).toBe('passed');
  299 |     expect(res.data.score).toBeGreaterThanOrEqual(80);
  300 |   });
```