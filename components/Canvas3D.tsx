'use client'

import { useEffect, useRef } from 'react'

export default function Canvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      if (canvas) { canvas.width = W; canvas.height = H }
    }
    window.addEventListener('resize', resize)

    // Mouse
    let mouseX = W / 2
    let mouseY = H / 2
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    document.addEventListener('mousemove', onMouseMove)

    // Scroll — used for parallax layers
    let scrollY = window.scrollY
    const onScroll = () => { scrollY = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Layer definitions ──────────────────────────────────────────────
    // Each layer has nodes that drift at different speeds relative to scroll
    const LAYERS = [
      { count: 35, speed: 0.04, maxDist: 180, baseAlpha: 0.12, dotR: 1.8, color: [30, 80, 200] },   // deep blue - slowest
      { count: 30, speed: 0.07, maxDist: 140, baseAlpha: 0.10, dotR: 1.3, color: [140, 100, 24] },  // gold - mid
      { count: 25, speed: 0.12, maxDist: 110, baseAlpha: 0.08, dotR: 0.9, color: [20, 140, 220] },  // cyan - fastest
    ]

    type Node = {
      x: number; y: number; ox: number; oy: number
      vx: number; vy: number
      r: number; pulse: number
      layerIdx: number
      color: number[]
      speed: number
    }

    const nodes: Node[] = []
    LAYERS.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const ox = Math.random() * W
        const oy = Math.random() * H
        nodes.push({
          x: ox, y: oy, ox, oy,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: layer.dotR * (0.8 + Math.random() * 0.4),
          pulse: Math.random() * Math.PI * 2,
          layerIdx: li,
          color: layer.color,
          speed: layer.speed,
        })
      }
    })

    // ── Floating geometric shapes (3D feel) ──────────────────────────
    type Shape = {
      x: number; y: number; size: number
      rotation: number; rotSpeed: number
      alpha: number; sides: number
      parallaxFactor: number
    }

    const shapes: Shape[] = Array.from({ length: 8 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 15 + Math.random() * 35,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004,
      alpha: 0.03 + Math.random() * 0.04,
      sides: [3, 4, 6][Math.floor(Math.random() * 3)],
      parallaxFactor: 0.03 + Math.random() * 0.08,
    }))

    function drawPolygon(
      cx: number, cy: number, sides: number, size: number,
      rotation: number, alpha: number
    ) {
      ctx!.beginPath()
      for (let i = 0; i < sides; i++) {
        const angle = rotation + (i / sides) * Math.PI * 2
        const px = cx + Math.cos(angle) * size
        const py = cy + Math.sin(angle) * size
        i === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py)
      }
      ctx!.closePath()
      ctx!.strokeStyle = `rgba(201,168,76,${alpha})`
      ctx!.lineWidth = 0.8
      ctx!.stroke()
    }

    let raf: number

    function draw() {
      raf = requestAnimationFrame(draw)
      ctx!.clearRect(0, 0, W, H)

      // Subtle vignette
      const vig = ctx!.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.9)
      vig.addColorStop(0, 'rgba(5,11,26,0)')
      vig.addColorStop(1, 'rgba(3,7,18,0.6)')
      ctx!.fillStyle = vig
      ctx!.fillRect(0, 0, W, H)

      // Draw geometric shapes with scroll parallax
      for (const s of shapes) {
        s.rotation += s.rotSpeed
        const parallaxOffsetY = scrollY * s.parallaxFactor
        drawPolygon(s.x, s.y - parallaxOffsetY % H, s.sides, s.size, s.rotation, s.alpha)
      }

      // Update nodes with scroll parallax per layer
      for (const n of nodes) {
        n.pulse += 0.01
        n.x += n.vx
        n.y += n.vy

        // Wrap around
        if (n.x < -10) n.x = W + 10
        if (n.x > W + 10) n.x = -10
        if (n.y < -10) n.y = H + 10
        if (n.y > H + 10) n.y = -10

        // Mouse repulsion
        const dx = n.x - mouseX
        const dy = n.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100 && dist > 0) {
          n.vx += (dx / dist) * 0.02
          n.vy += (dy / dist) * 0.02
        }

        // Speed cap
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (spd > 0.6) { n.vx *= 0.96; n.vy *= 0.96 }
      }

      // Draw connections per layer (only within same layer)
      for (let li = 0; li < LAYERS.length; li++) {
        const layer = LAYERS[li]
        const layerNodes = nodes.filter(n => n.layerIdx === li)
        const parallaxY = (scrollY * layer.speed) % H

        for (let i = 0; i < layerNodes.length; i++) {
          for (let j = i + 1; j < layerNodes.length; j++) {
            const a = layerNodes[i]
            const b = layerNodes[j]
            const dx = a.x - b.x
            const dy = (a.y - parallaxY) - (b.y - parallaxY)
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d > layer.maxDist) continue
            const alpha = ((1 - d / layer.maxDist) * layer.baseAlpha).toFixed(3)
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y - parallaxY)
            ctx!.lineTo(b.x, b.y - parallaxY)
            ctx!.strokeStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${alpha})`.replace('n.color', 'layer.color').split('n.color').join('')
            // Use layer color directly:
            ctx!.strokeStyle = `rgba(${layer.color[0]},${layer.color[1]},${layer.color[2]},${alpha})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      // Draw nodes with parallax offset
      for (const n of nodes) {
        const layer = LAYERS[n.layerIdx]
        const parallaxY = (scrollY * layer.speed) % H
        const breathe = 0.85 + Math.sin(n.pulse) * 0.15
        const radius = n.r * breathe
        const alpha = (layer.baseAlpha * 1.5 + Math.sin(n.pulse) * 0.04).toFixed(3)

        ctx!.beginPath()
        ctx!.arc(n.x, n.y - parallaxY, radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${alpha})`
        ctx!.fill()
      }

      // Horizontal scan line
      const t = Date.now() * 0.00012
      const scanY = ((t % 1) * H * 1.5) % H
      const scan = ctx!.createLinearGradient(0, scanY - 50, 0, scanY + 50)
      scan.addColorStop(0, 'rgba(30,110,255,0)')
      scan.addColorStop(0.5, 'rgba(30,110,255,0.018)')
      scan.addColorStop(1, 'rgba(30,110,255,0)')
      ctx!.fillStyle = scan
      ctx!.fillRect(0, scanY - 50, W, 100)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
