export default function Roadmap() {
  return (
    <section id="roadmap">
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>خارطة الطريق</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>خطتنا <span>للـ 16 أسبوعاً القادمة</span></h2>
      </div>
      <div className="timeline">
        <div className="tl-item reveal">
          <div className="tl-phase">المرحلة ١</div>
          <div className="tl-title">التحقق من الفكرة</div>
          <div className="tl-desc">20 مقابلة مع الشريحة المستهدفة + جمع 200 إيميل في قائمة الانتظار قبل كتابة سطر كود</div>
          <span className="tl-date">الأسبوع 1 – 2</span>
        </div>
        <div className="tl-item reveal">
          <div className="tl-phase">المرحلة ٢</div>
          <div className="tl-title">التصميم والتخطيط</div>
          <div className="tl-desc">تحديد MVP الكامل + تصميم Figma لجميع الشاشات + اختبار مع 5 مستخدمين حقيقيين</div>
          <span className="tl-date">الأسبوع 3 – 4</span>
        </div>
        <div className="tl-item reveal">
          <div className="tl-phase">المرحلة ٣</div>
          <div className="tl-title">البناء التقني</div>
          <div className="tl-desc">Next.js + FastAPI + Supabase + Claude API + Pinecone Embeddings — بناء كل الميزات الجوهرية</div>
          <span className="tl-date">الأسبوع 5 – 11</span>
        </div>
        <div className="tl-item reveal">
          <div className="tl-phase">المرحلة ٤</div>
          <div className="tl-title">اختبار Beta</div>
          <div className="tl-desc">20 باحث عن عمل + 5 شركات يختبرون لأسبوعين مع جمع 50 ملاحظة مكتوبة على الأقل</div>
          <span className="tl-date">الأسبوع 12 – 13</span>
        </div>
        <div className="tl-item reveal">
          <div className="tl-phase">المرحلة ٥</div>
          <div className="tl-title">الإطلاق والنمو</div>
          <div className="tl-desc">Soft launch لقائمة الانتظار ← Product Hunt ← حملة تسويق ← 10 شركات أولى</div>
          <span className="tl-date">الأسبوع 14 – 16</span>
        </div>
      </div>
    </section>
  )
}
