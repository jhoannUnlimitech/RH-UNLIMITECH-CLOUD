/**
 * Script de captura de pantallas del aplicativo RH Unlimitech Cloud
 * Usa Playwright para navegar todas las secciones y capturar screenshots
 * 
 * Uso: node scripts/capture-screenshots.cjs
 */
const { chromium } = require('playwright');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = join(__dirname, '../screenshots');
const CREDENTIALS = { email: 'admin@unlimitech.cloud', password: 'Pass2014!' };

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🚀 Iniciando captura de pantallas...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Login
  console.log('🔐 Iniciando sesión...');
  await page.goto(`${BASE_URL}/signin`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
  await page.waitForTimeout(2000);

  const pages_to_capture = [
    { name: '01-dashboard', path: '/', wait: 3000 },
    { name: '02-empleados-lista', path: '/employees', wait: 2000 },
    { name: '03-divisiones', path: '/divisions', wait: 2000 },
    { name: '04-hats', path: '/roles', wait: 2000 },
    { name: '05-proyectos', path: '/projects', wait: 2000 },
    { name: '06-calendario', path: '/calendar', wait: 3000 },
    { name: '07-eventos-lista', path: '/calendar/events', wait: 2000 },
    { name: '08-csw-mis-solicitudes', path: '/csw/my-requests', wait: 2000 },
    { name: '09-csw-pendientes', path: '/csw/pending', wait: 2000 },
    { name: '10-csw-todas', path: '/csw/all', wait: 2000 },
    { name: '11-csw-categorias', path: '/csw-categories', wait: 2000 },
    { name: '12-csw-nueva-solicitud', path: '/csw/new', wait: 2000 },
  ];

  for (const pg of pages_to_capture) {
    console.log(`📸 Capturando ${pg.name}...`);
    await page.goto(`${BASE_URL}${pg.path}`);
    await page.waitForTimeout(pg.wait);
    await page.screenshot({ path: join(OUTPUT_DIR, `${pg.name}.png`), fullPage: true });
  }

  // Dark mode
  console.log('🌙 Cambiando a modo oscuro...');
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(500);

  const dark_pages = [
    { name: '13-dashboard-dark', path: '/', wait: 3000 },
    { name: '14-csw-solicitudes-dark', path: '/csw/my-requests', wait: 2000 },
    { name: '15-calendario-dark', path: '/calendar', wait: 3000 },
  ];

  for (const pg of dark_pages) {
    console.log(`📸 Capturando ${pg.name}...`);
    await page.goto(`${BASE_URL}${pg.path}`);
    await page.evaluate(() => { document.documentElement.classList.add('dark'); });
    await page.waitForTimeout(pg.wait);
    await page.screenshot({ path: join(OUTPUT_DIR, `${pg.name}.png`), fullPage: true });
  }

  // CSW Detail
  console.log('📸 Capturando detalle CSW...');
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.goto(`${BASE_URL}/csw/view/6a3cc0a1560c9f15a269a60e`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUTPUT_DIR, '16-csw-detalle.png'), fullPage: true });

  console.log('✅ Capturas completadas!');
  console.log(`📁 Guardadas en: ${OUTPUT_DIR}`);
  await browser.close();
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
