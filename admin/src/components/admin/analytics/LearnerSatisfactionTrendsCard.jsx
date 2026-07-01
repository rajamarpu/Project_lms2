/**
 * LearnerSatisfactionTrendsCard
 *
 * Analytics card component displaying learner satisfaction metrics
 * (Average Rating, NPS, Review Volume, Positive Sentiment) as an
 * interactive line chart with time-granularity filters and comparison mode.
 *
 * Feature: learner-satisfaction-trends
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Metric Configuration Map ──────────────────────────────────────────────────

export const METRICS = {
  rating: {
    label: 'Average Rating',
    key: 'rating',
    unit: '/ 5',
    domain: [0, 5],
    format: (v) => v != null ? v.toFixed(1) : '—',
    yTickFormatter: (v) => `${v} / 5`,
    badgeFormat: (arr) => (arr.reduce((s, d) => s + (d.rating ?? 0), 0) / arr.length).toFixed(1),
  },
  nps: {
    label: 'NPS',
    key: 'nps',
    unit: '',
    domain: [-100, 100],
    format: (v) => v != null ? Math.round(v).toString() : '—',
    yTickFormatter: (v) => `${v}`,
    badgeFormat: (arr) => Math.round(arr.reduce((s, d) => s + (d.nps ?? 0), 0) / arr.length).toString(),
  },
  reviewVolume: {
    label: 'Review Volume',
    key: 'reviewVolume',
    unit: '',
    domain: [0, 'auto'],
    format: (v) => v != null ? v.toLocaleString() : '—',
    yTickFormatter: (v) => v.toLocaleString(),
    badgeFormat: (arr) => arr.reduce((s, d) => s + (d.reviewVolume ?? 0), 0).toLocaleString(),
  },
  positiveSentiment: {
    label: 'Positive Sentiment',
    key: 'positiveSentiment',
    unit: '%',
    domain: [0, 100],
    format: (v) => v != null ? `${v.toFixed(1)}%` : '—',
    yTickFormatter: (v) => `${v}%`,
    badgeFormat: (arr) => `${(arr.reduce((s, d) => s + (d.positiveSentiment ?? 0), 0) / arr.length).toFixed(1)}%`,
  },
};

// ── Value Clamping Utility ────────────────────────────────────────────────────

/**
 * Clamps a metric value to its defined domain bounds.
 *
 * - Returns null for null, undefined, or NaN values (renders as a gap in the chart).
 * - For metrics with domain [min, 'auto'], clamps to Math.max(0, value).
 * - For metrics with numeric domain [min, max], clamps to [min, max].
 *
 * @param {number|null|undefined} value - The raw metric value.
 * @param {string} metric - One of 'rating' | 'nps' | 'reviewVolume' | 'positiveSentiment'.
 * @returns {number|null}
 */
export function clampValue(value, metric) {
  if (value == null || isNaN(value)) return null;
  const [min, max] = METRICS[metric].domain;
  if (max === 'auto') return Math.max(0, value);
  return Math.min(max, Math.max(min, value));
}

// ── Filter and Metric Options ─────────────────────────────────────────────────

export const FILTER_OPTIONS = [
  { key: 'daily',     label: 'Daily' },
  { key: 'weekly',    label: 'Weekly' },
  { key: 'monthly',   label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
];

export const METRIC_OPTIONS = [
  { key: 'rating',           label: 'Avg Rating' },
  { key: 'nps',              label: 'NPS' },
  { key: 'reviewVolume',     label: 'Review Volume' },
  { key: 'positiveSentiment', label: 'Sentiment' },
];

// ── LoadingSkeleton Sub-component ─────────────────────────────────────────────

/**
 * LoadingSkeleton
 *
 * Renders animated pulse skeleton placeholders for the badge row and chart area.
 * Displayed when `isLoading === true` or `satisfactionData` is undefined/missing
 * the active filter key.
 */
export function LoadingSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="animate-pulse">
      {/* Four badge-shaped skeleton blocks representing the four metric badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-white/10 rounded-full h-8 w-24" />
        <div className="bg-white/10 rounded-full h-8 w-24" />
        <div className="bg-white/10 rounded-full h-8 w-24" />
        <div className="bg-white/10 rounded-full h-8 w-24" />
      </div>
      {/* Chart-area skeleton block */}
      <div className="bg-white/10 rounded-2xl h-[280px] w-full" />
    </div>
  );
}

