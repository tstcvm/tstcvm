import { PageHeader } from '@/components/ui'
import { isLocale, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/queries'

export const revalidate = 3600

export const metadata = { title: 'นโยบายความเป็นส่วนตัว / Privacy policy' }

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { society } = await getSettings()
  const th = locale === 'th'
  const contact = society.email || 'tstcvm.th@gmail.com'

  const sections = th
    ? [
        {
          h: 'ข้อมูลที่เราเก็บ',
          p: [
            'เมื่อคุณเข้าสู่ระบบด้วยบัญชี Google เราได้รับชื่อ อีเมล และรูปโปรไฟล์จาก Google เพื่อใช้ยืนยันตัวตนเท่านั้น',
            'เมื่อคุณสมัครสมาชิกหรือลงทะเบียนงานสัมมนา เราเก็บข้อมูลที่คุณกรอกเอง ได้แก่ ชื่อ-นามสกุล เบอร์โทรศัพท์ เลขที่ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์ สถานที่ทำงาน จังหวัด และหลักฐานการชำระเงิน (สลิป)',
          ],
        },
        {
          h: 'เราใช้ข้อมูลอย่างไร',
          p: [
            'ใช้เพื่อตรวจสอบคุณสมบัติและสถานะสมาชิก ตรวจสอบการชำระเงิน จัดการการลงทะเบียนงานสัมมนา ออกใบรับรองการเข้าร่วม และติดต่อคุณเรื่องกิจกรรมของชมรม',
            'เราไม่ขาย ไม่ให้เช่า และไม่เปิดเผยข้อมูลของคุณแก่บุคคลภายนอก ยกเว้นเมื่อกฎหมายกำหนด',
          ],
        },
        {
          h: 'ทำเนียบสมาชิก',
          p: [
            'ชื่อ สถานที่ทำงาน และจังหวัดของคุณจะแสดงในทำเนียบสมาชิก ซึ่งเห็นได้เฉพาะสมาชิกที่สถานะใช้งานอยู่เท่านั้น',
            'คุณปิดการแสดงผลนี้ได้ตลอดเวลาที่หน้า "โปรไฟล์ของฉัน"',
          ],
        },
        {
          h: 'การเก็บรักษาและความปลอดภัย',
          p: [
            'ข้อมูลถูกเก็บบนฐานข้อมูล Supabase ที่เข้าถึงได้ตามสิทธิ์ (Row Level Security) สลิปการโอนเงินเก็บในพื้นที่แบบปิด เปิดดูได้เฉพาะเจ้าของสลิปและผู้ดูแลระบบของชมรม',
            'เราเก็บข้อมูลสมาชิกไว้ตลอดระยะเวลาที่คุณเป็นสมาชิกและเท่าที่จำเป็นตามกฎหมายบัญชี',
          ],
        },
        {
          h: 'สิทธิของคุณ',
          p: [
            'คุณมีสิทธิขอดู แก้ไข หรือขอลบข้อมูลส่วนบุคคลของคุณ รวมถึงขอถอนความยินยอม โดยติดต่อ ' + contact,
          ],
        },
      ]
    : [
        {
          h: 'Information we collect',
          p: [
            'When you sign in with Google we receive your name, email address and profile picture, used only to identify your account.',
            'When you apply for membership or register for an event we store what you enter: full name, phone number, veterinary licence number, workplace, province and your payment slip.',
          ],
        },
        {
          h: 'How we use it',
          p: [
            'To verify membership eligibility and status, verify payments, manage event registrations, issue attendance certificates and contact you about society activities.',
            'We do not sell, rent or disclose your data to third parties except where required by law.',
          ],
        },
        {
          h: 'Member directory',
          p: [
            'Your name, workplace and province appear in the member directory, which is visible only to active members.',
            'You can switch this off at any time on your profile page.',
          ],
        },
        {
          h: 'Storage and security',
          p: [
            'Data is stored in a Supabase database protected by row level security. Payment slips are kept in a private bucket readable only by the person who uploaded it and society administrators.',
            'We keep member records for as long as you are a member and as required by accounting law.',
          ],
        },
        {
          h: 'Your rights',
          p: [
            `You may request access to, correction of, or deletion of your personal data, and withdraw consent, by contacting ${contact}.`,
          ],
        },
      ]

  return (
    <>
      <PageHeader
        title={th ? 'นโยบายความเป็นส่วนตัว' : 'Privacy policy'}
        lead={th ? 'ชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย (TSTCVM)' : 'The Thai Society of Traditional Chinese Veterinary Medicine'}
      />
      <div className="prose-tcvm mx-auto max-w-3xl px-4 py-10 text-[15px]">
        {sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </section>
        ))}
        <p className="mt-10 text-sm text-muted">
          {th ? 'ติดต่อ: ' : 'Contact: '}
          <a href={`mailto:${contact}`}>{contact}</a>
        </p>
      </div>
    </>
  )
}
