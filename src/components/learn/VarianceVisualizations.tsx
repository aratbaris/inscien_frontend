"use client"

import { useEffect, useRef } from "react"

const C = {
  bg: "#ffffff",
  orange: "#d97706",
  blue: "#2563eb",
  red: "#dc2626",
  purple: "#7c3aed",
  text: "#1a1a1f",
  text2: "#4a4a56",
  text3: "#8a8a98",
  border: "#dddde3",
  borderHover: "#c5c5ce",
}

type Props = {
  width?: number
  height?: number
  phase?: "idle" | "jitter" | "complete"
  activeDot?: "orange" | "blue" | "red" | "all" | "none"
}

export function VarianceDotVisualization({
  width = 560,
  height = 260,
  phase = "idle",
  activeDot = "orange",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const dotR = 20
    const dots = [
      { x: width * 0.2, y: height * 0.42, color: C.orange, label: "Low", amp: 2 },
      { x: width * 0.5, y: height * 0.42, color: C.blue, label: "Med", amp: 8 },
      { x: width * 0.8, y: height * 0.42, color: C.red, label: "High", amp: 20 },
    ]

    const sliderW = 90
    const sliderY = height - 50

    const draw = () => {
      ctx.fillStyle = C.bg
      ctx.fillRect(0, 0, width, height)

      dots.forEach((d, i) => {
        const isActive =
          activeDot === "all" ||
          (activeDot === "orange" && i === 0) ||
          (activeDot === "blue" && i === 1) ||
          (activeDot === "red" && i === 2)

        ctx.globalAlpha = isActive || activeDot === "none" ? 1 : 0.25

        let jx = 0, jy = 0
        if (phase === "jitter" && isActive) {
          jx = (Math.random() - 0.5) * d.amp
          jy = (Math.random() - 0.5) * d.amp
        }

        ctx.beginPath()
        ctx.arc(d.x + jx, d.y + jy, dotR, 0, Math.PI * 2)
        ctx.fillStyle = d.color
        ctx.fill()

        // Slider track
        const sx = d.x - sliderW / 2
        ctx.strokeStyle = C.border
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(sx, sliderY)
        ctx.lineTo(sx + sliderW, sliderY)
        ctx.stroke()

        // Handle
        const hx = sx + (d.amp / 25) * sliderW
        ctx.beginPath()
        ctx.arc(hx, sliderY, 5, 0, Math.PI * 2)
        ctx.fillStyle = d.color
        ctx.fill()

        // Labels
        ctx.fillStyle = C.text3
        ctx.font = "11px system-ui"
        ctx.textAlign = "center"
        ctx.fillText("Low", sx - 16, sliderY + 4)
        ctx.fillText("High", sx + sliderW + 20, sliderY + 4)

        ctx.globalAlpha = 1
      })

      if (phase === "jitter") animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase, activeDot])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function VarianceCloudVisualization({
  width = 560,
  height = 260,
  phase = "idle",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, width, height)

    const clouds = [
      { cx: width * 0.2, cy: height * 0.45, spread: 22, color: C.orange, n: 30 },
      { cx: width * 0.5, cy: height * 0.45, spread: 38, color: C.blue, n: 40 },
      { cx: width * 0.8, cy: height * 0.45, spread: 55, color: C.red, n: 50 },
    ]

    clouds.forEach((c) => {
      for (let i = 0; i < c.n; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random() * c.spread
        ctx.beginPath()
        ctx.arc(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, 3.5, 0, Math.PI * 2)
        ctx.strokeStyle = c.color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })

    if (phase === "complete") {
      ctx.strokeStyle = C.text
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(40, height - 40)
      ctx.lineTo(width - 40, height - 40)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(40, height - 40)
      ctx.lineTo(40, 30)
      ctx.stroke()
    }
  }, [width, height, phase])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function VarianceDeviationVisualization({
  width = 560,
  height = 260,
  phase = "idle",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, width, height)

    const cx = width / 2
    const axisY = height - 50

    ctx.strokeStyle = C.border
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(60, axisY)
    ctx.lineTo(width - 60, axisY)
    ctx.stroke()

    // Mean line
    ctx.strokeStyle = C.purple
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(cx, axisY)
    ctx.lineTo(cx, 50)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = C.purple
    ctx.font = "13px system-ui"
    ctx.textAlign = "center"
    ctx.fillText("μ (mean)", cx, 40)

    const samples = [
      { x: cx - 80, y: 110 },
      { x: cx - 35, y: 90 },
      { x: cx + 30, y: 85 },
      { x: cx + 65, y: 120 },
      { x: cx + 95, y: 100 },
    ]

    if (phase === "jitter" || phase === "complete") {
      samples.forEach((s) => {
        ctx.strokeStyle = C.text3
        ctx.setLineDash([3, 3])
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(cx, s.y)
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    samples.forEach((s) => {
      ctx.beginPath()
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = C.text
      ctx.fill()
    })

    if (phase === "complete") {
      ctx.fillStyle = C.purple
      ctx.font = "15px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("(xᵢ − μ)²", cx, height - 15)
    }
  }, [width, height, phase])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function VarianceFormulaVisualization({
  width = 500,
  height = 180,
  phase = "idle",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = C.purple
    ctx.textAlign = "center"

    if (phase === "idle") {
      ctx.font = "bold 22px system-ui"
      ctx.fillText("Σ (xᵢ − μ)²", width / 2, height / 2 + 6)
    } else if (phase === "jitter") {
      ctx.font = "18px system-ui"
      ctx.fillText("Var(X) = (1/n) Σ (xᵢ − μ)²", width / 2, height / 2 + 6)
    } else {
      ctx.font = "bold 26px system-ui"
      ctx.fillText("Var(X) = 123", width / 2, height / 2 + 6)
    }
  }, [width, height, phase])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function VarianceThreeCurvesVisualization({
  width = 560,
  height = 280,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, width, height)

    const curves = [
      { cx: width * 0.2, color: C.orange, variance: 123, amp: 75, spread: 28 },
      { cx: width * 0.5, color: C.blue, variance: 224, amp: 55, spread: 45 },
      { cx: width * 0.8, color: C.red, variance: 356, amp: 40, spread: 65 },
    ]
    const baseY = height - 70

    ctx.strokeStyle = C.border
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(30, baseY)
    ctx.lineTo(width - 30, baseY)
    ctx.stroke()

    curves.forEach((cv) => {
      ctx.beginPath()
      ctx.strokeStyle = cv.color
      ctx.lineWidth = 2.5
      for (let i = -cv.spread; i <= cv.spread; i++) {
        const x = cv.cx + i * 2
        const n = i / cv.spread
        const y = baseY - cv.amp * Math.exp(-n * n * 2)
        i === -cv.spread ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.fillStyle = cv.color
      ctx.font = "13px system-ui"
      ctx.textAlign = "center"
      ctx.fillText(`Var = ${cv.variance}`, cv.cx, height - 25)
    })
  }, [width, height])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}