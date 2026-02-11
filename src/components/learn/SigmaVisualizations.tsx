"use client"

import { useEffect, useRef } from "react"

const C = {
  bg: "#ffffff",
  orange: "#d97706",
  purple: "#7c3aed",
  green: "#0f7b3f",
  text: "#1a1a1f",
  text2: "#4a4a56",
  text3: "#8a8a98",
  border: "#dddde3",
}

type Props = {
  width?: number
  height?: number
  phase?: "idle" | "active" | "complete"
}

export function SigmaBallVisualization({
  width = 480,
  height = 280,
  phase = "idle",
  sigmaLevel = 0.1,
}: Props & { sigmaLevel?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const ringsRef = useRef<{ x: number; y: number; opacity: number }[]>([])
  const ballRef = useRef({ x: 0, y: 0 })

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

    const cx = width / 2, cy = height * 0.36
    const ballR = 24
    const sliderY = height - 55
    const sliderW = 140, sliderX = cx - sliderW / 2

    ballRef.current = { x: cx, y: cy }

    const bracketW = 36 + sigmaLevel * 260
    const bracketY = cy + ballR + 18 + sigmaLevel * 35

    const draw = () => {
      ctx.fillStyle = C.bg
      ctx.fillRect(0, 0, width, height)

      ringsRef.current = ringsRef.current.filter((r) => r.opacity > 0.05)
      ringsRef.current.forEach((r) => {
        ctx.beginPath()
        ctx.arc(r.x, r.y, ballR, 0, Math.PI * 2)
        ctx.strokeStyle = C.orange
        ctx.globalAlpha = r.opacity
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.globalAlpha = 1
        r.opacity *= 0.96
      })

      if (phase === "active") {
        const amp = sigmaLevel * 70
        const jx = (Math.random() - 0.5) * amp
        const jy = (Math.random() - 0.5) * amp
        ballRef.current = { x: cx + jx, y: cy + jy }
        if (Math.random() > 0.7) {
          ringsRef.current.push({ x: ballRef.current.x, y: ballRef.current.y, opacity: 0.6 })
        }
      } else {
        ballRef.current = { x: cx, y: cy }
      }

      ctx.beginPath()
      ctx.arc(ballRef.current.x, ballRef.current.y, ballR, 0, Math.PI * 2)
      ctx.fillStyle = C.orange
      ctx.fill()

      // Bracket
      const bL = cx - bracketW / 2, bR = cx + bracketW / 2
      ctx.strokeStyle = C.text
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(bL, bracketY - 10)
      ctx.lineTo(bL, bracketY)
      ctx.lineTo(bR, bracketY)
      ctx.lineTo(bR, bracketY - 10)
      ctx.stroke()

      ctx.fillStyle = C.text
      ctx.font = "14px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("σ", cx, bracketY + 18)

      // Slider
      ctx.strokeStyle = C.border
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sliderX, sliderY)
      ctx.lineTo(sliderX + sliderW, sliderY)
      ctx.stroke()

      const hx = sliderX + sigmaLevel * sliderW
      ctx.beginPath()
      ctx.arc(hx, sliderY, 6, 0, Math.PI * 2)
      ctx.fillStyle = C.orange
      ctx.fill()

      ctx.fillStyle = C.text3
      ctx.font = "12px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("0.0", sliderX - 18, sliderY + 4)
      ctx.fillText("1.0", sliderX + sliderW + 18, sliderY + 4)

      ctx.fillStyle = C.text
      ctx.font = "13px system-ui"
      ctx.fillText(`σ = ${sigmaLevel.toFixed(1)}`, cx, sliderY + 30)

      if (phase === "active") animRef.current = requestAnimationFrame(draw)
    }

    draw()
    if (phase === "active") animRef.current = requestAnimationFrame(draw)

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase, sigmaLevel])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function SigmaGaussianVisualization({
  width = 560,
  height = 300,
  showOneSigma = false,
  showTwoSigma = false,
  showMean = true,
  showRings = false,
}: Props & { showOneSigma?: boolean; showTwoSigma?: boolean; showMean?: boolean; showRings?: boolean }) {
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

    const mL = 50, mR = 50, mT = 35, mB = 70
    const cW = width - mL - mR, cH = height - mT - mB
    const baseY = mT + cH, centerX = mL + cW / 2
    const amp = cH * 0.85, sigW = cW / 6

    const g = (x: number) => Math.exp(-0.5 * x * x)

    ctx.strokeStyle = C.border
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(mL, baseY); ctx.lineTo(mL + cW, baseY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(mL, baseY); ctx.lineTo(mL, mT); ctx.stroke()

    if (showTwoSigma) {
      const l2 = centerX - 2 * sigW, r2 = centerX + 2 * sigW
      ctx.fillStyle = `${C.green}12`
      ctx.beginPath(); ctx.moveTo(l2, baseY)
      for (let x = l2; x <= r2; x += 2) ctx.lineTo(x, baseY - amp * g((x - centerX) / sigW))
      ctx.lineTo(r2, baseY); ctx.closePath(); ctx.fill()

      ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
      const y2 = baseY - amp * g(2)
      ctx.beginPath(); ctx.moveTo(l2, baseY); ctx.lineTo(l2, y2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(r2, baseY); ctx.lineTo(r2, y2); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.green; ctx.font = "12px system-ui"; ctx.textAlign = "center"
      ctx.fillText("95% - 2σ", centerX + 2 * sigW + 28, baseY - amp * 0.3)
    }

    if (showOneSigma) {
      const l1 = centerX - sigW, r1 = centerX + sigW
      ctx.fillStyle = `${C.green}22`
      ctx.beginPath(); ctx.moveTo(l1, baseY)
      for (let x = l1; x <= r1; x += 2) ctx.lineTo(x, baseY - amp * g((x - centerX) / sigW))
      ctx.lineTo(r1, baseY); ctx.closePath(); ctx.fill()

      ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
      const y1 = baseY - amp * g(1)
      ctx.beginPath(); ctx.moveTo(l1, baseY); ctx.lineTo(l1, y1); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(r1, baseY); ctx.lineTo(r1, y1); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.green; ctx.font = "12px system-ui"; ctx.textAlign = "center"
      ctx.fillText("68% - 1σ", centerX + sigW + 28, baseY - amp * 0.5)
    }

    if (showRings) {
      for (let i = 0; i < 35; i++) {
        const nx = (Math.random() - 0.5) * 4
        const my = g(nx)
        ctx.beginPath()
        ctx.arc(centerX + nx * sigW, baseY - Math.random() * my * amp * 0.9, 3.5, 0, Math.PI * 2)
        ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2; ctx.stroke()
      }
    }

    ctx.beginPath(); ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5
    for (let x = mL; x <= mL + cW; x += 2) {
      const y = baseY - amp * g((x - centerX) / sigW)
      x === mL ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()

    if (showMean) {
      ctx.strokeStyle = C.purple; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
      ctx.beginPath(); ctx.moveTo(centerX, baseY); ctx.lineTo(centerX, baseY - amp); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = C.purple; ctx.font = "13px system-ui"; ctx.textAlign = "center"
      ctx.fillText("mean", centerX, mT - 8)
    }

    if (showOneSigma) {
      const by = baseY + 22
      ctx.strokeStyle = C.text; ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(centerX, by - 7); ctx.lineTo(centerX, by)
      ctx.lineTo(centerX + sigW, by); ctx.lineTo(centerX + sigW, by - 7)
      ctx.stroke()
      ctx.fillStyle = C.text; ctx.font = "13px system-ui"; ctx.textAlign = "center"
      ctx.fillText("σ", centerX + sigW / 2, by + 16)
    }
  }, [width, height, showOneSigma, showTwoSigma, showMean, showRings])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function SigmaSamplePointsVisualization({
  width = 560,
  height = 320,
  showFormula = false,
}: Props & { showFormula?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr; canvas.height = height * dpr
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)

    const mL = 50, mR = 50, mT = 35, mB = showFormula ? 90 : 55
    const cW = width - mL - mR, cH = height - mT - mB
    const baseY = mT + cH, cx = mL + cW / 2
    const amp = cH * 0.85, sigW = cW / 6
    const g = (x: number) => Math.exp(-0.5 * x * x)

    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(mL, baseY); ctx.lineTo(mL + cW, baseY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(mL, baseY); ctx.lineTo(mL, mT); ctx.stroke()

    ctx.beginPath(); ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5
    for (let x = mL; x <= mL + cW; x += 2) {
      const y = baseY - amp * g((x - cx) / sigW)
      x === mL ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.strokeStyle = C.purple; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx, baseY - amp); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = C.purple; ctx.font = "13px system-ui"; ctx.textAlign = "center"
    ctx.fillText("μ", cx, mT - 8)

    const pts = [-1.5, -0.8, -0.2, 0.5, 1.2].map((nx) => ({
      x: cx + nx * sigW, y: baseY - amp * g(nx), nx,
    }))

    pts.forEach((p) => {
      ctx.strokeStyle = C.text3; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cx, p.y); ctx.stroke()
      ctx.setLineDash([])
    })

    pts.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = C.orange; ctx.fill()
      ctx.fillStyle = C.text; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      ctx.fillText(`x${i + 1}`, p.x + (p.nx < 0 ? -12 : 12), p.y - 10)
    })

    if (showFormula) {
      ctx.fillStyle = C.text; ctx.font = "16px system-ui"; ctx.textAlign = "center"
      ctx.fillText("σ = √(1/n · Σ(xᵢ − μ)²)", cx, baseY + 42)
    }
  }, [width, height, showFormula])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function SigmaSymmetryVisualization({
  width = 560,
  height = 300,
  showAsymmetric = false,
}: Props & { showAsymmetric?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr; canvas.height = height * dpr
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)

    const mL = 50, mR = 50, mT = 45, mB = 70
    const cW = width - mL - mR, cH = height - mT - mB
    const baseY = mT + cH, cx = mL + cW / 2
    const amp = cH * 0.85, sigW = cW / 6
    const skew = showAsymmetric ? 0.35 : 0
    const sg = (x: number) => Math.exp(-0.5 * (x + skew * 3) ** 2)

    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(mL, baseY); ctx.lineTo(mL + cW, baseY); ctx.stroke()

    let peakX = cx, peakY = 0
    for (let x = mL; x <= mL + cW; x += 2) {
      const y = amp * sg((x - cx) / sigW)
      if (y > peakY) { peakY = y; peakX = x }
    }

    ctx.beginPath(); ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5
    for (let x = mL; x <= mL + cW; x += 2) {
      const y = baseY - amp * sg((x - cx) / sigW)
      x === mL ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.strokeStyle = C.purple; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(peakX, baseY); ctx.lineTo(peakX, baseY - peakY); ctx.stroke()
    ctx.setLineDash([])

    const lx = peakX - sigW, rx = peakX + sigW
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(lx, baseY); ctx.lineTo(lx, baseY - amp * sg((lx - cx) / sigW)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(rx, baseY); ctx.lineTo(rx, baseY - amp * sg((rx - cx) / sigW)); ctx.stroke()
    ctx.setLineDash([])

    const by = baseY + 18
    ctx.strokeStyle = C.text; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(lx, by - 8); ctx.lineTo(lx, by); ctx.lineTo(peakX, by); ctx.lineTo(peakX, by - 8); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(peakX, by - 8); ctx.lineTo(peakX, by); ctx.lineTo(rx, by); ctx.lineTo(rx, by - 8); ctx.stroke()

    ctx.fillStyle = C.text; ctx.font = "12px system-ui"; ctx.textAlign = "center"
    if (showAsymmetric) {
      ctx.fillText("8%", (lx + peakX) / 2, by + 16)
      ctx.fillText("2%", (peakX + rx) / 2, by + 16)
      ctx.font = "13px system-ui"; ctx.fillText("Skewed: ranges don't match", cx, mT - 18)
    } else {
      ctx.fillText("5%", (lx + peakX) / 2, by + 16)
      ctx.fillText("5%", (peakX + rx) / 2, by + 16)
      ctx.font = "13px system-ui"; ctx.fillText("Symmetric: equal on both sides", cx, mT - 18)
    }
  }, [width, height, showAsymmetric])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function SigmaComparisonVisualization({ width = 560, height = 280 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr; canvas.height = height * dpr
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)

    const cW = width * 0.36, cH = height * 0.5, baseY = height * 0.68, amp = cH
    const lcx = width * 0.27, rcx = width * 0.73, sigW = cW / 4

    const drawChart = (cx: number, skew: number, range: string) => {
      const sg = (x: number) => Math.exp(-0.5 * (x + skew * 3) ** 2)
      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx - cW / 2, baseY); ctx.lineTo(cx + cW / 2, baseY); ctx.stroke()

      ctx.beginPath(); ctx.strokeStyle = C.purple; ctx.lineWidth = 2
      for (let i = 0; i <= 60; i++) {
        const t = i / 60, x = cx + (t - 0.5) * cW
        const y = baseY - amp * sg((x - cx) / sigW)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.fillStyle = C.text; ctx.font = "13px system-ui"; ctx.textAlign = "center"
      ctx.fillText(range, cx, baseY + 22)
      ctx.fillStyle = C.text3; ctx.font = "12px system-ui"
      ctx.fillText("σ = 0.5", cx, baseY + 40)
    }

    ctx.fillStyle = C.text; ctx.font = "13px system-ui"; ctx.textAlign = "center"
    ctx.fillText("Same σ, different distributions → different ranges", width / 2, 26)

    drawChart(lcx, 0, "5% - 15%")
    drawChart(rcx, 0.4, "2% - 12%")
  }, [width, height])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function SigmaSummaryVisualization({ width = 480, height = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr; canvas.height = height * dpr
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)

    const cx = width / 2, cy = height / 2 - 8
    ctx.fillStyle = C.text; ctx.font = "bold 26px system-ui"; ctx.textAlign = "center"
    ctx.fillText("μ ± σ", cx, cy - 18)
    ctx.font = "18px system-ui"; ctx.fillText("10% ± 5%", cx, cy + 20)

    ctx.strokeStyle = C.orange; ctx.lineWidth = 2
    ctx.strokeRect(cx - 72, cy + 2, 144, 30)

    ctx.fillStyle = C.text3; ctx.font = "13px system-ui"
    ctx.fillText("Know the limitations", cx, cy + 65)
    ctx.font = "11px system-ui"; ctx.fillText("(assumes normal distribution)", cx, cy + 82)
  }, [width, height])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}

