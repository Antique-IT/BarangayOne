import { createHmac, randomBytes } from "crypto"
import QRCode from "qrcode"

const DEFAULT_SECRET = "barangayos-verify-secret"

export function generateVerificationCode() {
  const randomPart = randomBytes(4).toString("hex").toUpperCase()
  return `VRF-${new Date().getFullYear()}-${randomPart}`
}

export function signVerificationCode(code: string) {
  const secret = process.env.VERIFICATION_SECRET || DEFAULT_SECRET
  const digest = createHmac("sha256", secret).update(code).digest("hex").slice(0, 12).toUpperCase()
  return `${code}-${digest}`
}

export async function buildVerificationQrDataUrl(verificationCode: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verifyUrl = `${baseUrl}/public/verify?code=${encodeURIComponent(verificationCode)}`
  return QRCode.toDataURL(verifyUrl)
}
