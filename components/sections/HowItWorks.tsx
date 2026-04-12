export default function HowItWorks() {
  return (
    <section id="how">
      <div className="how-container">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>كيف تعمل المنصة</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>ثلاث خطوات <span>نحو وظيفتك</span></h2>
        </div>
        <div className="steps-grid reveal">
          <div className="step-card">
            <div className="step-num">١</div>
            <h3 className="step-title">ارفع سيرتك الذاتية</h3>
            <p className="step-desc">ارفع ملف PDF أو Word وسيقوم الذكاء الاصطناعي بتحليله فورياً وإنشاء ملفك المهني</p>
          </div>
          <div className="step-card" style={{ animationDelay: '0.2s' }}>
            <div className="step-num">٢</div>
            <h3 className="step-title">احصل على تقييم AI</h3>
            <p className="step-desc">Claude يحلل نقاط قوتك وضعفك ويعطيك نسبة الجاهزية مع اقتراحات تحسين مخصصة</p>
          </div>
          <div className="step-card" style={{ animationDelay: '0.4s' }}>
            <div className="step-num">٣</div>
            <h3 className="step-title">تقدّم بذكاء واحصل على الوظيفة</h3>
            <p className="step-desc">اكتشف الوظائف المطابقة وقدّم بنقرة واحدة مع رسالة تقديم ذكية تُكتب تلقائياً</p>
          </div>
        </div>
      </div>
    </section>
  )
}