export function SigmaNormalVisualization({ width = 560, height = 280 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr; canvas.height = height * dpr
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)

    const mL = 55, mR = 55, mT = 40, mB = 60
    const cW = width - mL - mR, cH = height - mT - mB
    const baseY = mT + cH, cx = mL + cW / 2, amp = cH * 0.88, sigW = cW / 6
    const g = (x: number) => Math.exp(-0.5 * x * x)

    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(mL, baseY); ctx.lineTo(mL + cW, baseY); ctx.stroke()

    const l1 = cx - sigW, r1 = cx + sigW
    ctx.fillStyle = `${C.green}22`
    ctx.beginPath(); ctx.moveTo(l1, baseY)
    for (let x = l1; x <= r1; x += 2) ctx.lineTo(x, baseY - amp * g((x - cx) / sigW))
    ctx.lineTo(r1, baseY); ctx.closePath(); ctx.fill()

    ctx.beginPath(); ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5
    for (let x = mL; x <= mL + cW; x += 2) {
      const y = baseY - amp * g((x - cx) / sigW)
      x === mL ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.fillStyle = C.text2; ctx.font = "13px system-ui"; ctx.textAlign = "center"
    ctx.fillText("Most phenomena approximate a normal distribution", cx, baseY + 38)
  }, [width, height])

  return <canvas ref={canvasRef} style={{ borderRadius: 8, border: `1px solid ${C.border}` }} />
}