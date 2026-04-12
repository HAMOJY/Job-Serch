'use client'
import { useState } from 'react'

export default function AIFeatures() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <section id="ai-features">
      <div className="features-layout reveal">
        <div>
          <div className="section-label">قلب المنصة</div>
          <h2 className="section-title">ذكاء اصطناعي<br/><span>متكامل في كل خطوة</span></h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>كل ميزة مدعومة بأحدث تقنيات Claude API و OpenAI Embeddings</p>
          <div className="feature-list">
            {[
              { icon: '📊', title: 'تحليل السيرة الذاتية بـ Claude', desc: 'تحليل شامل لـ CV بالعربية مع نقاط القوة والضعف والتوصيات — يصدر خلال 30 ثانية' },
              { icon: '🔍', title: 'مطابقة ذكية بالـ Embeddings', desc: 'تحويل كل CV ووصف وظيفة لبيانات رقمية ومقارنتها رياضياً — دقة حقيقية لا كلمات مفتاحية' },
              { icon: '🏆', title: 'تصنيف المتقدمين للشركات', desc: 'كل CV يصل للشركة يحصل على نقاط من 100 مع مبرر مختصر — قائمة مرتبة تلقائياً' },
              { icon: '✍️', title: 'رسائل تقديم بالذكاء الاصطناعي', desc: 'تُكتب رسالة تقديم شخصية لكل وظيفة تلقائياً تناسب متطلباتها وخلفيتك المهنية' },
            ].map((feat, i) => (
              <div
                key={i}
                className={`feat-item${activeFeature === i ? ' active' : ''}`}
                onClick={() => setActiveFeature(i)}
              >
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
            <div className="mock-dots">
              <span></span><span></span><span></span>
            </div>
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
                <div className="bar-item">
                  <div className="bar-label"><span>المهارات التقنية</span><span style={{ color: 'var(--cyan)' }}>91%</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ '--w': '91%' } as React.CSSProperties}></div></div>
                </div>
                <div className="bar-item">
                  <div className="bar-label"><span>الخبرة المهنية</span><span style={{ color: 'var(--cyan)' }}>85%</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ '--w': '85%' } as React.CSSProperties}></div></div>
                </div>
                <div className="bar-item">
                  <div className="bar-label"><span>التعليم والشهادات</span><span style={{ color: 'var(--gold-light)' }}>78%</span></div>
                  <div className="bar-track"><div className="bar-fill gold" style={{ '--w': '78%' } as React.CSSProperties}></div></div>
                </div>
                <div className="bar-item">
                  <div className="bar-label"><span>وضوح وتنظيم الـ CV</span><span style={{ color: 'var(--gold-light)' }}>94%</span></div>
                  <div className="bar-track"><div className="bar-fill gold" style={{ '--w': '94%' } as React.CSSProperties}></div></div>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>💡 توصيات التحسين:</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span>• أضف مشاريع GitHub لتعزيز ملفك التقني</span>
                    <span>• اذكر الإنجازات بأرقام وليس بعبارات مبهمة</span>
                    <span>• أضف شهادة احترافية في مجالك</span>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>وظائف مطابقة</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--cyan)' }}>47</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>أفضل تطابق</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gold-light)' }}>96%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
