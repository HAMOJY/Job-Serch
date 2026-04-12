import WaitlistForm from '@/components/WaitlistForm'

export default function CTA() {
  return (
    <section id="cta">
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>🚀 ابدأ رحلتك</div>
        <h2 className="cta-title">جاهز لتجربة التوظيف<br/><span style={{ background: 'linear-gradient(135deg,var(--gold-light),var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>بالذكاء الاصطناعي؟</span></h2>
        <p className="cta-sub">سجّل الآن في قائمة الانتظار وكن من أوائل المستفيدين عند الإطلاق الرسمي</p>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <WaitlistForm />
        </div>
      </div>
    </section>
  )
}
