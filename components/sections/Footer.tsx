export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="logo-icon" style={{ fontSize: '0.85rem', fontWeight: 900 }}>AI</div>
            <span className="logo-text">AI Hire Arab</span>
          </div>
          <p className="footer-tagline">منصة التوظيف الذكي العربية. نربط الباحثين عن عمل بالشركات عبر قوة الذكاء الاصطناعي.</p>
          <div className="social-links" style={{ marginTop: '1.25rem' }}>
            <a className="social-btn" href="#">in</a>
            <a className="social-btn" href="#">𝕏</a>
            <a className="social-btn" href="#">f</a>
            <a className="social-btn" href="#">yt</a>
          </div>
        </div>
        <div>
          <div className="footer-heading">المنصة</div>
          <ul className="footer-links">
            <li><a href="#">للباحثين عن عمل</a></li>
            <li><a href="#">للشركات</a></li>
            <li><a href="#">الأسعار</a></li>
            <li><a href="#">API للمطورين</a></li>
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
        <span>© 2025 AI Hire Arab — جميع الحقوق محفوظة</span>
        <span>مبني بـ ❤ للسوق العربي</span>
      </div>
    </footer>
  )
}