// ── EmptyState Sub-component ──────────────────────────────────────────────────

/**
 * EmptyState
 *
 * Renders a centered inline message when the active filter's data array is empty.
 */
export function EmptyState() {
  return (
    <div
      data-testid="empty-state"
      className="flex items-center justify-center h-[280px] w-full"
    >
      <p className="admin-text-muted text-sm">No data available for this period.</p>
    </div>
  );
}

// ── MetricBadge Sub-component ─────────────────────────────────────────────────

/**
 * MetricBadge
 *
 * Renders a single summary badge showing the aggregate value for one metric
 * derived from the active period's data array.
 *
 * @param {{ label: string, value: string, unit: string, icon?: React.ReactNode }} props
 */
export function MetricBadge({ label, value, unit }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 border"
      style={{
        background: 'var(--admin-surface-raised)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <span className="text-xs admin-text-secondary">{label}</span>
      <span className="text-xs font-bold admin-text-primary">{value}</span>
      {unit && <span className="text-xs admin-text-muted">{unit}</span>}
    </div>
  );
}

// ── TimeFilter Sub-component ──────────────────────────────────────────────────

/**
 * TimeFilter
 *
 * Renders four segmented filter buttons for time granularity selection.
 * The active button is highlighted with a filled purple background and white text.
 * Selecting the already-active filter is a no-op (idempotence).
 *
 * @param {{ options: Array<{key: string, label: string}>, activeFilter: string, onSelect: function }} props
 */
export function TimeFilter({ options, activeFilter, onSelect }) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1 border"
      style={{
        background: 'var(--admin-surface-raised)',
        borderColor: 'var(--admin-border)',
      }}
    >
      {options.map(({ key, label }) => (
        <button
          key={key}
          aria-label={`Filter by ${label}`}
          onClick={() => {
            if (key !== activeFilter) onSelect(key);
          }}
          className={
            key === activeFilter
              ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
              : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── MetricSelector Sub-component ─────────────────────────────────────────────

/**
 * MetricSelector
 *
 * Renders four metric selector buttons. The active button is highlighted with
 * a filled purple background and white text. Each button has `aria-pressed`
 * set to `"true"` for the active metric and `"false"` for all others.
 *
 * @param {{ options: Array<{key: string, label: string}>, activeMetric: string, onSelect: function }} props
 */
export function MetricSelector({ options, activeMetric, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map(({ key, label }) => (
        <button
          key={key}
          aria-pressed={activeMetric === key ? 'true' : 'false'}
          onClick={() => onSelect(key)}
          className={
            key === activeMetric
              ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
              : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 bg-white/5 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── SatisfactionTooltip Sub-component ────────────────────────────────────────

/**
 * SatisfactionTooltip
 *
 * Custom Recharts tooltip component. Renders the dark glassmorphism tooltip
 * matching the existing `CustomTooltip` in `Analytics.jsx`.
 *
 * In single-series mode, renders the time period label and the metric value
 * formatted via the active metric's `format` function.
 *
 * In comparison mode, renders two value rows — one for Period_A and one for
 * Period_B — each labeled with its period date-range string. Displays "—"
 * when a period has no data at the hovered index.
 *
 * @param {{ active: boolean, payload: Array, label: string, activeMetric: string, comparisonMode: boolean, periodALabel: string, periodBLabel: string }} props
 */
export function SatisfactionTooltip({ active, payload, label, activeMetric, comparisonMode = false, periodALabel, periodBLabel }) {
  if (!active || !payload || !payload.length) return null;

  const metric = METRICS[activeMetric];

  if (comparisonMode) {
    // Find Period_A and Period_B values from payload
    const periodAEntry = payload.find(p => p.dataKey === activeMetric);
    const periodBEntry = payload.find(p => p.dataKey === `${activeMetric}_periodB`);
    const periodAValue = periodAEntry?.value ?? null;
    const periodBValue = periodBEntry?.value ?? null;

    return (
      <div className="bg-[#0b1324]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
        {/* Period_A row */}
        <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-gray-400">{periodALabel || 'Period A'}:</span>
          <span className="text-purple-300">{metric.format(periodAValue)}</span>
        </div>
        {/* Period_B row */}
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-pink-500" />
          <span className="text-gray-400">{periodBLabel || 'Period B'}:</span>
          <span className="text-pink-300">{periodBValue != null ? metric.format(periodBValue) : '—'}</span>
        </div>
      </div>
    );
  }

  // Single-series mode
  const value = payload[0]?.value;

  return (
    <div className="bg-[#0b1324]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-center gap-2 text-xs font-semibold text-white">
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        <span>{metric.label}:</span>
        <span className="text-purple-300">{metric.format(value)}</span>
      </div>
    </div>
  );
}

// ── ComparisonLegend Sub-component ────────────────────────────────────────────

/**
 * ComparisonLegend
 *
 * Renders two legend entries (color swatch + label) for Period_A and Period_B.
 * Shown only when comparison mode is active.
 *
 * @param {{ periodALabel: string, periodBLabel: string }} props
 */
export function ComparisonLegend({ periodALabel, periodBLabel }) {
  return (
    <div className="flex items-center gap-4 mt-2" data-testid="comparison-legend">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 inline-block rounded" />
        <span className="text-xs text-gray-400">{periodALabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="w-3 inline-block"
          style={{ borderTop: '2px dashed #EC4899', background: 'none', height: 0, display: 'inline-block' }}
        />
        <span className="text-xs text-gray-400">{periodBLabel}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const LearnerSatisfactionTrendsCard = ({ satisfactionData, isLoading = false, colSpan = 12 }) => {
  const [activeFilter, setActiveFilter] = useState('monthly');
  const [activeMetric, setActiveMetric] = useState('rating');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [periodBKey, setPeriodBKey] = useState('');

  // Ref for auto-focusing the Period_B selector when comparison mode activates
  const periodBSelectorRef = useRef(null);

  // Auto-focus Period_B selector when comparison mode becomes active (Req 9.6)
  useEffect(() => {
    if (comparisonMode && periodBSelectorRef.current) {
      periodBSelectorRef.current.focus();
    }
  }, [comparisonMode]);

  // Determine which content to render
  const shouldShowSkeleton =
    isLoading === true ||
    !satisfactionData ||
    !satisfactionData[activeFilter];

  const shouldShowEmpty =
    !shouldShowSkeleton &&
    Array.isArray(satisfactionData[activeFilter]) &&
    satisfactionData[activeFilter].length === 0;

  // Compute badge values from active filter data
  const activeData = satisfactionData?.[activeFilter] ?? [];
  const badgeValues = Object.values(METRICS).map(metric => ({
    key: metric.key,
    label: metric.label,
    value: activeData.length > 0 ? metric.badgeFormat(activeData) : '—',
    unit: metric.unit,
  }));

  // Map data through clampValue to ensure out-of-range values are clamped
  // Also add periodB value as a flat reference line when comparison mode is active
  const periodBData = comparisonMode && periodBKey
    ? activeData.find(p => p.name === periodBKey)
    : null;
  const periodBValue = periodBData ? clampValue(periodBData[activeMetric], activeMetric) : null;

  const chartData = activeData.map(point => ({
    ...point,
    [activeMetric]: clampValue(point[activeMetric], activeMetric),
    [`${activeMetric}_periodB`]: comparisonMode && periodBValue !== null ? periodBValue : undefined,
  }));

  return (
    <div className={`col-span-12 xl:col-span-${colSpan}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}
        className="bg-white/[0.02] bg-[var(--admin-surface)] backdrop-blur-[20px] border border-white/8 rounded-[28px] p-6 shadow-2xl"
        style={{ borderColor: 'var(--admin-border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold admin-text-primary tracking-tight">Learner Satisfaction Trends</h3>
          <div className="flex items-center gap-2">
            <TimeFilter
              options={FILTER_OPTIONS}
              activeFilter={activeFilter}
              onSelect={setActiveFilter}
            />
            {/* Compare toggle button (Req 6.1, 9.3) */}
            <button
              aria-pressed={comparisonMode ? 'true' : 'false'}
              onClick={() => {
                const newMode = !comparisonMode;
                setComparisonMode(newMode);
                if (newMode && activeData.length > 0) {
                  // Default Period_B to the last data point's name (Req 6.2)
                  setPeriodBKey(activeData[activeData.length - 1].name);
                } else {
                  setPeriodBKey('');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                comparisonMode
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-400 bg-white/5 hover:text-white'
              }`}
            >
              Compare
            </button>
          </div>
        </div>
        <MetricSelector
          options={METRIC_OPTIONS}
          activeMetric={activeMetric}
          onSelect={setActiveMetric}
        />

        {/* Comparison Legend — shown only when comparison mode is active (Req 6.6) */}
        {comparisonMode && (
          <ComparisonLegend
            periodALabel={activeFilter}
            periodBLabel={periodBKey || '—'}
          />
        )}

        {/* Period_B selector — shown only when comparison mode is active (Req 6.2, 9.5, 9.6) */}
        {comparisonMode && (
          <div className="mt-3" data-testid="period-b-selector">
            <label className="text-xs text-gray-400 mr-2">Compare with:</label>
            <select
              ref={periodBSelectorRef}
              value={periodBKey}
              onChange={(e) => setPeriodBKey(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Select comparison period"
            >
              {activeData.map(point => (
                <option key={point.name} value={point.name} className="bg-[#0b1324]">
                  {point.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Badge row — shown when not in skeleton state */}
        {!shouldShowSkeleton && (
          <div className="flex flex-wrap gap-2 mt-3" data-testid="badge-row">
            {badgeValues.map(({ key, label, value, unit }) => (
              <MetricBadge key={key} label={label} value={value} unit={unit} />
            ))}
          </div>
        )}

        <div className="mt-4">
          {shouldShowSkeleton ? (
            <LoadingSkeleton />
          ) : shouldShowEmpty ? (
            <EmptyState />
          ) : (
            <motion.div
              key={activeFilter + activeMetric}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              data-testid="chart-content"
              aria-label={`${METRICS[activeMetric].label} satisfaction trends — ${FILTER_OPTIONS.find(f => f.key === activeFilter)?.label} view`}
            >
              <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {/* Horizontal gradient for line stroke */}
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    {/* Vertical gradient for area fill */}
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    tickFormatter={(name) => name}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    tickFormatter={METRICS[activeMetric].yTickFormatter}
                    domain={METRICS[activeMetric].domain}
                    width={60}
                  />
                  <Tooltip
                    content={
                      <SatisfactionTooltip
                        activeMetric={activeMetric}
                        comparisonMode={comparisonMode}
                        periodALabel={activeFilter}
                        periodBLabel={periodBKey}
                      />
                    }
                    cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeMetric}
                    stroke="url(#lineGradient)"
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                    connectNulls={false}
                    dot={false}
                    activeDot={{ r: 4, fill: '#8B5CF6' }}
                  />
                  {/* Period_B dashed pink line — shown only in comparison mode (Req 6.3, 6.4) */}
                  {comparisonMode && periodBData && (
                    <Line
                      type="monotone"
                      dataKey={`${activeMetric}_periodB`}
                      stroke="#EC4899"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LearnerSatisfactionTrendsCard;
