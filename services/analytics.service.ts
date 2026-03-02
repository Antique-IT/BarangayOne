import { prisma } from "@/lib/prisma"

export const analyticsService = {
  async getSummary(barangayId?: string) {
    const where = { barangayId: barangayId ?? undefined }

    const [
      totalResidents,
      totalHouseholds,
      totalClearances,
      pendingClearances,
      approvedClearances,
      rejectedClearances,
      expiredClearances,
      totalBlotters,
      activeBlotters,
      settledBlotters,
      maleResidents,
      femaleResidents,
      voterCount,
      openCount,
      mediationCount,
      referredCount,
      closedCount,
    ] = await Promise.all([
      prisma.resident.count({ where: { ...where, isArchived: false } }),
      prisma.household.count({ where }),
      prisma.clearanceRequest.count({ where }),
      prisma.clearanceRequest.count({ where: { ...where, status: "PENDING" } }),
      prisma.clearanceRequest.count({ where: { ...where, status: "APPROVED" } }),
      prisma.clearanceRequest.count({ where: { ...where, status: "REJECTED" } }),
      prisma.clearanceRequest.count({ where: { ...where, status: "EXPIRED" } }),
      prisma.blotter.count({ where }),
      prisma.blotter.count({ where: { ...where, status: { in: ["OPEN", "MEDIATION"] } } }),
      prisma.blotter.count({ where: { ...where, status: "SETTLED" } }),
      prisma.resident.count({ where: { ...where, gender: "MALE", isArchived: false } }),
      prisma.resident.count({ where: { ...where, gender: "FEMALE", isArchived: false } }),
      prisma.resident.count({ where: { ...where, isVoter: true, isArchived: false } }),
      prisma.blotter.count({ where: { ...where, status: "OPEN" } }),
      prisma.blotter.count({ where: { ...where, status: "MEDIATION" } }),
      prisma.blotter.count({ where: { ...where, status: "REFERRED" } }),
      prisma.blotter.count({ where: { ...where, status: "CLOSED" } }),
    ])

    // Monthly clearances for the past 6 months
    const monthlyClearances: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const count = await prisma.clearanceRequest.count({
        where: { ...where, createdAt: { gte: start, lte: end } },
      })
      monthlyClearances.push({
        month: start.toLocaleString("default", { month: "short" }),
        count,
      })
    }

    return {
      stats: {
        totalResidents,
        totalHouseholds,
        totalClearances,
        pendingClearances,
        approvedClearances,
        rejectedClearances,
        expiredClearances,
        totalBlotters,
        activeBlotters,
        settledBlotters,
        voterCount,
      },
      genderDistribution: [
        { name: "Male", value: maleResidents },
        { name: "Female", value: femaleResidents },
      ],
      monthlyClearances,
      blotterStatus: [
        { name: "Open", value: openCount },
        { name: "Mediation", value: mediationCount },
        { name: "Settled", value: settledBlotters },
        { name: "Referred", value: referredCount },
        { name: "Closed", value: closedCount },
      ],
    }
  },
}
