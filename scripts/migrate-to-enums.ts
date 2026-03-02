/**
 * Migration script to help transition existing SQLite data to the new enum schema.
 * Run this before applying schema changes if you have existing production data.
 * 
 * Usage: npx ts-node scripts/migrate-to-enums.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Starting enum migration...")

  // Map old string values to new enum values
  const statusMappings = {
    clearance: {
      UNDER_REVIEW: "PENDING",
      PAYMENT_PENDING: "PENDING",
      RELEASED: "APPROVED",
    },
    blotter: {
      RESOLVED: "SETTLED",
      ESCALATED: "REFERRED",
    },
  }

  const civilStatusMapping = {
    ANNULLED: "DIVORCED", // Map ANNULLED to closest equivalent
  }

  let updatedCount = 0

  // Update clearance statuses
  console.log("\n📋 Migrating clearance request statuses...")
  for (const [oldStatus, newStatus] of Object.entries(statusMappings.clearance)) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE ClearanceRequest SET status = ? WHERE status = ?`,
      newStatus,
      oldStatus
    )
    if (result > 0) {
      console.log(`  ✓ Updated ${result} clearance(s): ${oldStatus} → ${newStatus}`)
      updatedCount += result
    }
  }

  // Update blotter statuses
  console.log("\n⚖️  Migrating blotter case statuses...")
  for (const [oldStatus, newStatus] of Object.entries(statusMappings.blotter)) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE Blotter SET status = ? WHERE status = ?`,
      newStatus,
      oldStatus
    )
    if (result > 0) {
      console.log(`  ✓ Updated ${result} blotter case(s): ${oldStatus} → ${newStatus}`)
      updatedCount += result
    }
  }

  // Update resident civil status
  console.log("\n👥 Migrating resident civil statuses...")
  for (const [oldStatus, newStatus] of Object.entries(civilStatusMapping)) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE Resident SET civilStatus = ? WHERE civilStatus = ?`,
      newStatus,
      oldStatus
    )
    if (result > 0) {
      console.log(`  ✓ Updated ${result} resident(s): ${oldStatus} → ${newStatus}`)
      updatedCount += result
    }
  }

  // Update User roles (remove invalid roles like BARANGAY_CAPTAIN, TREASURER if they exist as user roles)
  console.log("\n🔐 Migrating user roles...")
  const invalidRoleMapping = {
    BARANGAY_CAPTAIN: "ADMIN",
    TREASURER: "SECRETARY",
  }
  
  for (const [oldRole, newRole] of Object.entries(invalidRoleMapping)) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE User SET role = ? WHERE role = ?`,
      newRole,
      oldRole
    )
    if (result > 0) {
      console.log(`  ⚠️  Updated ${result} user(s): ${oldRole} → ${newRole}`)
      updatedCount += result
    }
  }

  console.log(`\n✅ Migration complete! Updated ${updatedCount} total records.`)
  console.log("\n📝 Next steps:")
  console.log("  1. Review the changes above")
  console.log("  2. Run: pnpm prisma db push")
  console.log("  3. Test your application thoroughly")
  console.log("  4. Consider running: pnpm db:seed (with development env)")
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
