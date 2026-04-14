export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="logo-icon" style={{ fontSize: '0.85rem', fontWeight: 900 }}>AI</div>
            <span className="logo-text">AI Hire Arab</span>
          </div>
          <p className="footer-tagline">منصة التوظيف الذكي العربية. نربط الباحثين عن عمل بالشركات عبر قوة الذكاء الاصطناعي.</p>
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#00D4FF' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D4FF', display: 'inline-block' }}></span>
            المنصة تعمل الآن — جرّبها مجاناً
          </div>
          <div className="social-links" style={{ marginTop: '1.25rem' }}>
            <a className="social-btn" href="#" aria-label="LinkedIn">in</a>
            <a className="social-btn" href="#" aria-label="X / Twitter">𝕏</a>
            <a className="social-btn" href="#" aria-label="Facebook">f</a>
            <a className="social-btn" href="#" aria-label="YouTube">yt</a>
          </div>
        </div>
        <div>
          <div className="footer-heading">المنصة</div>
          <ul className="footer-links">
            <li><a href="/auth/register">للباحثين عن عمل</a></li>
            <li><a href="/auth/register">للشركات</a></li>
            <li><a href="#pricing">الأسعار</a></li>
            <li><a href="/analyze">تحليل السيرة الذاتية</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">الشركة</div>
          <ul className="footer-links">
            <li><a href="#">من نحن</a></li>
            <li><a href="#">المدونة</a></li>
            <li><a href="#">الوظائف</a></li>
            <li><a href="#">الشراكات</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">الدعم</div>
          <ul className="footer-links">
            <li><a href="#">مركز المساعدة</a></li>
            <li><a href="#">تواصل معنا</a></li>
            <li><a href="#">سياسة الخصوصية</a></li>
            <li><a href="#">الشروط والأحكام</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} AI Hire Arab — جميع الحقوق محفوظة</span>
        <span>مبني بـ ❤ للسوق العربي</span>
      </div>
    </footer>
  )
}
