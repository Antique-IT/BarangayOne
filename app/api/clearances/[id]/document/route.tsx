import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/rbac"
import { requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { withErrorHandler } from "@/lib/api-error"
import { buildVerificationQrDataUrl } from "@/lib/document-verification"
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 24, textAlign: "center" },
  title: { fontSize: 20, marginBottom: 8 },
  subtitle: { fontSize: 12, color: "#374151" },
  section: { marginBottom: 14 },
  label: { fontSize: 10, color: "#6B7280" },
  value: { fontSize: 12 },
  footer: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 12 },
  qr: { width: 120, height: 120, marginTop: 10 },
})

function ClearanceCertificate({
  residentName,
  documentNumber,
  verificationCode,
  issuedDate,
  expiryDate,
  purpose,
  qrCode,
}: {
  residentName: string
  documentNumber: string
  verificationCode: string
  issuedDate: string
  expiryDate: string
  purpose: string
  qrCode: string
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Barangay Clearance Certificate</Text>
          <Text style={styles.subtitle}>BarangayOS Official Document</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Resident</Text>
          <Text style={styles.value}>{residentName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Purpose</Text>
          <Text style={styles.value}>{purpose}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Control Number</Text>
          <Text style={styles.value}>{documentNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Verification Code</Text>
          <Text style={styles.value}>{verificationCode}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date Issued</Text>
          <Text style={styles.value}>{issuedDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Valid Until</Text>
          <Text style={styles.value}>{expiryDate}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.label}>Scan QR or visit /public/verify with the verification code.</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.qr} src={qrCode} />
        </View>
      </Page>
    </Document>
  )
}

export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  const barangayId = requireBarangay(user)

  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const clearance = await prisma.clearanceRequest.findUnique({
    where: { id },
  })

  if (!clearance) {
    return NextResponse.json({ error: "Clearance not found" }, { status: 404 })
  }

  const resident = await prisma.resident.findUnique({
    where: { id: clearance.residentId },
  })

  if (!resident) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  const isOwner = user.residentId && clearance.residentId === user.residentId
  const isAdmin = isAdminRole(user.role)
  const sameBarangay = clearance.barangayId === barangayId

  if (!sameBarangay || (!isOwner && !isAdmin)) {
    return NextResponse.json({ error: "Access denied: you are not allowed to download this document" }, { status: 403 })
  }

  if (clearance.status !== "APPROVED") {
    return NextResponse.json({ error: "Document not available" }, { status: 400 })
  }

  const verificationCode = clearance.verificationCode ?? clearance.documentNumber
  const qrCode = clearance.qrCode ?? (await buildVerificationQrDataUrl(verificationCode))

  const buffer = await pdf(
    <ClearanceCertificate
      residentName={`${resident.firstName} ${resident.lastName}`}
      documentNumber={clearance.documentNumber}
      verificationCode={verificationCode}
      issuedDate={clearance.approvedAt ? new Date(clearance.approvedAt).toLocaleDateString() : "N/A"}
      expiryDate={clearance.expiresAt ? new Date(clearance.expiresAt).toLocaleDateString() : "No expiry"}
      purpose={clearance.purpose ?? "General purpose"}
      qrCode={qrCode}
    />,
  ).toBuffer()

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${clearance.documentNumber}.pdf"`,
    },
  })
})
