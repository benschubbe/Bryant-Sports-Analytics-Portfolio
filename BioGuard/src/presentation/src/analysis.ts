/**
 * BioGuardian Cross-Metric Analysis Engine
 * ==========================================
 *
 * Client-side statistical analysis that discovers relationships between
 * health metrics from imported CSV data.  Implements:
 *
 *   1. Pairwise Pearson correlation across all metric pairs
 *   2. Lagged cross-correlation (sleep yesterday → HRV today)
 *   3. 7-day rolling averages with trend breakpoint detection
 *   4. Plain-English insight narratives from statistical results
 *
 * All computation runs in the browser.  Zero data transmitted.
 */

import { BiometricReading } from './components/CsvUpload';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailySeries {
  type: string;
  dates: string[];       // sorted date strings (YYYY-MM-DD)
  values: number[];      // one value per date (averaged if multiple readings)
  rolling7: number[];    // 7-day rolling average
}

export interface Correlation {
  metricA: string;
  metricB: string;
  r: number;            // Pearson r [-1, 1]
  p: number;            // approximate p-value
  n: number;            // number of overlapping days
  strength: string;     // "strong", "moderate", "weak", "none"
  direction: string;    // "positive", "negative", "none"
  lag: number;          // 0 = same day, 1 = metricA leads by 1 day
}

export interface TrendBreak {
  metric: string;
  date: string;
  beforeAvg: number;
  afterAvg: number;
  changePct: number;
  direction: 'improved' | 'declined';
}

export interface Insight {
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  category: 'correlation' | 'trend' | 'pattern';
  evidence: string;
}

export interface AnalysisReport {
  correlations: Correlation[];
  laggedCorrelations: Correlation[];
  trendBreaks: TrendBreak[];
  insights: Insight[];
  dailySeries: DailySeries[];
}

// ---------------------------------------------------------------------------
// Step 1: Aggregate readings into daily time series
// ---------------------------------------------------------------------------

export function buildDailySeries(readings: BiometricReading[]): DailySeries[] {
  // Group by type, then by date, averaging multiple readings per day
  const byType: Record<string, Record<string, number[]>> = {};

  for (const r of readings) {
    if (!byType[r.type]) byType[r.type] = {};
    const dateStr = toDateKey(r.timestamp);
    if (!dateStr) continue;
    if (!byType[r.type][dateStr]) byType[r.type][dateStr] = [];
    byType[r.type][dateStr].push(r.value);
  }

  const series: DailySeries[] = [];
  const types = Object.keys(byType);

  for (const type of types) {
    const dateMap = byType[type];
    const dates = Object.keys(dateMap).sort();
    if (dates.length < 3) continue; // need at least 3 days for meaningful analysis

    const values = dates.map(d => {
      const arr = dateMap[d];
      return arr.reduce((s, v) => s + v, 0) / arr.length;
    });

    // 7-day rolling average
    const rolling7: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - 6);
      const window = values.slice(start, i + 1);
      rolling7.push(window.reduce((s, v) => s + v, 0) / window.length);
    }

    series.push({ type, dates, values, rolling7 });
  }

  return series;
}

// ---------------------------------------------------------------------------
// Step 2: Pairwise Pearson correlation
// ---------------------------------------------------------------------------

export function computeCorrelations(series: DailySeries[]): Correlation[] {
  const results: Correlation[] = [];

  for (let i = 0; i < series.length; i++) {
    for (let j = i + 1; j < series.length; j++) {
      const corr = correlatePair(series[i], series[j], 0);
      if (corr && corr.n >= 5) results.push(corr);
    }
  }

  // Sort by absolute r descending
  results.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  return results;
}

// ---------------------------------------------------------------------------
// Step 3: Lagged cross-correlation (metric A day N → metric B day N+1)
// ---------------------------------------------------------------------------

export function computeLaggedCorrelations(series: DailySeries[]): Correlation[] {
  const results: Correlation[] = [];

  for (let i = 0; i < series.length; i++) {
    for (let j = 0; j < series.length; j++) {
      if (i === j) continue;
      // Does metric i on day N predict metric j on day N+1?
      const corr = correlatePair(series[i], series[j], 1);
      if (corr && corr.n >= 5 && Math.abs(corr.r) > 0.3) {
        results.push(corr);
      }
    }
  }

  results.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  return results.slice(0, 10); // top 10 lagged correlations
}

