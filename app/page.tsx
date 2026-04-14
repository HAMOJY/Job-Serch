import Nav from '@/components/Nav'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import AIFeatures from '@/components/sections/AIFeatures'
import ForWho from '@/components/sections/ForWho'
import Pricing from '@/components/sections/Pricing'
import StatsTicker from '@/components/sections/StatsTicker'
import CTA from '@/components/sections/CTA'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <AIFeatures />
        <ForWho />
        <Pricing />
        <StatsTicker />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
