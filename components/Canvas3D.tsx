'use client'

import { useEffect, useRef } from 'react'

export default function Canvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const NODE_COUNT = 90
    const MAX_DIST = 160
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    const handleMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    document.addEventListener('mousemove', handleMouseMove)

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.6,
      pulse: Math.random() * Math.PI * 2,
      type: Math.random() < 0.55 ? 0 : (Math.random() < 0.4 ? 1 : 2),
    }))

    const COLS = [
      { dot: 'rgba(30,80,160,{a})', line: 'rgba(26,70,140,{a})' },
      { dot: 'rgba(140,100,24,{a})', line: 'rgba(120,88,20,{a})' },
      { dot: 'rgba(20,60,130,{a})', line: 'rgba(18,55,120,{a})' },
    ]

    function fill(tpl: string, a: string) { return tpl.replace('{a}', a) }

    let raf: number
    function draw() {
      if (!canvas || !ctx) return
      raf = requestAnimationFrame(draw)
      const W = canvas.width, H = canvas.height

      ctx.clearRect(0, 0, W, H)

      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.85)
      vig.addColorStop(0, 'rgba(5,11,26,0)')
      vig.addColorStop(1, 'rgba(3,7,15,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.012
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
        const dx = n.x - mouseX, dy = n.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) { n.vx += dx / dist * 0.018; n.vy += dy / dist * 0.018 }
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (spd > 0.7) { n.vx *= 0.97; n.vy *= 0.97 }
      }

      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > MAX_DIST) continue
          const alpha = (1 - d / MAX_DIST) * 0.13
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = fill(COLS[a.type].line, alpha.toFixed(3))
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }

      for (const n of nodes) {
        const breathe = 0.85 + Math.sin(n.pulse) * 0.15
        const radius = n.r * breathe
        const alpha = 0.18 + Math.sin(n.pulse) * 0.07
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = fill(COLS[n.type].dot, alpha.toFixed(3))
        ctx.fill()
      }

      const t = Date.now() * 0.00015
      const scanY = ((t % 1) * H * 2) % H
      const scan = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40)
      scan.addColorStop(0, 'rgba(26,110,255,0)')
      scan.addColorStop(0.5, 'rgba(26,110,255,0.025)')
      scan.addColorStop(1, 'rgba(26,110,255,0)')
      ctx.fillStyle = scan
      ctx.fillRect(0, scanY - 40, W, 80)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="canvas3d"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
