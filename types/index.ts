export type UserRole = "ADMIN" | "SECRETARY" | "RESIDENT"
export type Gender = "MALE" | "FEMALE"
export type CivilStatus = "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED" | "SEPARATED"
export type OfficialPosition = "BARANGAY_CAPTAIN" | "BARANGAY_KAGAWAD" | "SK_CHAIRMAN" | "BARANGAY_SECRETARY" | "BARANGAY_TREASURER"

export interface Barangay {
  id: string
  name: string
  city: string
  province: string
  region: string
  address: string
  contactNumber?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  barangayId?: string | null
  residentId?: string | null
  name?: string | null
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Resident {
  id: string
  barangayId: string
  firstName: string
  lastName: string
  middleName?: string | null
  suffix?: string | null
  birthDate: Date
  gender: Gender
  civilStatus: CivilStatus
  occupation?: string | null
  phone?: string | null
  email?: string | null
  address: string
  purok?: string | null
  isVoter: boolean
  isSeniorCitizen: boolean
  isPWD: boolean
  isArchived: boolean
  photo?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Household {
  id: string
  barangayId: string
  householdHeadId?: string | null
  houseNumber?: string | null
  address: string
  purok?: string | null
  members?: HouseholdMember[]
  createdAt: Date
  updatedAt: Date
}

export interface HouseholdMember {
  id: string
  householdId: string
  residentId: string
  relationship: string
  isHead: boolean
  resident?: Resident
  createdAt: Date
}

export interface Official {
  id: string
  barangayId: string
  residentId: string
  position: OfficialPosition
  termStart: Date
  termEnd?: Date | null
  resident?: Resident
  createdAt: Date
  updatedAt: Date
}

export type ClearanceStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
export type ClearanceType = "BARANGAY_CLEARANCE" | "RESIDENCY_CERTIFICATE" | "INDIGENCY_CERTIFICATE" | "BUSINESS_CLEARANCE" | "CERTIFICATE_OF_GOOD_MORAL"

export interface ClearanceRequest {
  id: string
  barangayId: string
  residentId: string
  type: ClearanceType
  purpose?: string | null
  status: ClearanceStatus
  requestDate: Date
  approvedBy?: string | null
  approvedAt?: Date | null
  documentNumber: string
  verificationCode?: string | null
  expiresAt?: Date | null
  remarks?: string | null
  qrCode?: string | null
  resident?: Resident
  createdAt: Date
  updatedAt: Date
}

export type BlotterStatus = "OPEN" | "MEDIATION" | "SETTLED" | "REFERRED" | "CLOSED"
export type AnnouncementCategory = "GENERAL" | "MEETING" | "EVENT" | "HEALTH" | "SAFETY" | "EMERGENCY"

export interface Blotter {
  id: string
  barangayId: string
  caseNumber: string
  complainantId?: string | null
  respondentId?: string | null
  complainantName: string
  respondentName: string
  incident: string
  incidentDate: Date
  location: string
  description: string
  status: BlotterStatus
  resolutionNotes?: string | null
  resolution?: string | null
  mediationSchedule?: Date | null
  resolvedAt?: Date | null
  complainant?: Resident | null
  respondent?: Resident | null
  createdAt: Date
  updatedAt: Date
}

export interface Announcement {
  id: string
  barangayId: string
  title: string
  content: string
  category?: AnnouncementCategory | null
  isPublished: boolean
  publishedAt?: Date | null
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Ordinance {
  id: string
  barangayId: string
  title: string
  description?: string | null
  ordinanceNumber: string
  dateApproved: Date
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  id: string
  barangayId?: string | null
  userId?: string | null
  action: string
  description?: string | null
  entityType?: string | null
  entityId?: string | null
  metadata?: string | null
  user?: User | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface SystemSettings {
  id: string
  barangayId: string
  barangayLogo?: string | null
  barangaySeal?: string | null
  clearanceFee: number
  residencyFee: number
  updatedAt: Date
}
