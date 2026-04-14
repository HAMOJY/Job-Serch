'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import WaitlistModal from './WaitlistModal'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav style={scrolled ? { background: 'rgba(5,11,26,0.97)' } : undefined}>
        <div className="nav-logo">
          <div className="logo-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="8" r="3" fill="white" opacity="0.9"/>
              <circle cx="5" cy="19" r="2.5" fill="white" opacity="0.7"/>
              <circle cx="21" cy="19" r="2.5" fill="white" opacity="0.7"/>
              <line x1="13" y1="8" x2="5" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <line x1="13" y1="8" x2="21" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <line x1="5" y1="19" x2="21" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            </svg>
          </div>
          <span className="logo-text">AI Hire Arab</span>
        </div>
        <ul className="nav-links">
          <li><a href="#how">كيف تعمل</a></li>
          <li><a href="#ai-features">مميزات الذكاء الاصطناعي</a></li>
          <li><a href="#for-who">لمن هي</a></li>
          <li><a href="#pricing">الأسعار</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" style={{ color: '#8A9AB8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>لوحتي</Link>
          <button className="nav-cta" onClick={() => setModalOpen(true)}>ابدأ مجاناً</button>
          <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="قائمة التنقل">
            <span/><span/><span/>
          </button>
        </div>
      </nav>
      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        <a href="#how" onClick={() => setMenuOpen(false)}>كيف تعمل</a>
        <a href="#ai-features" onClick={() => setMenuOpen(false)}>مميزات الذكاء الاصطناعي</a>
        <a href="#for-who" onClick={() => setMenuOpen(false)}>لمن هي</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>الأسعار</a>
        <button className="mobile-cta" onClick={() => { setMenuOpen(false); setModalOpen(true) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', width: '100%', textAlign: 'center', padding: '0.8rem', color: '#fff', fontWeight: 700 }}>
          ابدأ مجاناً ←
        </button>
      </div>
      <WaitlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
