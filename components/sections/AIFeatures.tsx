'use client'
import { useState } from 'react'

const features = [
  {
    icon: '📊',
    title: 'تحليل السيرة الذاتية بـ Claude AI',
    desc: 'تحليل شامل لـ CV بالعربية مع نقاط القوة والضعف والتوصيات — يصدر خلال 30 ثانية',
    available: true,
  },
  {
    icon: '🔍',
    title: 'مطابقة ذكية بالـ Embeddings',
    desc: 'تحويل كل CV ووصف وظيفة لبيانات رقمية ومقارنتها رياضياً — دقة حقيقية لا كلمات مفتاحية',
    available: false,
  },
  {
    icon: '🏆',
    title: 'تصنيف المتقدمين للشركات',
    desc: 'كل CV يصل للشركة يحصل على نقاط من 100 مع مبرر مختصر — قائمة مرتبة تلقائياً',
    available: false,
  },
  {
    icon: '✍️',
    title: 'رسائل تقديم بالذكاء الاصطناعي',
    desc: 'تُكتب رسالة تقديم شخصية لكل وظيفة تلقائياً تناسب متطلباتها وخلفيتك المهنية',
    available: false,
  },
]

function Badge({ available }: { available: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.68rem', fontWeight: 700,
      padding: '0.2rem 0.55rem', borderRadius: '20px',
      background: available ? 'rgba(0,212,255,0.12)' : 'rgba(201,168,76,0.12)',
      border: `1px solid ${available ? 'rgba(0,212,255,0.3)' : 'rgba(201,168,76,0.3)'}`,
      color: available ? '#00D4FF' : '#C9A84C',
      marginBottom: '0.4rem',
    }}>
      {available ? '✅ متاح الآن' : '🔜 قريباً'}
    </span>
  )
}

export default function AIFeatures() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <section id="ai-features">
      <div className="features-layout reveal">
        <div>
          <div className="section-label">قلب المنصة</div>
          <h2 className="section-title">ذكاء اصطناعي<br/><span>متكامل في كل خطوة</span></h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>كل ميزة مدعومة بأحدث تقنيات Claude API — نبني الميزات تدريجياً بجودة عالية</p>
          <div className="feature-list">
            {features.map((feat, i) => (
              <div
                key={i}
                className={`feat-item${activeFeature === i ? ' active' : ''}`}
                onClick={() => setActiveFeature(i)}
              >
                <Badge available={feat.available} />
                <div className="feat-header">
                  <div className="feat-icon">{feat.icon}</div>
                  <h4 className="feat-title">{feat.title}</h4>
                </div>
                <p className="feat-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="ai-mockup">
          <div className="mockup-header">
            <div className="mock-dots"><span></span><span></span><span></span></div>
            <div className="mock-title">AI Hire Arab — تحليل السيرة الذاتية</div>
          </div>
          {!showAnalysis ? (
            <div className="cv-upload-area">
              <span className="upload-icon">📄</span>
              <div className="upload-text">اسحب وأفلت ملف CV هنا</div>
              <div className="upload-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>PDF أو Word — حتى 10 MB</div>
              <button className="upload-btn" onClick={() => setShowAnalysis(true)}>تحليل بالذكاء الاصطناعي ⚡</button>
            </div>
          ) : (
            <div className="analysis-result">
              <div className="result-header">
                <span className="result-label">🧠 تقرير تحليل AI</span>
                <span className="result-score">87/100</span>
              </div>
              <div className="result-bars">
                {[
                  { label: 'المهارات التقنية', val: 91, color: 'var(--cyan)' },
                  { label: 'الخبرة المهنية', val: 85, color: 'var(--cyan)' },
                  { label: 'التعليم والشهادات', val: 78, color: 'var(--gold-light)' },
                  { label: 'وضوح وتنظيم الـ CV', val: 94, color: 'var(--gold-light)' },
                ].map((b, i) => (
                  <div key={i} className="bar-item">
                    <div className="bar-label">
                      <span>{b.label}</span>
                      <span style={{ color: b.color }}>{b.val}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ '--w': `${b.val}%` } as React.CSSProperties}></div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>💡 توصيات التحسين:</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span>• أضف مشاريع GitHub لتعزيز ملفك التقني</span>
                    <span>• اذكر الإنجازات بأرقام وليس بعبارات مبهمة</span>
                    <span>• أضف شهادة احترافية في مجالك</span>
                  </div>
                </div>
                <a
                  href="/auth/register"
                  style={{ display: 'block', marginTop: '1rem', background: 'linear-gradient(135deg,#C9A84C,#8A6A20)', color: '#fff', textAlign: 'center', padding: '0.6rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  حلّل سيرتك الحقيقية مجاناً ←
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
