export default function Problem() {
  return (
    <section id="problem">
      <div className="problem-grid reveal">
        <div>
          <div className="section-label">⚠ المشكلة الحالية</div>
          <h2 className="section-title">سوق التوظيف<br/><span>مكسور</span></h2>
          <p className="section-sub">نسبة بطالة الشباب العربي تتجاوز 30% رغم توفر الوظائف. الأنظمة القديمة لا تخدم السوق العربي.</p>
          <div className="problem-cards" style={{ marginTop: '1.5rem' }}>
            <div className="prob-card">
              <div className="prob-icon">⏳</div>
              <div className="prob-text">
                <h4>أشهر من الانتظار</h4>
                <p>الباحثون يُرسلون مئات الطلبات دون ردود، يضيعون أشهراً بلا نتيجة</p>
              </div>
            </div>
            <div className="prob-card">
              <div className="prob-icon">🌍</div>
              <div className="prob-text">
                <h4>لا يوجد حل عربي متخصص</h4>
                <p>LinkedIn إنجليزي، بعيد.com قديم، لا أحد يستخدم ذكاء اصطناعي فعلياً</p>
              </div>
            </div>
            <div className="prob-card">
              <div className="prob-icon">📄</div>
              <div className="prob-text">
                <h4>فرز يدوي مُضيّع للوقت</h4>
                <p>الشركات تستغرق أسابيع لفرز آلاف السير الذاتية يدوياً</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="section-label" style={{ color: 'var(--cyan)' }}>✨ الحل</div>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>الذكاء الاصطناعي<br/><span>يحل المشكلة</span></h2>
          <p className="section-sub">نستخدم أحدث تقنيات Claude AI و OpenAI Embeddings لثورة حقيقية في التوظيف العربي</p>
          <div className="sol-cards" style={{ marginTop: '1.5rem' }}>
            <div className="sol-card">
              <div className="sol-icon">🧠</div>
              <div className="prob-text">
                <h4>تحليل ذكي للسيرة الذاتية</h4>
                <p>Claude API يحلل CV بالعربية ويعطيك تقريراً مفصلاً فورياً</p>
              </div>
            </div>
            <div className="sol-card">
              <div className="sol-icon">🎯</div>
              <div className="prob-text">
                <h4>مطابقة ذكية بالـ Embeddings</h4>
                <p>تطابق حقيقي بين المرشح والوظيفة بدون الاعتماد على الكلمات المفتاحية فقط</p>
              </div>
            </div>
            <div className="sol-card">
              <div className="sol-icon">⚡</div>
              <div className="prob-text">
                <h4>تصنيف تلقائي للمتقدمين</h4>
                <p>الشركة ترى قائمة مرتبة مع نقاط ومبررات — في ثوانٍ لا أسابيع</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
