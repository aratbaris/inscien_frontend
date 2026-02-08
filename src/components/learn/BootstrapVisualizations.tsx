"use client"

import { useEffect, useRef } from "react"

const C = {
  bg: "#ffffff",
  text: "#1a1a1f",
  text2: "#4a4a56",
  text3: "#8a8a98",
  border: "#dddde3",
  blue: "#2563eb",
  blueLight: "rgba(37, 99, 235, 0.12)",
  blueMuted: "rgba(37, 99, 235, 0.35)",
  green: "#0f7b3f",
  red: "#dc2626",
  purple: "#7c3aed",
}

type Props = { width?: number; height?: number; phase?: "idle" | "animate" }

function generateBootstrapData() {
  const nHist = 240, nSims = 1000, horizon = 60
  const mu = 0.008, std = 0.045
  const rets: number[] = []
  for (let i = 0; i < nHist; i++) {
    const z = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
    rets.push(mu + std * z)
  }
  const prices: number[] = [2000]
  let p = 2000
  for (let i = 0; i < nHist; i++) { p *= (1 + rets[i]); prices.push(p) }
  const last = prices[prices.length - 1]

  const sims: number[][] = []
  for (let s = 0; s < nSims; s++) {
    const path = [last]; let v = last
    for (let m = 0; m < horizon; m++) { v *= (1 + rets[Math.floor(Math.random() * nHist)]); path.push(v) }
    sims.push(path)
  }

  const p5: number[] = [], med: number[] = [], p95: number[] = []
  for (let t = 0; t <= horizon; t++) {
    const vals = sims.map(s => s[t]).sort((a, b) => a - b)
    p5.push(vals[Math.floor(vals.length * 0.05)])
    med.push(vals[Math.floor(vals.length * 0.5)])
    p95.push(vals[Math.floor(vals.length * 0.95)])
  }

  const finalRets = sims.map(s => s[horizon] / last - 1)
  const sorted = [...finalRets].sort((a, b) => a - b)

  return {
    prices, rets, last,
    sims: sims.slice(0, 50),
    p5, med, p95, finalRets,
    fp5: sorted[Math.floor(sorted.length * 0.05)],
    fp50: sorted[Math.floor(sorted.length * 0.5)],
    fp95: sorted[Math.floor(sorted.length * 0.95)],
  }
}

let cache: ReturnType<typeof generateBootstrapData> | null = null
function getData() { if (!cache) cache = generateBootstrapData(); return cache }