// ---------------------------------------------------------------------------
// Step 4: Trend breakpoint detection
// ---------------------------------------------------------------------------

export function detectTrendBreaks(series: DailySeries[]): TrendBreak[] {
  const breaks: TrendBreak[] = [];

  for (const s of series) {
    if (s.values.length < 10) continue;

    // Sliding window: compare first half vs second half at each split point
    // Find the split that maximizes the difference in means
    let bestSplit = -1;
    let bestDiff = 0;

    for (let split = Math.max(3, Math.floor(s.values.length * 0.25));
         split <= Math.min(s.values.length - 3, Math.floor(s.values.length * 0.75));
         split++) {
      const before = s.values.slice(0, split);
      const after = s.values.slice(split);
      const beforeAvg = mean(before);
      const afterAvg = mean(after);
      const diff = Math.abs(afterAvg - beforeAvg);
      if (diff > bestDiff) {
        bestDiff = diff;
        bestSplit = split;
      }
    }

    if (bestSplit > 0) {
      const before = s.values.slice(0, bestSplit);
      const after = s.values.slice(bestSplit);
      const beforeAvg = mean(before);
      const afterAvg = mean(after);
      const changePct = beforeAvg !== 0 ? ((afterAvg - beforeAvg) / beforeAvg) * 100 : 0;

      // Only report if change is > 5%
      if (Math.abs(changePct) > 5) {
        // Determine if this is "improved" or "declined" based on metric type
        const isHigherBetter = isPositiveMetric(s.type);
        const direction = (isHigherBetter ? changePct > 0 : changePct < 0) ? 'improved' : 'declined';

        breaks.push({
          metric: s.type,
          date: s.dates[bestSplit],
          beforeAvg: round2(beforeAvg),
          afterAvg: round2(afterAvg),
          changePct: round2(changePct),
          direction,
        });
      }
    }
  }

  return breaks;
}

// ---------------------------------------------------------------------------
// Step 5: Generate plain-English insights
// ---------------------------------------------------------------------------

