'use client'

import dynamic from 'next/dynamic'

const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false })

export default function Canvas3DWrapper() {
  return <Canvas3D />
}
