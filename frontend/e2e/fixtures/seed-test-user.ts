/**
 * Seed Test User — Creates a developer user for E2E testing.
 *
 * This script registers a test user via the backend API.
 * It first logs in as admin to get auth, finds the developer role ID,
 * then creates the test user.
 *
 * Run with: npx tsx e2e/fixtures/seed-test-user.ts
 *
 * Pre-requisites:
 * - Backend running on port 9050
 * - Database seeded (npm run seed in backend)
 */

const API_URL = process.env.API_URL || 'http://localhost:9050/api/v1';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

async function seedTestUser(): Promise<void> {
  console.log('🌱 Seeding E2E test user...\n');

  // 1. Login as admin to get auth cookie
  console.log('🔐 Logging in as admin...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@unlimitech.cloud', password: 'Pass2014!' }),
  });

  if (!loginRes.ok) {
    throw new Error(`Admin login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const loginData = await loginRes.json() as ApiResponse;
  const token = loginData.data?.token;
  const cookies = loginRes.headers.get('set-cookie') || '';

  // Extract token from cookie or use the response token
  const authHeader = token
    ? { 'Authorization': `Bearer ${token}` }
    : { 'Cookie': cookies };

  console.log('✅ Admin logged in\n');

  // 2. Get the developer role ID
  console.log('🔍 Finding developer role...');
  const rolesRes = await fetch(`${API_URL}/roles`, {
    headers: { ...authHeader, 'Content-Type': 'application/json' } as any,
  });

  if (!rolesRes.ok) {
    throw new Error(`Roles fetch failed: ${rolesRes.status} ${await rolesRes.text()}`);
  }

  const rolesData = await rolesRes.json() as ApiResponse;
  const roles = rolesData.data?.roles || rolesData.data || [];
  const devRole = roles.find((r: any) => r.name === 'DEVELOPER' || r.name === 'AI DRIVEN DEVELOPER');

  if (!devRole) {
    console.log('Available roles:', roles.map((r: any) => r.name));
    throw new Error('Developer role not found. Available roles listed above.');
  }
  console.log(`✅ Developer role found: ${devRole._id}\n`);

  // 3. Get a division ID (Frontend division)
  console.log('🔍 Finding division...');
  const divisionsRes = await fetch(`${API_URL}/divisions`, {
    headers: { ...authHeader, 'Content-Type': 'application/json' } as any,
  });

  if (!divisionsRes.ok) {
    throw new Error(`Divisions fetch failed: ${divisionsRes.status} ${await divisionsRes.text()}`);
  }

  const divisionsData = await divisionsRes.json() as ApiResponse;
  const divisions = divisionsData.data?.divisions || divisionsData.data || [];
  const frontendDiv = divisions.find((d: any) => d.code === 'DIV01') || divisions[0];

  if (!frontendDiv) {
    throw new Error('No divisions found. Run backend seed first.');
  }
  console.log(`✅ Division found: ${frontendDiv.name} (${frontendDiv._id})\n`);

  // 4. Check if user already exists (try login)
  console.log('🔍 Checking if test user already exists...');
  const checkRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'greatly-hide@emxeecta.mailosaur.net',
      password: 'Pass2014!',
    }),
  });

  if (checkRes.ok) {
    console.log('✅ Test user already exists! Skipping creation.\n');
    printCredentials();
    return;
  }

  // 5. Register the test user
  console.log('📝 Registering test user...');
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Test Developer',
      email: 'greatly-hide@emxeecta.mailosaur.net',
      password: 'Pass2014!',
      role: devRole._id,
      division: frontendDiv._id,
      birthDate: '1995-08-22',
      nationalId: '9999888877',
      phone: '+573001234567',
      nationality: 'Colombia',
    }),
  });

  if (!registerRes.ok) {
    const errorText = await registerRes.text();
    // If user already exists (409), that's fine
    if (registerRes.status === 409) {
      console.log('✅ Test user already exists (409). Skipping.\n');
      printCredentials();
      return;
    }
    throw new Error(`Registration failed: ${registerRes.status} ${errorText}`);
  }

  console.log('✅ Test user created successfully!\n');
  printCredentials();
}

function printCredentials(): void {
  console.log('🔐 ============= E2E TEST CREDENTIALS =============');
  console.log('📧 Email:    greatly-hide@emxeecta.mailosaur.net');
  console.log('🔑 Password: Pass2014!');
  console.log('👔 Role:     AI DRIVEN DEVELOPER (Desarrollador)');
  console.log('🏢 Division: División 1 (Frontend)');
  console.log('===================================================\n');
}

seedTestUser()
  .then(() => {
    console.log('✅ Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  });
