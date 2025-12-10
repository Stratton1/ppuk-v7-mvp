import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local from frontend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("❌ Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

console.log("🚀 Creating test users...");
console.log(`📡 Connecting to: ${url}`);

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'apikey': serviceRole,
      'Authorization': `Bearer ${serviceRole}`
    }
  }
});

async function ensureUser(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error && !error.message.includes("already exists")) {
    console.error(`❌ Failed creating ${email}:`, error.message);
    return null;
  }

  if (data?.user) {
    console.log(`✔ ${email} created`);
    return data.user.id;
  }

  const existing = await supabase.auth.admin.listUsers();
  const found = existing.data.users.find(u => u.email === email);
  if (found) {
    console.log(`↪ ${email} already exists`);
    return found.id;
  }

  console.error(`❌ Could not find or create ${email}`);
  return null;
}

async function main() {
  try {
    const users = {};

    users.owner = await ensureUser("owner@test.local", "Test123!");
    users.buyer = await ensureUser("buyer@test.local", "Test123!");
    users.tenant = await ensureUser("tenant@test.local", "Test123!");

    users.agent = await ensureUser("agent@test.local", "Test123!");
    users.conveyancer = await ensureUser("conveyancer@test.local", "Test123!");
    users.surveyor = await ensureUser("surveyor@test.local", "Test123!");

    users.admin = await ensureUser("admin@test.local", "Admin123!");

    console.log("\n📄 User IDs:");
    console.log(users);

    console.log("\n✨ Done.");
  } catch (e) {
    console.error("❌ Script failed:", e);
  }
}

main();
