import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { generateVerificationCode, signVerificationCode } from "../lib/document-verification"

const prisma = new PrismaClient()

// Environment guard for demo credentials
const isDevelopment = process.env.NODE_ENV === "development" || process.env.SEED_DEMO_DATA === "true"

if (!isDevelopment) {
  console.warn("⚠️  Seeding with demo credentials is disabled in production. Set SEED_DEMO_DATA=true to override.")
}

async function main() {
  // Create barangay
  let barangay = await prisma.barangay.findFirst({ where: { name: "Barangay San Jose" } })
  if (!barangay) {
    barangay = await prisma.barangay.create({
      data: {
        name: "Barangay San Jose",
        city: "Quezon City",
        province: "Metro Manila",
        region: "NCR",
        address: "123 Main Street, Quezon City",
        contactNumber: "02-1234-5678",
      },
    })
  }

  // Create demo users only in development
  let admin: { id: string } | undefined
  
  if (isDevelopment) {
    // Create admin user
    const adminPasswordHash = await bcrypt.hash("admin123", 10)
    admin = await prisma.user.upsert({
      where: { email: "admin@barangay.gov.ph" },
      update: {
        name: "Administrator",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        barangayId: barangay.id,
      },
      create: {
        name: "Administrator",
        email: "admin@barangay.gov.ph",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        barangayId: barangay.id,
      },
    })

    // Create secretary user
    const secretaryPasswordHash = await bcrypt.hash("secretary123", 10)
    await prisma.user.upsert({
      where: { email: "secretary@barangay.gov.ph" },
      update: {
        name: "Maria Santos",
        passwordHash: secretaryPasswordHash,
        role: "SECRETARY",
        barangayId: barangay.id,
      },
      create: {
        name: "Maria Santos",
        email: "secretary@barangay.gov.ph",
        passwordHash: secretaryPasswordHash,
        role: "SECRETARY",
        barangayId: barangay.id,
      },
    })
  }

  // Create residents
  const residentData = [
    { firstName: "Juan", middleName: "Dela", lastName: "Cruz", gender: "MALE" as const, civilStatus: "MARRIED" as const, address: "123 Rizal St", purok: "Purok 1", occupation: "Farmer", isVoter: true, birthDate: new Date("1980-05-15") },
    { firstName: "Maria", middleName: "Santos", lastName: "Reyes", gender: "FEMALE" as const, civilStatus: "SINGLE" as const, address: "456 Bonifacio Ave", purok: "Purok 2", occupation: "Teacher", isVoter: true, birthDate: new Date("1992-08-22") },
    { firstName: "Pedro", middleName: "Garcia", lastName: "Mendoza", gender: "MALE" as const, civilStatus: "WIDOWED" as const, address: "789 Mabini Blvd", purok: "Purok 1", occupation: "Carpenter", isVoter: true, isSeniorCitizen: true, birthDate: new Date("1955-03-10") },
    { firstName: "Ana", middleName: "Lopez", lastName: "Torres", gender: "FEMALE" as const, civilStatus: "MARRIED" as const, address: "321 Luna St", purok: "Purok 3", occupation: "Nurse", isVoter: false, birthDate: new Date("1988-11-30") },
    { firstName: "Roberto", middleName: "Ramos", lastName: "Villanueva", gender: "MALE" as const, civilStatus: "SINGLE" as const, address: "654 Aguinaldo Rd", purok: "Purok 2", occupation: "Engineer", isVoter: true, birthDate: new Date("1995-07-04") },
    { firstName: "Lucia", middleName: "Fernandez", lastName: "Garcia", gender: "FEMALE" as const, civilStatus: "MARRIED" as const, address: "987 Quezon Ave", purok: "Purok 4", occupation: "Housewife", isVoter: true, birthDate: new Date("1975-01-18") },
    { firstName: "Carlos", middleName: "Aquino", lastName: "Bautista", gender: "MALE" as const, civilStatus: "SINGLE" as const, address: "147 Magsaysay St", purok: "Purok 3", occupation: "Driver", isVoter: false, birthDate: new Date("2000-09-25") },
    { firstName: "Sofia", middleName: "Cruz", lastName: "Navarro", gender: "FEMALE" as const, civilStatus: "SINGLE" as const, address: "258 Marcos Blvd", purok: "Purok 5", occupation: "Student", isVoter: false, birthDate: new Date("2003-12-08") },
    { firstName: "Miguel", middleName: "Flores", lastName: "Castillo", gender: "MALE" as const, civilStatus: "MARRIED" as const, address: "369 Osmeña Ave", purok: "Purok 4", occupation: "Businessman", isVoter: true, birthDate: new Date("1970-04-20") },
    { firstName: "Elena", middleName: "Vega", lastName: "Morales", gender: "FEMALE" as const, civilStatus: "DIVORCED" as const, address: "741 Roxas St", purok: "Purok 5", occupation: "Accountant", isVoter: true, birthDate: new Date("1983-06-14") },
  ]

  const residents = []
  for (const data of residentData) {
    const existingResident = await prisma.resident.findFirst({
      where: {
        barangayId: barangay.id,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
      },
    })

    const resident = existingResident
      ? await prisma.resident.update({
          where: { id: existingResident.id },
          data: { ...data, barangayId: barangay.id },
        })
      : await prisma.resident.create({
          data: { ...data, barangayId: barangay.id },
        })

    residents.push(resident)
  }

  // Create resident user linked to resident profile (only in dev)
  if (isDevelopment) {
    const residentPasswordHash = await bcrypt.hash("resident123", 10)
    await prisma.user.upsert({
      where: { email: "resident@barangay.gov.ph" },
      update: {
        passwordHash: residentPasswordHash,
        residentId: residents[1].id,
        barangayId: barangay.id,
        role: "RESIDENT",
      },
      create: {
        name: "Maria Resident",
        email: "resident@barangay.gov.ph",
        passwordHash: residentPasswordHash,
        role: "RESIDENT",
        barangayId: barangay.id,
        residentId: residents[1].id,
      },
    })
  }

  // Create barangay captain official
  const existingCaptain = await prisma.official.findFirst({
    where: {
      barangayId: barangay.id,
      residentId: residents[0].id,
      position: "BARANGAY_CAPTAIN",
    },
  })

  if (existingCaptain) {
    await prisma.official.update({
      where: { id: existingCaptain.id },
      data: {
        termStart: new Date("2023-01-01"),
        termEnd: new Date("2026-12-31"),
      },
    })
  } else {
    await prisma.official.create({
      data: {
        barangayId: barangay.id,
        residentId: residents[0].id,
        position: "BARANGAY_CAPTAIN",
        termStart: new Date("2023-01-01"),
        termEnd: new Date("2026-12-31"),
      },
    })
  }

  // Create households
  const households = []
  const householdData = [
    { houseNumber: "001", address: "123 Rizal St", purok: "Purok 1" },
    { houseNumber: "002", address: "456 Bonifacio Ave", purok: "Purok 2" },
    { houseNumber: "003", address: "789 Mabini Blvd", purok: "Purok 1" },
    { houseNumber: "004", address: "321 Luna St", purok: "Purok 3" },
    { houseNumber: "005", address: "654 Aguinaldo Rd", purok: "Purok 2" },
  ]

  for (let i = 0; i < householdData.length; i++) {
    const existingHousehold = await prisma.household.findFirst({
      where: {
        barangayId: barangay.id,
        houseNumber: householdData[i].houseNumber,
        address: householdData[i].address,
      },
    })

    const household = existingHousehold
      ? await prisma.household.update({
          where: { id: existingHousehold.id },
          data: {
            ...householdData[i],
            barangayId: barangay.id,
            householdHeadId: residents[i * 2].id,
          },
        })
      : await prisma.household.create({
          data: {
            ...householdData[i],
            barangayId: barangay.id,
            householdHeadId: residents[i * 2].id,
          },
        })

    households.push(household)

    // Upsert household members using composite unique constraint
    await prisma.householdMember.upsert({
      where: {
        householdId_residentId: {
          householdId: household.id,
          residentId: residents[i * 2].id,
        },
      },
      update: {
        relationship: "Head",
        isHead: true,
      },
      create: {
        householdId: household.id,
        residentId: residents[i * 2].id,
        relationship: "Head",
        isHead: true,
      },
    })
    
    if (residents[i * 2 + 1]) {
      await prisma.householdMember.upsert({
        where: {
          householdId_residentId: {
            householdId: household.id,
            residentId: residents[i * 2 + 1].id,
          },
        },
        update: {
          relationship: "Spouse",
          isHead: false,
        },
        create: {
          householdId: household.id,
          residentId: residents[i * 2 + 1].id,
          relationship: "Spouse",
          isHead: false,
        },
      })
    }
  }

  // Create clearance requests
  const clearanceData = [
    {
      barangayId: barangay.id,
      residentId: residents[0].id,
      type: "BARANGAY_CLEARANCE" as const,
      purpose: "Employment",
      status: "APPROVED" as const,
      documentNumber: "CLR-2024-AA1B2C",
      verificationCode: signVerificationCode(generateVerificationCode()),
      approvedAt: new Date("2024-01-15"),
      expiresAt: new Date("2025-01-15"),
      approvedBy: admin?.id,
    },
    {
      barangayId: barangay.id,
      residentId: residents[1].id,
      type: "RESIDENCY_CERTIFICATE" as const,
      purpose: "School enrollment",
      status: "PENDING" as const,
      documentNumber: "CLR-2024-DD3E4F",
    },
    {
      barangayId: barangay.id,
      residentId: residents[2].id,
      type: "INDIGENCY_CERTIFICATE" as const,
      purpose: "Medical assistance",
      status: "APPROVED" as const,
      documentNumber: "CLR-2024-GG5H6I",
      verificationCode: signVerificationCode(generateVerificationCode()),
      approvedAt: new Date("2024-02-10"),
      expiresAt: new Date("2025-02-10"),
      approvedBy: admin?.id,
    },
  ]

  for (const data of clearanceData) {
    const existing = await prisma.clearanceRequest.findUnique({
      where: {
        barangayId_documentNumber: {
          barangayId: data.barangayId,
          documentNumber: data.documentNumber,
        },
      },
    })
    
    await prisma.clearanceRequest.upsert({
      where: {
        barangayId_documentNumber: {
          barangayId: data.barangayId,
          documentNumber: data.documentNumber,
        },
      },
      update: {
        residentId: data.residentId,
        type: data.type,
        purpose: data.purpose,
        status: data.status,
        // Preserve existing verification code if present, otherwise use new one
        verificationCode: existing?.verificationCode || data.verificationCode,
        approvedAt: data.approvedAt,
        expiresAt: data.expiresAt,
        approvedBy: data.approvedBy,
      },
      create: data,
    })
  }

  // Create blotter cases
  const blotterData = [
    {
      barangayId: barangay.id,
      caseNumber: "BLT-2024-0001",
      complainantId: residents[0].id,
      complainantName: "Juan Dela Cruz",
      respondentName: "Maria Santos Reyes",
      incident: "Physical Assault",
      incidentDate: new Date("2024-01-20"),
      location: "123 Rizal St",
      description: "Complainant reported being physically assaulted by respondent during a neighborhood dispute.",
      status: "MEDIATION" as const,
      mediationSchedule: new Date("2024-02-01"),
    },
    {
      barangayId: barangay.id,
      caseNumber: "BLT-2024-0002",
      complainantId: residents[2].id,
      complainantName: "Pedro Garcia Mendoza",
      respondentName: "Ana Lopez Torres",
      incident: "Property Dispute",
      incidentDate: new Date("2024-02-05"),
      location: "789 Mabini Blvd",
      description: "Dispute over property boundary between adjacent lots.",
      status: "OPEN" as const,
    },
  ]

  for (const data of blotterData) {
    await prisma.blotter.upsert({
      where: {
        barangayId_caseNumber: {
          barangayId: data.barangayId,
          caseNumber: data.caseNumber,
        },
      },
      update: {
        complainantId: data.complainantId,
        complainantName: data.complainantName,
        respondentName: data.respondentName,
        incident: data.incident,
        incidentDate: data.incidentDate,
        location: data.location,
        description: data.description,
        status: data.status,
        mediationSchedule: data.mediationSchedule,
      },
      create: data,
    })
  }

  // Create announcements
  const announcementData = [
    {
      barangayId: barangay.id,
      title: "Barangay Assembly Meeting",
      content: "All residents are invited to attend the quarterly barangay assembly meeting on March 15, 2024 at 2:00 PM at the Barangay Hall.",
      category: "MEETING" as const,
      isPublished: true,
      publishedAt: new Date("2024-02-28"),
      createdBy: admin?.id,
    },
    {
      barangayId: barangay.id,
      title: "Free Medical Mission",
      content: "The barangay health center will be conducting a free medical mission on March 20, 2024.",
      category: "HEALTH" as const,
      isPublished: true,
      publishedAt: new Date("2024-03-01"),
      createdBy: admin?.id,
    },
  ]

  for (const data of announcementData) {
    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        barangayId: data.barangayId,
        title: data.title,
      },
    })

    if (existingAnnouncement) {
      await prisma.announcement.update({
        where: { id: existingAnnouncement.id },
        data,
      })
    } else {
      await prisma.announcement.create({
        data,
      })
    }
  }

  // Create ordinance
  await prisma.ordinance.upsert({
    where: {
      barangayId_ordinanceNumber: {
        barangayId: barangay.id,
        ordinanceNumber: "ORD-2024-001",
      },
    },
    update: {
      title: "Ordinance on Noise Regulation",
      description: "An ordinance regulating noise levels within the barangay to maintain peace and order.",
      dateApproved: new Date("2024-01-10"),
    },
    create: {
      barangayId: barangay.id,
      title: "Ordinance on Noise Regulation",
      description: "An ordinance regulating noise levels within the barangay to maintain peace and order.",
      ordinanceNumber: "ORD-2024-001",
      dateApproved: new Date("2024-01-10"),
    },
  })

  // Create activity logs
  const activityLogData = [
    {
      barangayId: barangay.id,
      userId: admin?.id,
      action: "CREATE_RESIDENT",
      description: "Created resident record for Juan Dela Cruz",
      entityType: "Resident",
      entityId: residents[0].id,
    },
    {
      barangayId: barangay.id,
      userId: admin?.id,
      action: "APPROVE_CLEARANCE",
      description: "Approved barangay clearance CLR-2024-AA1B2C",
      entityType: "ClearanceRequest",
    },
    {
      barangayId: barangay.id,
      userId: admin?.id,
      action: "CREATE_BLOTTER",
      description: "Filed blotter case BLT-2024-0001",
      entityType: "Blotter",
    },
  ]

  for (const data of activityLogData) {
    const existingLog = await prisma.activityLog.findFirst({
      where: {
        barangayId: data.barangayId,
        userId: data.userId,
        action: data.action,
        description: data.description,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    })

    if (!existingLog) {
      await prisma.activityLog.create({ data })
    }
  }

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { barangayId: barangay.id },
    update: {
      clearanceFee: 50,
      residencyFee: 50,
    },
    create: {
      barangayId: barangay.id,
      clearanceFee: 50,
      residencyFee: 50,
    },
  })

  console.log("✅ Seed completed successfully!")
  if (isDevelopment) {
    console.log("Demo credentials (local development only):")
    console.log("  Admin: admin@barangay.gov.ph / admin123")
    console.log("  Secretary: secretary@barangay.gov.ph / secretary123")
    console.log("  Resident: resident@barangay.gov.ph / resident123")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

