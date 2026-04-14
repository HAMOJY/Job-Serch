import Link from 'next/link'

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
            <li>✅ تحليل مجاني لسيرتك الذاتية مع تقرير مفصل — متاح الآن</li>
            <li>✅ اكتشف نقاط القوة والضعف في CV بدقة عالية</li>
            <li>✅ توصيات محددة وقابلة للتنفيذ فوراً</li>
            <li>🔜 مطابقة ذكية مع الوظائف التي تناسبك فعلاً</li>
            <li>🔜 رسائل تقديم مخصصة تُكتب تلقائياً لكل وظيفة</li>
            <li>🔜 محاكاة مقابلات ذكية لتحضيرك</li>
          </ul>
          <Link href="/auth/register" className="aud-cta" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            حلّل سيرتك مجاناً ←
          </Link>
        </div>
        <div className="audience-card employer">
          <div className="aud-bg"></div>
          <div className="aud-tag">🏢 للشركات والمستخدِمين</div>
          <h3 className="aud-title">وظّف الأفضل،<br/>بوقت أقل</h3>
          <ul className="aud-benefits">
            <li>🔜 انشر وظائفك وصلها لآلاف الباحثين المؤهلين</li>
            <li>🔜 قائمة مرتبة بالمتقدمين مع نقاط ومبررات AI</li>
            <li>🔜 وفّر 80% من وقت فريق HR في الفرز</li>
            <li>🔜 لوحة تحليلات متقدمة لكل حملة توظيف</li>
            <li>🔜 تواصل مباشر مع المرشحين من المنصة</li>
            <li>🔜 تقييم تلقائي لجودة وصف الوظيفة قبل النشر</li>
          </ul>
          <a href="#cta" className="aud-cta" style={{ display: 'block', textAlign: 'center' }}>
            سجّل اهتمام شركتك — نتواصل معك أولاً
          </a>
        </div>
      </div>
    </section>
  )
}