function setup(canvas: HTMLCanvasElement, w: number, h: number) {
  const ctx = canvas.getContext("2d")!
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr; canvas.height = h * dpr
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

const STYLE: React.CSSProperties = { borderRadius: 8, border: `1px solid #dddde3` }

export function BootstrapQuestionVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const t = useRef(0)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 35, mB = 45
      const pW = width - mL - mR, pH = height - mT - mB

      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(mL, mT + pH); ctx.lineTo(mL + pW, mT + pH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(mL, mT); ctx.lineTo(mL, mT + pH); ctx.stroke()

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      ctx.fillText("Today", mL, mT + pH + 18)
      ctx.fillText("5 Years", mL + pW, mT + pH + 18)

      const todayX = mL, todayY = mT + pH * 0.6
      ctx.beginPath(); ctx.arc(todayX, todayY, 7, 0, Math.PI * 2)
      ctx.fillStyle = C.blue; ctx.fill()

      t.current += 0.02
      const fx = mL + pW * 0.85, fy = mT + pH * 0.5

      ctx.save(); ctx.globalAlpha = 0.1
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t.current
        const r = 35 + Math.sin(t.current * 2 + i) * 8
        ctx.beginPath(); ctx.arc(fx + Math.cos(a) * r * 0.5, fy + Math.sin(a) * r, 18, 0, Math.PI * 2)
        ctx.fillStyle = C.blue; ctx.fill()
      }
      ctx.restore()

      ctx.fillStyle = C.blue; ctx.font = "bold 42px system-ui"; ctx.textAlign = "center"
      ctx.fillText("?", fx, fy + 14)

      ctx.setLineDash([3, 3]); ctx.strokeStyle = C.text3; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(todayX + 8, todayY); ctx.lineTo(fx - 44, fy); ctx.stroke()
      ctx.setLineDash([])

      if (phase === "animate") animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapHistoryVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const data = getData(), prices = data.prices

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const mn = Math.min(...prices) * 0.9, mx = Math.max(...prices) * 1.1
      const mapX = (i: number) => mL + (i / (prices.length - 1)) * pW
      const mapY = (p: number) => mT + pH - ((p - mn) / (mx - mn)) * pH

      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(mL, mT + pH); ctx.lineTo(mL + pW, mT + pH); ctx.stroke()

      const progress = Math.min(prog.current, 1)
      const n = Math.floor(prices.length * progress)
      ctx.beginPath(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.8
      for (let i = 0; i < n; i++) { const x = mapX(i), y = mapY(prices[i]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
      ctx.stroke()

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      ctx.fillText("20 years ago", mL, mT + pH + 18)
      ctx.fillText("Today", mL + pW, mT + pH + 18)

      if (phase === "animate" && prog.current < 1) { prog.current += 0.02; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapReturnsTransformVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const rets = getData().rets.slice(0, 60)

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const maxA = Math.max(...rets.map(Math.abs)) * 1.2
      const mapX = (i: number) => mL + (i / (rets.length - 1)) * pW
      const mapY = (r: number) => mT + pH / 2 - (r / maxA) * (pH / 2)

      ctx.strokeStyle = C.text3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(mL, mapY(0)); ctx.lineTo(mL + pW, mapY(0)); ctx.stroke()
      ctx.setLineDash([])

      const progress = Math.min(prog.current, 1)
      const n = Math.floor(rets.length * progress)
      const bw = pW / rets.length * 0.75

      for (let i = 0; i < n; i++) {
        const x = mapX(i) - bw / 2, r = rets[i], y0 = mapY(0), y1 = mapY(r)
        ctx.fillStyle = r >= 0 ? C.green : C.red
        ctx.globalAlpha = 0.65
        ctx.fillRect(x, Math.min(y0, y1), bw, Math.abs(y1 - y0))
        ctx.globalAlpha = 1
      }

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "right"
      ctx.fillText(`+${(maxA * 100).toFixed(0)}%`, mL - 6, mapY(maxA) + 4)
      ctx.fillText("0%", mL - 6, mapY(0) + 4)
      ctx.fillText(`-${(maxA * 100).toFixed(0)}%`, mL - 6, mapY(-maxA) + 4)

      if (phase === "animate" && prog.current < 1) { prog.current += 0.03; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapHistogramVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const rets = getData().rets
    const bins = 30, mn = Math.min(...rets) * 1.1, mx = Math.max(...rets) * 1.1
    const bw = (mx - mn) / bins, counts = new Array(bins).fill(0)
    rets.forEach(r => { let i = Math.floor((r - mn) / bw); counts[Math.max(0, Math.min(bins - 1, i))]++ })
    const maxC = Math.max(...counts)

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const mapX = (r: number) => mL + ((r - mn) / (mx - mn)) * pW

      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(mL, mT + pH); ctx.lineTo(mL + pW, mT + pH); ctx.stroke()

      const progress = Math.min(prog.current, 1)
      ctx.fillStyle = C.blue
      for (let i = 0; i < bins; i++) {
        const l = mn + i * bw, x0 = mapX(l), x1 = mapX(l + bw)
        const h = (counts[i] * progress / maxC) * pH
        ctx.fillRect(x0, mT + pH - h, x1 - x0 - 1, h)
      }

      ctx.strokeStyle = C.text3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1
      const zx = mapX(0); ctx.beginPath(); ctx.moveTo(zx, mT); ctx.lineTo(zx, mT + pH); ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      for (let i = 0; i <= 4; i++) {
        const r = mn + (mx - mn) * (i / 4)
        ctx.fillText(`${(r * 100).toFixed(0)}%`, mapX(r), mT + pH + 16)
      }

      if (phase === "animate" && prog.current < 1) { prog.current += 0.03; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapSamplingVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const t = useRef(0)
  const sampled = useRef<number[]>([])

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const rets = getData().rets
    const bins = 25, mn = Math.min(...rets) * 1.1, mx = Math.max(...rets) * 1.1
    const bw = (mx - mn) / bins, counts = new Array(bins).fill(0)
    rets.forEach(r => { let i = Math.floor((r - mn) / bw); counts[Math.max(0, Math.min(bins - 1, i))]++ })
    const maxC = Math.max(...counts)

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 170, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const mapX = (r: number) => mL + ((r - mn) / (mx - mn)) * pW

      ctx.fillStyle = C.blueLight
      for (let i = 0; i < bins; i++) {
        const l = mn + i * bw, x0 = mapX(l), x1 = mapX(l + bw)
        const h = (counts[i] / maxC) * pH
        ctx.fillRect(x0, mT + pH - h, x1 - x0 - 1, h)
      }

      t.current += 1
      if (phase === "animate" && t.current % 15 === 0 && sampled.current.length < 12) {
        sampled.current.push(rets[Math.floor(Math.random() * rets.length)])
      }

      sampled.current.forEach((r, i) => {
        const x = mapX(r), tx = width - mR + 20, ty = mT + 18 + i * 16
        ctx.beginPath(); ctx.arc(x, mT + pH - 8, 5, 0, Math.PI * 2)
        ctx.fillStyle = C.purple; ctx.fill()

        ctx.strokeStyle = C.purple; ctx.globalAlpha = 0.2; ctx.setLineDash([2, 2])
        ctx.beginPath(); ctx.moveTo(x, mT + pH - 8); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.setLineDash([]); ctx.globalAlpha = 1
      })

      ctx.fillStyle = C.text; ctx.font = "bold 11px system-ui"; ctx.textAlign = "left"
      ctx.fillText("Sampled:", width - mR + 12, mT)
      ctx.font = "10px monospace"
      sampled.current.forEach((r, i) => {
        ctx.fillStyle = r >= 0 ? C.green : C.red
        ctx.fillText(`${(r * 100).toFixed(1)}%`, width - mR + 12, mT + 18 + i * 16)
      })

      if (phase === "animate") animRef.current = requestAnimationFrame(draw)
    }
    t.current = 0; sampled.current = []; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapSinglePathVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const data = getData(), path = data.sims[0], last = data.last

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 55, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const mn = Math.min(...path) * 0.9, mx = Math.max(...path) * 1.1
      const mapX = (i: number) => mL + (i / (path.length - 1)) * pW
      const mapY = (p: number) => mT + pH - ((p - mn) / (mx - mn)) * pH

      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(mL, mT + pH); ctx.lineTo(mL + pW, mT + pH); ctx.stroke()

      ctx.beginPath(); ctx.arc(mapX(0), mapY(last), 5, 0, Math.PI * 2)
      ctx.fillStyle = C.text; ctx.fill()

      const progress = Math.min(prog.current, 1)
      const n = Math.floor(path.length * progress)
      ctx.beginPath(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2
      for (let i = 0; i < n; i++) { const x = mapX(i), y = mapY(path[i]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
      ctx.stroke()

      if (n >= path.length) {
        const ex = mapX(path.length - 1), ey = mapY(path[path.length - 1])
        ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fillStyle = C.blue; ctx.fill()
        const ret = (path[path.length - 1] / last - 1) * 100
        ctx.fillStyle = C.blue; ctx.font = "bold 11px system-ui"; ctx.textAlign = "left"
        ctx.fillText(`${ret >= 0 ? "+" : ""}${ret.toFixed(0)}%`, ex + 10, ey + 4)
      }

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      ctx.fillText("Today", mL, mT + pH + 18); ctx.fillText("5 Years", mL + pW, mT + pH + 18)

      if (phase === "animate" && prog.current < 1) { prog.current += 0.02; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapManyPathsVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const data = getData(), paths = data.sims, last = data.last

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      let mn = Infinity, mx = -Infinity
      paths.forEach(p => p.forEach(v => { if (v < mn) mn = v; if (v > mx) mx = v }))
      mn *= 0.9; mx *= 1.1
      const mapX = (i: number) => mL + (i / (paths[0].length - 1)) * pW
      const mapY = (p: number) => mT + pH - ((p - mn) / (mx - mn)) * pH

      const progress = Math.min(prog.current, 1)
      const n = Math.floor(paths.length * progress)
      ctx.globalAlpha = 0.2; ctx.strokeStyle = C.blue; ctx.lineWidth = 0.8
      for (let p = 0; p < n; p++) {
        ctx.beginPath()
        for (let i = 0; i < paths[p].length; i++) { const x = mapX(i), y = mapY(paths[p][i]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      ctx.beginPath(); ctx.arc(mapX(0), mapY(last), 5, 0, Math.PI * 2)
      ctx.fillStyle = C.text; ctx.fill()

      ctx.fillStyle = C.blue; ctx.font = "bold 12px system-ui"; ctx.textAlign = "right"
      ctx.fillText(`${n} paths`, mL + pW, mT + 16)

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      ctx.fillText("Today", mL, mT + pH + 18); ctx.fillText("5 Years", mL + pW, mT + pH + 18)

      if (phase === "animate" && prog.current < 1) { prog.current += 0.02; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapConfidenceBandVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const data = getData(), { p5, med, p95, last } = data

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const all = [...p5, ...p95], mn = Math.min(...all) * 0.9, mx = Math.max(...all) * 1.1
      const mapX = (i: number) => mL + (i / (med.length - 1)) * pW
      const mapY = (p: number) => mT + pH - ((p - mn) / (mx - mn)) * pH

      const progress = Math.min(prog.current, 1)
      const n = Math.floor(med.length * progress)

      ctx.beginPath()
      for (let i = 0; i < n; i++) ctx.lineTo(mapX(i), mapY(p5[i]))
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(mapX(i), mapY(p95[i]))
      ctx.closePath(); ctx.fillStyle = C.blueLight; ctx.fill()

      ctx.beginPath(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2
      for (let i = 0; i < n; i++) { const x = mapX(i), y = mapY(med[i]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
      ctx.stroke()

      ctx.beginPath(); ctx.arc(mapX(0), mapY(last), 5, 0, Math.PI * 2)
      ctx.fillStyle = C.text; ctx.fill()

      if (progress >= 1) {
        ctx.fillStyle = C.blue; ctx.font = "11px system-ui"; ctx.textAlign = "left"
        ctx.fillText("Median", mL + 8, mT + 14)
        ctx.fillStyle = C.blueMuted; ctx.fillText("90% band", mL + 8, mT + 28)
      }

      ctx.fillStyle = C.text3; ctx.font = "11px system-ui"; ctx.textAlign = "center"
      ctx.fillText("Today", mL, mT + pH + 18); ctx.fillText("5 Years", mL + pW, mT + pH + 18)

      if (phase === "animate" && prog.current < 1) { prog.current += 0.02; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapFinalDistVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const prog = useRef(phase === "animate" ? 0 : 1)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const data = getData(), { finalRets, fp5, fp50, fp95 } = data
    const bins = 40, mn = Math.min(...finalRets) * 1.1, mx = Math.max(...finalRets) * 1.1
    const bw = (mx - mn) / bins, counts = new Array(bins).fill(0)
    finalRets.forEach(r => { let i = Math.floor((r - mn) / bw); counts[Math.max(0, Math.min(bins - 1, i))]++ })
    const maxC = Math.max(...counts)

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      const mL = 55, mR = 35, mT = 28, mB = 42
      const pW = width - mL - mR, pH = height - mT - mB
      const mapX = (r: number) => mL + ((r - mn) / (mx - mn)) * pW

      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(mL, mT + pH); ctx.lineTo(mL + pW, mT + pH); ctx.stroke()

      const progress = Math.min(prog.current, 1)
      ctx.fillStyle = C.blue
      for (let i = 0; i < bins; i++) {
        const l = mn + i * bw, x0 = mapX(l), x1 = mapX(l + bw)
        const h = (counts[i] * progress / maxC) * pH
        ctx.fillRect(x0, mT + pH - h, x1 - x0 - 1, h)
      }

      if (progress >= 0.8) {
        const a = (progress - 0.8) / 0.2; ctx.globalAlpha = a
        ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5
        ctx.strokeStyle = C.text3; ctx.beginPath(); ctx.moveTo(mapX(fp5), mT); ctx.lineTo(mapX(fp5), mT + pH); ctx.stroke()
        ctx.strokeStyle = C.text; ctx.beginPath(); ctx.moveTo(mapX(fp50), mT); ctx.lineTo(mapX(fp50), mT + pH); ctx.stroke()
        ctx.strokeStyle = C.text3; ctx.beginPath(); ctx.moveTo(mapX(fp95), mT); ctx.lineTo(mapX(fp95), mT + pH); ctx.stroke()
        ctx.setLineDash([]); ctx.globalAlpha = 1

        ctx.font = "10px system-ui"; ctx.textAlign = "center"
        ctx.fillStyle = C.text3; ctx.fillText("5th", mapX(fp5), mT - 4)
        ctx.fillStyle = C.text; ctx.fillText("50th", mapX(fp50), mT - 4)
        ctx.fillStyle = C.text3; ctx.fillText("95th", mapX(fp95), mT - 4)
      }

      if (phase === "animate" && prog.current < 1) { prog.current += 0.02; animRef.current = requestAnimationFrame(draw) }
    }
    prog.current = phase === "animate" ? 0 : 1; draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}

export function BootstrapInsightVisualization({ width = 560, height = 260, phase = "idle" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const t = useRef(0)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = setup(canvas, width, height)
    const data = getData(), { fp5, fp50, fp95 } = data

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height)
      t.current += 0.02
      const cy = height / 2

      const boxes = [
        { label: "Downside (5th)", value: fp5, x: width * 0.2, color: C.red },
        { label: "Median (50th)", value: fp50, x: width * 0.5, color: C.blue },
        { label: "Upside (95th)", value: fp95, x: width * 0.8, color: C.green },
      ]

      boxes.forEach((b, i) => {
        const s = 1 + Math.sin(t.current * 2 + i) * 0.015
        const bW = 130 * s, bH = 90 * s

        ctx.fillStyle = `${b.color}0a`; ctx.strokeStyle = b.color; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(b.x - bW / 2, cy - bH / 2, bW, bH, 10); ctx.fill(); ctx.stroke()

        ctx.fillStyle = C.text3; ctx.font = "10px system-ui"; ctx.textAlign = "center"
        ctx.fillText(b.label, b.x, cy - 22)

        ctx.fillStyle = b.color; ctx.font = "bold 24px system-ui"
        ctx.fillText(`${(b.value * 100).toFixed(0)}%`, b.x, cy + 8)

        ctx.fillStyle = C.text3; ctx.font = "10px system-ui"
        ctx.fillText("5-year return", b.x, cy + 28)
      })

      ctx.strokeStyle = C.border; ctx.setLineDash([3, 3]); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(boxes[0].x + 72, cy); ctx.lineTo(boxes[1].x - 72, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(boxes[1].x + 72, cy); ctx.lineTo(boxes[2].x - 72, cy); ctx.stroke()
      ctx.setLineDash([])

      if (phase === "animate") animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, phase])

  return <canvas ref={ref} style={STYLE} />
}