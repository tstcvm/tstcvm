import { PageHeader } from '@/components/ui'
import { isLocale, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/queries'

export const revalidate = 3600

export const metadata = { title: 'ข้อกำหนดการใช้งาน / Terms of service' }

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { society } = await getSettings()
  const th = locale === 'th'
  const contact = society.email || 'tstcvm.th@gmail.com'

  const sections = th
    ? [
        {
          h: 'การใช้งานเว็บไซต์',
          p: [
            'เว็บไซต์นี้ให้บริการโดยชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย เพื่อเผยแพร่ข่าวสาร รับสมัครสมาชิก และรับลงทะเบียนงานวิชาการ',
            'คุณต้องให้ข้อมูลที่เป็นความจริง และไม่ใช้บัญชีของผู้อื่นในการสมัครหรือลงทะเบียน',
          ],
        },
        {
          h: 'สมาชิกภาพ',
          p: [
            'การสมัครสมาชิกจะสมบูรณ์เมื่อผู้ดูแลตรวจสอบหลักฐานการชำระเงินและอนุมัติแล้ว ชมรมขอสงวนสิทธิ์ในการปฏิเสธหรือยกเลิกสมาชิกภาพหากพบว่าข้อมูลไม่ถูกต้อง',
            'สมาชิกภาพมีอายุตามรอบที่ระบุไว้ และต้องต่ออายุเมื่อครบกำหนด',
          ],
        },
        {
          h: 'การลงทะเบียนและการชำระเงิน',
          p: [
            'อัตราค่าลงทะเบียนขึ้นกับสถานะสมาชิก ณ วันที่ลงทะเบียน การลงทะเบียนจะได้รับการยืนยันเมื่อผู้ดูแลตรวจสอบการชำระเงินแล้ว',
            'กรณียกเลิกหรือขอคืนเงิน ให้ติดต่อผู้จัดงานโดยตรงก่อนวันงาน การคืนเงินเป็นดุลพินิจของชมรม',
          ],
        },
        {
          h: 'เนื้อหาทางวิชาการ',
          p: [
            'เนื้อหาบนเว็บไซต์มีไว้เพื่อการศึกษาและแลกเปลี่ยนในกลุ่มวิชาชีพสัตวแพทย์ ไม่ใช่คำแนะนำในการรักษาสัตว์ป่วยรายตัว การตัดสินใจทางคลินิกเป็นความรับผิดชอบของสัตวแพทย์ผู้ดูแลเคส',
          ],
        },
        {
          h: 'การเปลี่ยนแปลงข้อกำหนด',
          p: ['ชมรมอาจปรับปรุงข้อกำหนดนี้ได้ โดยจะประกาศบนเว็บไซต์'],
        },
      ]
    : [
        {
          h: 'Use of this site',
          p: [
            'This site is operated by the Thai Society of Traditional Chinese Veterinary Medicine to publish news, accept membership applications and take event registrations.',
            'You must provide accurate information and may not use another person’s account to apply or register.',
          ],
        },
        {
          h: 'Membership',
          p: [
            'Membership takes effect once an administrator has verified your payment and approved the application. The society may refuse or revoke membership if the information given is inaccurate.',
            'Membership runs for the stated term and must be renewed on expiry.',
          ],
        },
        {
          h: 'Registration and payment',
          p: [
            'The fee depends on your membership status on the day you register. A registration is confirmed once an administrator has verified payment.',
            'For cancellation or refund, contact the organiser before the event date. Refunds are at the society’s discretion.',
          ],
        },
        {
          h: 'Academic content',
          p: [
            'Content here is for education and professional exchange among veterinarians. It is not advice for treating an individual patient; clinical decisions remain the responsibility of the attending veterinarian.',
          ],
        },
        {
          h: 'Changes',
          p: ['The society may update these terms and will announce changes on this site.'],
        },
      ]

  return (
    <>
      <PageHeader
        title={th ? 'ข้อกำหนดการใช้งาน' : 'Terms of service'}
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
