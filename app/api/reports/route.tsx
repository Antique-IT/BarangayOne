import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import ExcelJS from "exceljs"
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"

const reportStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 8 },
  subtitle: { fontSize: 11, marginBottom: 12 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingVertical: 4 },
  headerRow: { backgroundColor: "#EEF2FF", fontWeight: 700 },
  col: { flex: 1, paddingRight: 6 },
})

function ReportDocument({
  title,
  subtitle,
  headers,
  rows,
}: {
  title: string
  subtitle: string
  headers: string[]
  rows: string[][]
}) {
  return (
    <Document>
      <Page size="A4" style={reportStyles.page}>
        <Text style={reportStyles.title}>{title}</Text>
        <Text style={reportStyles.subtitle}>{subtitle}</Text>
        <View style={[reportStyles.tableRow, reportStyles.headerRow]}>
          {headers.map((header) => (
            <Text key={header} style={reportStyles.col}>{header}</Text>
          ))}
        </View>
        {rows.map((row, index) => (
          <View key={`${row[0] ?? "row"}-${index}`} style={reportStyles.tableRow}>
            {row.map((value, columnIndex) => (
              <Text key={`${index}-${columnIndex}`} style={reportStyles.col}>{value}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const type = searchParams.get("type")?.toUpperCase()
  const format = searchParams.get("format")?.toLowerCase() || "pdf"
  const barangayId = requireBarangay(user)

  if (!type) return NextResponse.json({ error: "Report type is required" }, { status: 400 })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "BarangayOS"
  workbook.created = new Date()

  let pdfHeaders: string[] = []
  let pdfRows: string[][] = []
  let pdfTitle = "Barangay Report"

  let sheetName = "Report"
  let filename = "report"

  if (type === "RESIDENTS") {
    sheetName = "Residents"
    filename = "residents-report"
    pdfTitle = "Resident Population Report"
    const residents = await prisma.resident.findMany({
      where: { barangayId: barangayId ?? undefined, isArchived: false },
      orderBy: { lastName: "asc" },
    })
    const sheet = workbook.addWorksheet(sheetName)
    sheet.columns = [
      { header: "Last Name", key: "lastName", width: 20 },
      { header: "First Name", key: "firstName", width: 20 },
      { header: "Middle Name", key: "middleName", width: 20 },
      { header: "Gender", key: "gender", width: 12 },
      { header: "Birth Date", key: "birthDate", width: 15 },
      { header: "Civil Status", key: "civilStatus", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Purok", key: "purok", width: 12 },
      { header: "Contact", key: "phone", width: 18 },
      { header: "Occupation", key: "occupation", width: 20 },
      { header: "Voter", key: "isVoter", width: 10 },
    ]
    styleHeader(sheet)
    residents.forEach((r) => {
      sheet.addRow({
        ...r,
        birthDate: r.birthDate.toISOString().split("T")[0],
        isVoter: r.isVoter ? "Yes" : "No",
      })
    })
    pdfHeaders = ["Name", "Gender", "Birth Date", "Address", "Voter"]
    pdfRows = residents.map((r) => [
      `${r.lastName}, ${r.firstName}`,
      r.gender,
      r.birthDate.toISOString().split("T")[0],
      r.address,
      r.isVoter ? "Yes" : "No",
    ])
  } else if (type === "HOUSEHOLDS") {
    sheetName = "Households"
    filename = "households-report"
    pdfTitle = "Household Report"
    const households = await prisma.household.findMany({
      where: { barangayId: barangayId ?? undefined },
      include: { members: { include: { resident: true } } },
      orderBy: { createdAt: "desc" },
    })
    const sheet = workbook.addWorksheet(sheetName)
    sheet.columns = [
      { header: "House Number", key: "houseNumber", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Purok", key: "purok", width: 12 },
      { header: "Total Members", key: "members", width: 15 },
      { header: "Household Head", key: "head", width: 25 },
    ]
    styleHeader(sheet)
    households.forEach((h) => {
      const head = h.members.find((m) => m.isHead)
      sheet.addRow({
        houseNumber: h.houseNumber ?? "",
        address: h.address,
        purok: h.purok ?? "",
        members: h.members.length,
        head: head
          ? `${head.resident.firstName} ${head.resident.lastName}`
          : "N/A",
      })
    })
    pdfHeaders = ["House No.", "Address", "Purok", "Members", "Head"]
    pdfRows = households.map((h) => {
      const head = h.members.find((m) => m.isHead)
      return [
        h.houseNumber ?? "",
        h.address,
        h.purok ?? "",
        String(h.members.length),
        head ? `${head.resident.firstName} ${head.resident.lastName}` : "N/A",
      ]
    })
  } else if (type === "CLEARANCES") {
    sheetName = "Clearances"
    filename = "clearances-report"
    pdfTitle = "Clearance Issuance Report"
    const clearances = await prisma.clearanceRequest.findMany({
      where: { barangayId: barangayId ?? undefined },
      include: { resident: true },
      orderBy: { createdAt: "desc" },
    })
    const sheet = workbook.addWorksheet(sheetName)
    sheet.columns = [
      { header: "Control Number", key: "documentNumber", width: 20 },
      { header: "Resident", key: "resident", width: 25 },
      { header: "Type", key: "type", width: 25 },
      { header: "Purpose", key: "purpose", width: 30 },
      { header: "Status", key: "status", width: 12 },
      { header: "Date Requested", key: "createdAt", width: 18 },
      { header: "Date Issued", key: "approvedAt", width: 18 },
    ]
    styleHeader(sheet)
    clearances.forEach((c) => {
      sheet.addRow({
        documentNumber: c.documentNumber,
        resident: `${c.resident.firstName} ${c.resident.lastName}`,
        type: c.type,
        purpose: c.purpose ?? "",
        status: c.status,
        createdAt: c.createdAt.toISOString().split("T")[0],
        approvedAt: c.approvedAt ? c.approvedAt.toISOString().split("T")[0] : "",
      })
    })
    pdfHeaders = ["Control No.", "Resident", "Type", "Status", "Date Requested"]
    pdfRows = clearances.map((c) => [
      c.documentNumber,
      `${c.resident.firstName} ${c.resident.lastName}`,
      c.type,
      c.status,
      c.createdAt.toISOString().split("T")[0],
    ])
  } else if (type === "BLOTTER") {
    sheetName = "Blotter Cases"
    filename = "blotter-report"
    pdfTitle = "Blotter Case Summary"
    const cases = await prisma.blotter.findMany({
      where: { barangayId: barangayId ?? undefined },
      orderBy: { createdAt: "desc" },
    })
    const sheet = workbook.addWorksheet(sheetName)
    sheet.columns = [
      { header: "Case Number", key: "caseNumber", width: 18 },
      { header: "Complainant", key: "complainantName", width: 25 },
      { header: "Respondent", key: "respondentName", width: 25 },
      { header: "Incident", key: "incident", width: 25 },
      { header: "Incident Date", key: "incidentDate", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Date Filed", key: "createdAt", width: 15 },
    ]
    styleHeader(sheet)
    cases.forEach((c) => {
      sheet.addRow({
        ...c,
        incidentDate: c.incidentDate.toISOString().split("T")[0],
        createdAt: c.createdAt.toISOString().split("T")[0],
      })
    })
    pdfHeaders = ["Case No.", "Complainant", "Respondent", "Incident", "Status"]
    pdfRows = cases.map((c) => [
      c.caseNumber,
      c.complainantName,
      c.respondentName,
      c.incident,
      c.status,
    ])
  } else {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  }

  if (format === "pdf") {
    const reportPdf = await pdf(
      <ReportDocument
        title={pdfTitle}
        subtitle={`Generated on ${new Date().toLocaleDateString()}`}
        headers={pdfHeaders}
        rows={pdfRows}
      />,
    ).toBuffer()

    return new NextResponse(reportPdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  })
})

function styleHeader(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  }
  headerRow.alignment = { vertical: "middle", horizontal: "center" }
  headerRow.height = 20
}
