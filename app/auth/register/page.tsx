import RegisterForm from '@/components/auth/RegisterForm'
import OAuthButtons from '@/components/auth/OAuthButtons'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060D1A',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0A1628',
        border: '1px solid #1A3060',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '440px',
        direction: 'rtl',
        fontFamily: 'sans-serif',
      }}>
        <h1 style={{ color: '#E8EAF0', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          إنشاء حساب
        </h1>
        <p style={{ color: '#8A9AB8', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          انضم إلى AI Hire Arab
        </p>

        <OAuthButtons />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#1A3060' }} />
          <span style={{ color: '#4A5A78', fontSize: '0.8rem' }}>أو بالبريد الإلكتروني</span>
          <div style={{ flex: 1, height: '1px', background: '#1A3060' }} />
        </div>

        <RegisterForm />

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#8A9AB8', fontSize: '0.85rem' }}>
          لديك حساب؟{' '}
          <Link href="/auth/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>
            سجّل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
