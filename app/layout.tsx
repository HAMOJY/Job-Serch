import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ScrollReveal'
import './globals.css'

const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false })

export const metadata: Metadata = {
  title: 'AI Hire Arab – منصة التوظيف بالذكاء الاصطناعي',
  description: 'AI Hire Arab — أول منصة توظيف عربية تعمل بالذكاء الاصطناعي. تحليل فوري للسيرة الذاتية، مطابقة ذكية مع الوظائف، وتوفير 80% من وقت فريق HR.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;900&family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Canvas3D />
        <ScrollReveal />
        {children}
      </body>
    </html>
  )
}