export function generateInsights(
  corrs: Correlation[],
  lagged: Correlation[],
  breaks: TrendBreak[],
): Insight[] {
  const insights: Insight[] = [];

  // Top same-day correlations
  for (const c of corrs.slice(0, 5)) {
    if (Math.abs(c.r) < 0.4) continue;
    const dir = c.r > 0 ? 'increase together' : 'move in opposite directions';
    const strength = Math.abs(c.r) > 0.7 ? 'strongly' : 'moderately';
    insights.push({
      title: `${prettyName(c.metricA)} and ${prettyName(c.metricB)} are ${strength} linked`,
      body: `When ${prettyName(c.metricA)} goes up, ${prettyName(c.metricB)} tends to ${c.r > 0 ? 'go up too' : 'go down'}. They ${dir} across ${c.n} days of data.`,
      priority: Math.abs(c.r) > 0.7 ? 'high' : 'medium',
      category: 'correlation',
      evidence: `Pearson r = ${c.r.toFixed(2)}, n = ${c.n} days`,
    });
  }

  // Lagged relationships (the interesting ones)
  for (const c of lagged.slice(0, 3)) {
    if (Math.abs(c.r) < 0.3) continue;
    const leader = prettyName(c.metricA);
    const follower = prettyName(c.metricB);
    const effect = c.r > 0 ? 'higher' : 'lower';
    insights.push({
      title: `${leader} today predicts ${follower} tomorrow`,
      body: `Days with ${c.r > 0 ? 'higher' : 'lower'} ${leader} are followed by ${effect} ${follower} the next day. This lagged relationship suggests ${leader} may be driving changes in ${follower}.`,
      priority: Math.abs(c.r) > 0.5 ? 'high' : 'medium',
      category: 'pattern',
      evidence: `Lag-1 Pearson r = ${c.r.toFixed(2)}, n = ${c.n} day-pairs`,
    });
  }

  // Trend breaks
  for (const b of breaks) {
    if (Math.abs(b.changePct) < 8) continue;
    const verb = b.direction === 'improved' ? 'improved' : 'declined';
    insights.push({
      title: `${prettyName(b.metric)} ${verb} around ${b.date}`,
      body: `${prettyName(b.metric)} shifted from an average of ${b.beforeAvg} to ${b.afterAvg} (${b.changePct > 0 ? '+' : ''}${b.changePct.toFixed(1)}%). Something changed around this date — a new routine, medication, or stressor?`,
      priority: Math.abs(b.changePct) > 15 ? 'high' : 'medium',
      category: 'trend',
      evidence: `Before: ${b.beforeAvg}, After: ${b.afterAvg}, Change: ${b.changePct.toFixed(1)}%`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: 'No strong patterns detected yet',
      body: 'Import more days of data for deeper analysis. Cross-metric correlations become reliable with 14+ days of overlapping data.',
      priority: 'low',
      category: 'pattern',
      evidence: '',
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function runCrossMetricAnalysis(readings: BiometricReading[]): AnalysisReport {
  const dailySeries = buildDailySeries(readings);
  const correlations = computeCorrelations(dailySeries);
  const laggedCorrelations = computeLaggedCorrelations(dailySeries);
  const trendBreaks = detectTrendBreaks(dailySeries);
  const insights = generateInsights(correlations, laggedCorrelations, trendBreaks);

  return { correlations, laggedCorrelations, trendBreaks, insights, dailySeries };
}

// ---------------------------------------------------------------------------
// Internal: Pearson correlation between two daily series
// ---------------------------------------------------------------------------

function correlatePair(a: DailySeries, b: DailySeries, lag: number): Correlation | null {
  // Align by date: find overlapping dates with the specified lag
  const aMap: Record<string, number> = {};
  for (let i = 0; i < a.dates.length; i++) aMap[a.dates[i]] = a.values[i];

  const bMap: Record<string, number> = {};
  for (let i = 0; i < b.dates.length; i++) bMap[b.dates[i]] = b.values[i];

  const xVals: number[] = [];
  const yVals: number[] = [];

  for (const dateA of a.dates) {
    const dateB = lag === 0 ? dateA : addDays(dateA, lag);
    if (aMap[dateA] !== undefined && bMap[dateB] !== undefined) {
      xVals.push(aMap[dateA]);
      yVals.push(bMap[dateB]);
    }
  }

  if (xVals.length < 5) return null;

  const n = xVals.length;
  const xMean = mean(xVals);
  const yMean = mean(yVals);

  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - xMean;
    const dy = yVals[i] - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return null;

  const r = num / den;
  const rClamped = Math.max(-1, Math.min(1, r));

  // Approximate p-value via t-distribution -> normal approximation
  let p = 1.0;
  if (Math.abs(rClamped) < 1 && n > 3) {
    const t = rClamped * Math.sqrt(n - 2) / Math.sqrt(1 - rClamped * rClamped);
    // Normal approximation for p-value (adequate for n > 10)
    const z = Math.abs(t);
    p = 2 * normalSF(z);
  }

  const absR = Math.abs(rClamped);
  const strength = absR > 0.7 ? 'strong' : absR > 0.4 ? 'moderate' : absR > 0.2 ? 'weak' : 'none';
  const direction = rClamped > 0.1 ? 'positive' : rClamped < -0.1 ? 'negative' : 'none';

  return {
    metricA: a.type, metricB: b.type,
    r: round2(rClamped), p: round4(p), n,
    strength, direction, lag,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateKey(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().substring(0, 10);
  } catch { return ''; }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().substring(0, 10);
}

function mean(arr: number[]): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
function round4(n: number): number { return Math.round(n * 10000) / 10000; }

function normalSF(z: number): number {
  if (z < 0) return 1 - normalSF(-z);
  if (z > 8) return 0;
  const b0 = 0.2316419;
  const b1 = 0.319381530, b2 = -0.356563782, b3 = 1.781477937, b4 = -1.821255978, b5 = 1.330274429;
  const t = 1 / (1 + b0 * z);
  const phi = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  return phi * t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
}

function isPositiveMetric(type: string): boolean {
  // For these metrics, higher is better
  const positive = ['SLEEP_DURATION', 'DEEP_SLEEP', 'REM_SLEEP', 'HRV_RMSSD',
    'STEP_COUNT', 'DISTANCE', 'INTENSITY_MINUTES', 'BODY_BATTERY',
    'SLEEP_SCORE', 'SPO2', 'VO2_MAX', 'FLOORS_CLIMBED', 'ACTIVE_CALORIES'];
  return positive.indexOf(type) >= 0;
}

function prettyName(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    .replace('Hrv Rmssd', 'HRV')
    .replace('Spo2', 'SpO2')
    .replace('Vo2 Max', 'VO2 Max')
    .replace('Avg ', 'Average ')
    .replace('Bp ', 'BP ');
}
