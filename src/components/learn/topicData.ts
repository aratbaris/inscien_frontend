import { ReactNode } from "react"

export type Step = {
  title: string
  subtitle: string
  insight: string
  context?: string
  vizKey: string
  vizProps?: Record<string, unknown>
}

export type Topic = {
  id: string
  title: string
  tag: string
  desc: string
  steps: Step[]
}

export const topics: Topic[] = [
  {
    id: "variance",
    title: "Understanding Variance",
    tag: "Statistics",
    desc: "From visual intuition to mathematical precision — see how variance captures the 'jitter' in data.",
    steps: [
      { title: "Meet a low-risk asset", subtitle: "Imagine watching an asset's price over time. This one barely moves — stable, predictable, low risk.", insight: "The orange dot represents our low-risk asset. Notice how it barely jitters around its center position.", vizKey: "var-dot", vizProps: { activeDot: "orange" } },
      { title: "Now a medium-risk asset", subtitle: "This blue asset moves more. Still somewhat predictable, but noticeably more variation.", insight: "Compare the blue dot's movement to orange. The jitter is wider — more \"risk\" in terms of price variation.", context: "Low-risk assets are stable, barely moving from center.", vizKey: "var-dot", vizProps: { activeDot: "blue" } },
      { title: "And a high-risk asset", subtitle: "The red asset is volatile. It swings wildly, making it harder to predict.", insight: "High volatility means high uncertainty. This \"jitter\" is exactly what we want to measure — that measurement is called variance.", context: "Medium-risk assets show more variation.", vizKey: "var-dot", vizProps: { activeDot: "red" } },
      { title: "Compare all three", subtitle: "All three assets side by side. Watch how their movement patterns differ.", insight: "How do we turn this visual intuition — \"this one moves more\" — into a precise number?", context: "High-risk assets show dramatic swings.", vizKey: "var-dot", vizProps: { activeDot: "all" } },
      { title: "Sampling positions over time", subtitle: "Taking snapshots at regular intervals. Each captures where the asset was.", insight: "Each small circle is one \"sample\". The low-risk asset clusters tightly; the high-risk spreads widely.", context: "We need to convert visual \"jitter\" into a measurable number.", vizKey: "var-cloud", vizProps: { phase: "idle" } },
      { title: "From samples to distributions", subtitle: "Collect enough samples and you see the shape. The spread tells us about risk.", insight: "Narrow and tall means predictable. Wide and flat means anything could happen.", context: "Tight clusters = low risk, wide spread = high risk.", vizKey: "var-cloud", vizProps: { phase: "complete" } },
      { title: "Finding the center: the mean", subtitle: "To measure spread, we need a reference. The mean (μ) is the \"center of gravity\".", insight: "The purple dashed line shows the mean. All spread measurements are relative to this point.", context: "Now we need to measure the spread.", vizKey: "var-dev", vizProps: { phase: "idle" } },
      { title: "Measuring deviations", subtitle: "A \"deviation\" is how far each sample is from the mean.", insight: "Each dashed line shows (xᵢ − μ). The length tells us how \"wrong\" that sample was.", context: "The mean gives us a center point.", vizKey: "var-dev", vizProps: { phase: "jitter" } },
      { title: "Why we square the deviations", subtitle: "Squaring makes them all positive and emphasizes larger deviations.", insight: "(xᵢ − μ)² is always positive. A sample twice as far contributes four times as much.", context: "Positive and negative deviations would cancel out.", vizKey: "var-dev", vizProps: { phase: "complete" } },
      { title: "Sum up all squared deviations", subtitle: "Add them up for the total \"spread energy\" in our data.", insight: "Σ means \"sum of\". So Σ(xᵢ − μ)² = add up all the squared deviations.", context: "Squaring emphasizes outliers.", vizKey: "var-formula", vizProps: { phase: "idle" } },
      { title: "The variance formula", subtitle: "Divide by n to get the average squared deviation. This is variance.", insight: "Var(X) = (1/n) × Σ(xᵢ − μ)². Higher variance = more spread = more risk.", context: "We need to normalize by sample count.", vizKey: "var-formula", vizProps: { phase: "jitter" } },
      { title: "Variance as a number", subtitle: "A single number. For our low-risk asset, maybe 123.", insight: "By itself \"123\" doesn't mean much. Comparison makes it meaningful.", context: "Variance is the average squared deviation.", vizKey: "var-formula", vizProps: { phase: "complete" } },
      { title: "Comparing variance across assets", subtitle: "Now compare all three. The numbers confirm what we saw visually.", insight: "Orange (123) is tightest. Blue (224) wider. Red (356) most spread. Variance matches intuition.", context: "A variance number needs context.", vizKey: "var-curves" },
      { title: "Full circle: variance IS the jitter", subtitle: "We started by watching dots jitter. Now you know variance measures that jitter precisely.", insight: "Variance transforms intuitive \"this moves more\" into rigorous \"variance 356 vs 123\". It's the foundation for risk analysis.", context: "Higher variance = wider distribution = more risk.", vizKey: "var-dot", vizProps: { activeDot: "all" } },
    ],
  },
  {
    id: "sigma",
    title: "Standard Deviation (σ)",
    tag: "Statistics",
    desc: "How σ measures spread, the 68-95-99.7 rule, and when ±σ notation breaks down.",
    steps: [
      { title: "Meet σ — it measures spread", subtitle: "Standard deviation (σ) tells you how much values typically deviate from the average.", insight: "With σ = 0.1, the ball barely moves from center. The bracket shows the range σ covers.", vizKey: "sig-ball", vizProps: { sigmaLevel: 0.1 } },
      { title: "Small σ = tight cluster", subtitle: "When σ is small, values stay close to the average. Predictions are reliable.", insight: "The bracket remains narrow. Most observations fall within this tight range.", context: "σ measures how spread out values are from the mean.", vizKey: "sig-ball", vizProps: { sigmaLevel: 0.15 } },
      { title: "Increase σ", subtitle: "As σ grows, the spread widens. More uncertainty.", insight: "The bracket expands. The ball covers larger territory, harder to predict.", context: "Small σ means values cluster tightly.", vizKey: "sig-ball", vizProps: { sigmaLevel: 0.35 } },
      { title: "Large σ = wide spread", subtitle: "High standard deviation means high variability.", insight: "With σ = 0.6, the jitter is dramatic. This is exactly what standard deviation quantifies.", context: "As σ increases, the range of likely values expands.", vizKey: "sig-ball", vizProps: { sigmaLevel: 0.6 } },
      { title: "These traces form a shape", subtitle: "Record many positions and the scattered points reveal the bell curve.", insight: "The rings from jittering settle into a Gaussian curve. Most values near center, fewer at extremes.", context: "Large σ = values can land far from average.", vizKey: "sig-gauss", vizProps: { showMean: true, showOneSigma: true, showRings: true } },
      { title: "1σ captures 68% of values", subtitle: "About 68% of all values fall within one standard deviation of the mean.", insight: "The shaded region shows ±1σ. Roughly two-thirds of observations land here — the \"typical\" range.", context: "Many observations form a bell shape.", vizKey: "sig-gauss", vizProps: { showMean: true, showOneSigma: true } },
      { title: "2σ captures 95% of values", subtitle: "Expand to two standard deviations and you capture about 95%.", insight: "The 68-95-99.7 rule: 1σ ≈ 68%, 2σ ≈ 95%, 3σ ≈ 99.7%.", context: "68% of values fall within ±1σ.", vizKey: "sig-gauss", vizProps: { showMean: true, showOneSigma: true, showTwoSigma: true } },
      { title: "How do we compute σ?", subtitle: "Measure each point's distance from the mean, square, average, then square root.", insight: "Each dashed line is a deviation. We square, average, and √ to get σ. Same as √variance.", context: "2σ captures 95% — only 5% are \"unusual\".", vizKey: "sig-sample", vizProps: { showFormula: true } },
      { title: "σ assumes symmetry", subtitle: "The ±σ notation implies equal spread on both sides.", insight: "In a symmetric distribution, \"mean ± 5%\" means exactly 5% below and 5% above.", context: "σ = √(average squared deviation).", vizKey: "sig-sym", vizProps: { showAsymmetric: false } },
      { title: "Skewed data breaks this", subtitle: "When data is skewed, the ±σ interpretation falls apart.", insight: "With skew, σ still measures spread but \"±σ\" no longer means symmetric ranges.", context: "For symmetric distributions, ±σ gives equal ranges.", vizKey: "sig-sym", vizProps: { showAsymmetric: true } },
      { title: "Same σ, different ranges", subtitle: "Two distributions can have identical σ but very different practical ranges.", insight: "Both have σ = 0.5, but normal gives 5%–15% while skewed gives 2%–12%.", context: "Skew breaks ±σ symmetry.", vizKey: "sig-comp" },
      { title: "Most things approximate normal", subtitle: "Many real-world phenomena follow approximately normal distributions.", insight: "Heights, test scores, measurement errors, stock returns (roughly) — many things cluster around an average.", context: "Same σ can mean different practical ranges.", vizKey: "sig-normal" },
      { title: "Know the limitations", subtitle: "When someone says \"10% ± 5%\", they're assuming normality. Always check.", insight: "μ ± σ is powerful shorthand but not magic. For skewed or heavy-tailed data, the 68-95-99.7 rule may not apply.", context: "Many phenomena approximate normal.", vizKey: "sig-summary" },
      { title: "Full circle: σ IS the jitter", subtitle: "σ is the precise measure of the jitter — the typical distance from the mean.", insight: "Standard deviation transforms intuitive \"spread\" into a rigorous number. With μ and σ, you describe any distribution.", context: "μ ± σ assumes normality — always verify.", vizKey: "sig-ball", vizProps: { sigmaLevel: 0.4 } },
    ],
  },
  {
    id: "sp500-bootstrap",
    title: "Bootstrap Resampling",
    tag: "Statistics",
    desc: "Use real S&P 500 data to understand sampling distributions and quantify uncertainty.",
    steps: [
      { title: "The uncertainty question", subtitle: "If you invest in the S&P 500 today, where might you be in 5 years? Nobody knows — but we can quantify the uncertainty.", insight: "The future is uncertain but not unknowable. Historical data helps us picture what's plausible.", vizKey: "bs-question" },
      { title: "We have historical data", subtitle: "The S&P 500 has decades of price history — booms, crashes, and recoveries.", insight: "This historical record is our raw material. But prices aren't what we'll sample — we need the returns.", context: "We want to quantify uncertainty using historical data.", vizKey: "bs-history" },
      { title: "From prices to returns", subtitle: "Each month: how much did the index gain or lose? These become building blocks.", insight: "Over 20 years, about 240 monthly returns — a rich dataset of month-to-month behavior.", context: "Returns are the building blocks we need.", vizKey: "bs-returns" },
      { title: "The return distribution", subtitle: "Stack all 240 returns into a histogram. Most cluster near zero, tails show big moves.", insight: "This histogram is our \"urn\" of possible outcomes. Small moves are common, big moves rare.", context: "Monthly returns capture the market's behavior.", vizKey: "bs-histogram" },
      { title: "The bootstrap idea", subtitle: "What if the next 5 years look statistically similar? Randomly pick 60 months from history.", insight: "Sampling with replacement means the same month can be picked multiple times, preserving the distribution.", context: "Now comes the key insight.", vizKey: "bs-sampling" },
      { title: "One possible future", subtitle: "Chain 60 sampled returns, compound from today's price — one possible 5-year trajectory.", insight: "One roll of the dice. Might end +80% or -20%. To see the range, we need many paths.", context: "Bootstrap sampling creates synthetic sequences.", vizKey: "bs-single" },
      { title: "A cloud of possibilities", subtitle: "Repeat 1,000 times. Each line is a different equally plausible future.", insight: "The \"cloud\" reveals uncertainty visually. Some soar, others crash, most wander between.", context: "One path shows a possibility — many show the picture.", vizKey: "bs-many" },
      { title: "The confidence band", subtitle: "Compute percentiles across simulations. The shaded band shows where 90% of paths fall.", insight: "The median path shows the \"typical\" outcome. The band widens over time — uncertainty compounds.", context: "1,000 paths show the range — now summarize with percentiles.", vizKey: "bs-band" },
      { title: "Distribution of 5-year returns", subtitle: "Take each simulation's ending value and compute total return.", insight: "5% chance of losing money, 50% chance of roughly doubling, 5% chance of tripling. Actionable numbers.", context: "Confidence band shows paths through time.", vizKey: "bs-final" },
      { title: "Uncertainty, quantified", subtitle: "Not a single number but a range of possibilities with probabilities attached.", insight: "Bootstrap transforms historical data into forward-looking estimates. It doesn't predict — it quantifies what's plausible.", context: "The distribution gives concrete probabilities.", vizKey: "bs-insight" },
    ],
  },
]