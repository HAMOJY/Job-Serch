'use client'
import { useEffect } from 'react'

export default function Hero() {
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>('.stat-num[data-count]')
    counters.forEach(el => {
      const target = parseInt(el.dataset.count || '0')
      const suffix = el.dataset.suffix || ''
      let current = 0
      const step = target / 60
      const timer = setInterval(() => {
        current = Math.min(current + step, target)
        el.textContent = Math.floor(current) + suffix
        if (current >= target) clearInterval(timer)
      }, 16)
    })
  }, [])

  return (
    <section id="hero">
      <div className="hero-glow"></div>

      <div className="float-card float-1">
        <div className="float-badge-ai">
          <span className="ai-dot"></span>
          <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>تحليل AI</span>
        </div>
        <div style={{ marginTop: '0.35rem', color: 'var(--text-dim)' }}>نسبة تطابق الوظيفة</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold-light)' }}>94%</div>
      </div>

      <div className="float-card float-2" style={{ animationDelay: '2s' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>تم إيجاد وظيفة</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-dim),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>أح</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>أحمد محمد</div>
            <div style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>مطوّر Full-Stack ✓</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '850px' }}>
        <div className="hero-badge">
          <span className="badge-dot"></span>
          منصة التوظيف الذكي العربية #1
        </div>

        <h1 className="hero-title">
          <span className="title-line1">وظيفتك المثالية</span>
          <span className="title-gradient">بقوة الذكاء الاصطناعي</span>
        </h1>

        <p className="hero-sub">
          منصة توظيف عربية ذكية تحلل سيرتك الذاتية، تطابقك مع الوظائف المناسبة،
          وتوفر على الشركات 80% من وقت الفرز — كل ذلك بالعربية بالكامل
        </p>

        <div className="hero-actions">
          <a href="#cta" className="btn-primary">ابدأ مجاناً الآن ← </a>
          <a href="#how" className="btn-secondary">▶ شاهد كيف تعمل</a>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num" data-count="25000">0</span>
            <div className="stat-label">باحث عن عمل</div>
          </div>
          <div className="stat-item">
            <span className="stat-num" data-count="500">0</span>
            <div className="stat-label">شركة موثوقة</div>
          </div>
          <div className="stat-item">
            <span className="stat-num" data-count="94">0</span>
            <div className="stat-label">% دقة المطابقة</div>
          </div>
          <div className="stat-item">
            <span className="stat-num" data-count="80">0</span>
            <div className="stat-label">% توفير في وقت HR</div>
          </div>
        </div>
      </div>
    </section>
  )
}
