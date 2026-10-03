export type Role = 'user' | 'admin' | 'superadmin'
export type MemberType = 'regular' | 'student' | 'associate' | 'honorary' | 'lifetime'
export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'expired' | 'cancelled'
export type NewsCategory = 'announcement' | 'news' | 'activity' | 'knowledge'
export type EventStatus = 'draft' | 'published' | 'closed' | 'cancelled'
export type RateType = 'member' | 'nonmember' | 'student'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'waived' | 'refunded'
export type RegStatus = 'pending' | 'confirmed' | 'waitlist' | 'cancelled'

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  full_name_en: string | null
  avatar_url: string | null
  phone: string | null
  license_no: string | null
  workplace: string | null
  job_title: string | null
  province: string | null
  line_id: string | null
  bio: string | null
  member_code: string | null
  role: Role
  show_in_directory: boolean
  created_at: string
  updated_at: string
}

export type Membership = {
  id: string
  user_id: string
  member_type: MemberType
  status: MembershipStatus
  fee_amount: number
  payment_slip_path: string | null
  payment_ref: string | null
  transferred_at: string | null
  start_date: string | null
  end_date: string | null
  applied_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  applicant_note: string | null
  created_at: string
  profiles?: Profile | null
}

export type News = {
  id: string
  slug: string
  category: NewsCategory
  title_th: string
  title_en: string | null
  excerpt_th: string | null
  excerpt_en: string | null
  body_th: string | null
  body_en: string | null
  cover_url: string | null
  is_published: boolean
  published_at: string | null
  is_pinned: boolean
  author_id: string | null
  created_at: string
  updated_at: string
}

export type Speaker = { name: string; name_en?: string; affiliation?: string; photo_url?: string }
export type AgendaItem = { time?: string; title_th: string; title_en?: string; speaker?: string }

export type EventRow = {
  id: string
  slug: string
  title_th: string
  title_en: string | null
  summary_th: string | null
  summary_en: string | null
  description_th: string | null
  description_en: string | null
  cover_url: string | null
  venue_th: string | null
  venue_en: string | null
  is_online: boolean
  online_url: string | null
  starts_at: string
  ends_at: string | null
  register_opens_at: string | null
  register_closes_at: string | null
  capacity: number | null
  fee_member: number
  fee_nonmember: number
  fee_student: number
  ce_credits: number
  has_certificate: boolean
  speakers: Speaker[]
  agenda: AgendaItem[]
  status: EventStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Registration = {
  id: string
  event_id: string
  user_id: string
  attendee_name: string
  attendee_email: string | null
  attendee_phone: string | null
  attendee_license_no: string | null
  attendee_workplace: string | null
  rate_type: RateType
  fee_amount: number
  payment_slip_path: string | null
  transferred_at: string | null
  payment_status: PaymentStatus
  status: RegStatus
  note: string | null
  checked_in_at: string | null
  checked_in_by: string | null
  certificate_code: string | null
  certificate_issued_at: string | null
  created_at: string
  updated_at: string
  events?: EventRow | null
  profiles?: Profile | null
}

export type MembershipFees = Record<MemberType, number>
export type BankInfo = {
  bank_name?: string
  account_name?: string
  account_no?: string
  promptpay?: string
}
export type SocietyInfo = {
  email?: string
  phone?: string
  facebook?: string
  line?: string
  address?: string
}
