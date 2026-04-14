import Link from 'next/link'

export default function CTA() {
  return (
    <section id="cta">
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>🚀 ابدأ الآن</div>
        <h2 className="cta-title">
          جاهز لتحليل سيرتك الذاتية<br/>
          <span style={{ background: 'linear-gradient(135deg,var(--gold-light),var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            بالذكاء الاصطناعي؟
          </span>
        </h2>
        <p className="cta-sub">
          المنصة تعمل الآن — سجّل مجاناً واحصل على تحليل كامل لسيرتك الذاتية في أقل من 30 ثانية
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link
            href="/auth/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #C9A84C, #8A6A20)',
              color: '#fff', textDecoration: 'none',
              padding: '0.875rem 2rem', borderRadius: '12px',
              fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 8px 32px rgba(201,168,76,0.3)',
            }}
          >
            ابدأ مجاناً — تحليل فوري ←
          </Link>
          <Link
            href="/auth/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#E8EAF0', textDecoration: 'none',
              padding: '0.875rem 2rem', borderRadius: '12px',
              fontWeight: 600, fontSize: '1rem',
            }}
          >
            لديك حساب؟ سجّل الدخول
          </Link>
        </div>
        <p style={{ marginTop: '1.25rem', color: '#4A5A78', fontSize: '0.8rem' }}>
          لا يلزم بطاقة ائتمانية • التحليل الأول مجاني تماماً • يعمل مع PDF و Word
        </p>
      </div>
    </section>
  )
}
