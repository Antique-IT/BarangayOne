import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import {
  buildVerificationQrDataUrl,
  generateVerificationCode,
  signVerificationCode,
} from "../lib/document-verification"

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.clearanceRequest.findMany({
    where: {
      status: { in: ["APPROVED", "RELEASED"] },
      verificationCode: null,
    },
  })

  for (const row of rows) {
    const verificationCode = signVerificationCode(generateVerificationCode())
    const qrCode = await buildVerificationQrDataUrl(verificationCode)

    await prisma.clearanceRequest.update({
      where: { id: row.id },
      data: { verificationCode, qrCode },
    })
  }

  console.log(`Backfilled clearances: ${rows.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
