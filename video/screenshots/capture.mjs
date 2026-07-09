/**
 * Script Playwright para capturar screenshots del aplicativo RH Unlimitech Cloud
 * Uso: node video/screenshots/capture.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = __dirname;
const CREDENTIALS = { email: 'admin@unlimitech.cloud', password: 'Pass2014!' };

async function capture() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // 1. Login
  console.log('📸 Iniciando login...');
  await page.goto(`${BASE_URL}/signin`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await page.waitForTimeout(2000);

  // 2. Dashboard
  console.log('📸 Dashboard...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-dashboard.png'), fullPage: false });

  // 3. Empleados
  console.log('📸 Empleados...');
  await page.goto(`${BASE_URL}/employees`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02-employees.png'), fullPage: false });

  // 4. Divisiones
  console.log('📸 Divisiones...');
  await page.goto(`${BASE_URL}/divisions`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-divisions.png'), fullPage: false });

  // 5. Hats
  console.log('📸 Hats...');
  await page.goto(`${BASE_URL}/roles`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04-hats.png'), fullPage: false });

  // 6. Proyectos
  console.log('📸 Proyectos...');
  await page.goto(`${BASE_URL}/projects`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05-projects.png'), fullPage: false });

  // 7. CSW - Mis Solicitudes
  console.log('📸 CSW Mis Solicitudes...');
  await page.goto(`${BASE_URL}/csw/my-requests`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06-csw-list.png'), fullPage: false });

  // 8. CSW - Nueva solicitud
  console.log('📸 CSW Nueva Solicitud...');
  await page.goto(`${BASE_URL}/csw/new`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07-csw-new.png'), fullPage: false });

  // 9. CSW - Categorías
  console.log('📸 CSW Categorías...');
  await page.goto(`${BASE_URL}/csw-categories`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08-csw-categories.png'), fullPage: false });

  // 10. Calendario
  console.log('📸 Calendario...');
  await page.goto(`${BASE_URL}/calendar`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09-calendar.png'), fullPage: false });

  // 11. CSW - Pendientes de aprobación
  console.log('📸 CSW Pendientes...');
  await page.goto(`${BASE_URL}/csw/pending`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10-csw-pending.png'), fullPage: false });

  // 12. CSW - Ver detalle
  console.log('📸 CSW Detalle...');
  await page.goto(`${BASE_URL}/csw/view/6a3cc0a1560c9f15a269a60e`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '11-csw-detail.png'), fullPage: true });

  // 13. Dark mode
  console.log('📸 Dashboard Dark Mode...');
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '12-dashboard-dark.png'), fullPage: false });

  // 14. Sidebar
  console.log('📸 Sidebar...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '13-sidebar.png'), clip: { x: 0, y: 0, width: 300, height: 1080 } });

  await browser.close();
  console.log('\n✅ Capturas completadas en:', OUTPUT_DIR);
}

capture().catch(console.error);
