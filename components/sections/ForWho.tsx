export default function ForWho() {
  return (
    <section id="for-who">
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>المستخدمون</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>منصة واحدة <span>لطرفي المعادلة</span></h2>
      </div>
      <div className="audience-grid reveal">
        <div className="audience-card seeker">
          <div className="aud-bg"></div>
          <div className="aud-tag">👨‍💼 للباحثين عن عمل</div>
          <h3 className="aud-title">ابحث بذكاء،<br/>وصل أسرع</h3>
          <ul className="aud-benefits">
            <li>تحليل مجاني لسيرتك الذاتية مع تقرير مفصل</li>
            <li>مطابقة ذكية مع الوظائف التي تناسبك فعلاً</li>
            <li>رسائل تقديم مخصصة تُكتب تلقائياً لكل وظيفة</li>
            <li>تتبع حالة طلباتك في مكان واحد</li>
            <li>محاكاة مقابلات ذكية لتحضيرك (بريميوم)</li>
            <li>تنبيهات فورية عند نشر وظائف تطابقك</li>
          </ul>
          <button className="aud-cta">ابحث عن وظيفة مجاناً ←</button>
        </div>
        <div className="audience-card employer">
          <div className="aud-bg"></div>
          <div className="aud-tag">🏢 للشركات والمستخدِمين</div>
          <h3 className="aud-title">وظّف الأفضل،<br/>بوقت أقل</h3>
          <ul className="aud-benefits">
            <li>انشر وظائفك وصلها لآلاف الباحثين المؤهلين</li>
            <li>قائمة مرتبة بالمتقدمين مع نقاط ومبررات AI</li>
            <li>وفّر 80% من وقت فريق HR في الفرز</li>
            <li>لوحة تحليلات متقدمة لكل حملة توظيف</li>
            <li>تواصل مباشر مع المرشحين من المنصة</li>
            <li>تقييم تلقائي لجودة وصف الوظيفة قبل النشر</li>
          </ul>
          <button className="aud-cta">انضم كشركة واحصل على شهر مجاني</button>
        </div>
      </div>
    </section>
  )
}
