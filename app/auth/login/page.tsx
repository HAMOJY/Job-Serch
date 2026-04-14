import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import OAuthButtons from '@/components/auth/OAuthButtons'
import Link from 'next/link'

export default function LoginPage() {
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
        maxWidth: '420px',
        direction: 'rtl',
        fontFamily: 'sans-serif',
      }}>
        <h1 style={{ color: '#E8EAF0', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          تسجيل الدخول
        </h1>
        <p style={{ color: '#8A9AB8', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          أهلاً بعودتك في AI Hire Arab
        </p>

        <Suspense fallback={<div style={{ color: '#8A9AB8', textAlign: 'center', padding: '1rem' }}>...</div>}>
          <LoginForm />
        </Suspense>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#1A3060' }} />
          <span style={{ color: '#4A5A78', fontSize: '0.8rem' }}>أو</span>
          <div style={{ flex: 1, height: '1px', background: '#1A3060' }} />
        </div>

        <OAuthButtons />

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#8A9AB8', fontSize: '0.85rem' }}>
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" style={{ color: '#C9A84C', textDecoration: 'none' }}>
            سجّل الآن
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link href="/auth/forgot-password" style={{ color: '#4A5A78', fontSize: '0.8rem', textDecoration: 'none' }}>
            نسيت كلمة المرور؟
          </Link>
        </p>
      </div>
    </div>
  )
}
