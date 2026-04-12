'use client'
import { useState } from 'react'

const seekerPlans = [
  {
    id: 'plan1',
    name: 'مجاني دائماً',
    price: '$0',
    period: '/شهر',
    desc: 'ابدأ واكتشف المنصة',
    popular: false,
    features: [
      { check: true, text: '3 طلبات تقديم شهرياً' },
      { check: true, text: 'تحليل AI للـ CV مرة واحدة' },
      { check: true, text: 'بحث عن الوظائف' },
      { check: false, text: 'رسائل تقديم بـ AI' },
      { check: false, text: 'محاكاة المقابلات' },
      { check: false, text: 'تنبيهات ذكية' },
    ],
    btnText: 'ابدأ مجاناً',
  },
  {
    id: 'plan2',
    name: 'أساسي',
    price: '$9',
    period: '/شهر',
    desc: 'للباحث الجاد',
    popular: true,
    features: [
      { check: true, text: 'تقديم غير محدود' },
      { check: true, text: 'تحليل AI شهري' },
      { check: true, text: 'رسائل تقديم بـ AI' },
      { check: true, text: 'تنبيهات وظائف ذكية' },
      { check: false, text: 'محاكاة المقابلات' },
      { check: false, text: 'التقديم المجهول' },
    ],
    btnText: 'اشترك الآن',
  },
  {
    id: 'plan3',
    name: 'بريميوم',
    price: '$19',
    period: '/شهر',
    desc: 'للنخبة المحترفة',
    popular: false,
    features: [
      { check: true, text: 'كل مزايا الأساسي' },
      { check: true, text: 'تحليل AI أسبوعي' },
      { check: true, text: 'محاكاة مقابلات بـ AI' },
      { check: true, text: 'التقديم بهوية مجهولة' },
      { check: true, text: 'دعم Chat مباشر 24/7' },
      { check: true, text: 'مسار تطوير المهارات' },
    ],
    btnText: 'ابدأ تجربة مجانية',
  },
]

const employerPlans = [
  {
    id: 'eplan1',
    name: 'ناشئة',
    price: '$49',
    period: '/شهر',
    desc: 'للشركات الصغيرة',
    popular: false,
    features: [
      { check: true, text: '3 وظائف نشطة' },
      { check: true, text: '50 طلب شهرياً' },
      { check: true, text: 'تصنيف AI للمتقدمين' },
      { check: false, text: 'لوحة التحليلات' },
      { check: false, text: 'API مخصص' },
    ],
    btnText: 'ابدأ مجاناً',
  },
  {
    id: 'eplan2',
    name: 'متوسطة',
    price: '$149',
    period: '/شهر',
    desc: 'للشركات المتنامية',
    popular: true,
    features: [
      { check: true, text: '15 وظيفة نشطة' },
      { check: true, text: 'طلبات غير محدودة' },
      { check: true, text: 'تصنيف AI متقدم' },
      { check: true, text: 'لوحة تحليلات كاملة' },
      { check: false, text: 'API مخصص' },
    ],
    btnText: 'اشترك الآن',
  },
  {
    id: 'eplan3',
    name: 'مؤسسية',
    price: '$499',
    period: '/شهر',
    desc: 'للمؤسسات الكبرى',
    popular: false,
    features: [
      { check: true, text: 'وظائف غير محدودة' },
      { check: true, text: 'كل مزايا المتوسطة' },
      { check: true, text: 'API + تكامل ATS' },
      { check: true, text: 'مدير حساب مخصص' },
      { check: true, text: 'SLA 99.9% uptime' },
    ],
    btnText: 'تواصل معنا',
  },
]

export default function Pricing() {
  const [isEmployer, setIsEmployer] = useState(false)
  const plans = isEmployer ? employerPlans : seekerPlans

  return (
    <section id="pricing">
      <div style={{ textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>الأسعار</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>خطط تناسب <span>الجميع</span></h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          {isEmployer ? 'للشركات — بدّل للباحثين أعلاه' : 'للباحثين عن عمل — بدّل للشركات أدناه'}
        </p>
      </div>
      <div className="pricing-switch">
        <span className="switch-label" style={{ color: 'var(--text)' }}>باحثون عن عمل</span>
        <label className="switch">
          <input type="checkbox" checked={isEmployer} onChange={e => setIsEmployer(e.target.checked)} />
          <span className="switch-slider"></span>
        </label>
        <span className="switch-label">شركات</span>
        <span className="save-badge">شهر مجاني</span>
      </div>
      <div className="pricing-grid reveal">
        {plans.map(plan => (
          <div key={plan.id} className={`price-card${plan.popular ? ' popular' : ''}`}>
            {plan.popular && <div className="popular-tag">⭐ الأكثر شيوعاً</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">{plan.price}<span>{plan.period}</span></div>
            <div className="plan-desc">{plan.desc}</div>
            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i}>
                  <span className={f.check ? 'check' : 'cross'}>{f.check ? '✓' : '✗'}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <button className="plan-btn">{plan.btnText}</button>
          </div>
        ))}
      </div>
    </section>
  )
}
