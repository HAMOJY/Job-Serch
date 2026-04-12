export default function StatsTicker() {
  return (
    <div id="stats-ticker">
      <div className="ticker-grid">
        <div className="ticker-item reveal">
          <span className="ticker-num">+30%</span>
          <div className="ticker-label">بطالة الشباب العربي</div>
        </div>
        <div className="ticker-item reveal">
          <span className="ticker-num">80%</span>
          <div className="ticker-label">توفير في وقت HR</div>
        </div>
        <div className="ticker-item reveal">
          <span className="ticker-num">30 ث</span>
          <div className="ticker-label">تحليل AI للسيرة الذاتية</div>
        </div>
        <div className="ticker-item reveal">
          <span className="ticker-num">5 دول</span>
          <div className="ticker-label">مصر، العراق، المغرب، الجزائر، تونس</div>
        </div>
      </div>
    </div>
  )
}
