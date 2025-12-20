/**
 * Production database setup script
 * Run this once after deploying to production to create the initial admin user
 *
 * Usage:
 *   ADMIN_EMAIL=admin@foxclub.com ADMIN_PASSWORD=SecurePass123 npx tsx scripts/setup-production.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function setupProduction() {
  console.log("🦊 Setting up Fox Club production database...");
  console.log("");

  // Get environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@foxclub.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Admin Fox";

  // Validate required environment variables
  if (!adminPassword) {
    console.error("❌ Error: ADMIN_PASSWORD environment variable is required");
    console.error("");
    console.error("Usage:");
    console.error(
      '  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourSecurePassword npx tsx scripts/setup-production.ts'
    );
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error(
      "❌ Error: ADMIN_PASSWORD must be at least 8 characters long"
    );
    process.exit(1);
  }

  // Hash password
  console.log("🔒 Hashing password...");
  const hashedPassword = await hash(adminPassword, 12);

  // Create admin user
  console.log(`👤 Creating admin user: ${adminEmail}`);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
      approved: true,
      emailVerified: new Date(),
    },
  });

  console.log("");
  console.log("✅ Production setup complete!");
  console.log("");
  console.log("📝 Admin credentials:");
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("");
  console.log("⚠️  IMPORTANT:");
  console.log(
    "   1. Save these credentials in a secure password manager"
  );
  console.log(
    "   2. Delete this console output after saving the credentials"
  );
  console.log(
    "   3. Change the password immediately after first login"
  );
  console.log("");
}

setupProduction()
  .catch((e) => {
    console.error("❌ Setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
