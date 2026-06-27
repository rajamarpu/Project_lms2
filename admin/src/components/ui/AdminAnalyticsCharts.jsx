const BRAND = {
  blue: '#2563eb',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  indigo: '#4f46e5',
  rose: '#f35b79',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function GridLines({ height, width, count = 4 }) {
  return [...Array(count)].map((_, index) => {
    const y = (height / (count - 1)) * index;
    return <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="rgba(148,163,184,0.18)" strokeDasharray="4 6" />;
  });
}

function AxisLabels({ data, width, height }) {
  if (!data.length) return null;
  const step = data.length === 1 ? 0 : width / (data.length - 1);
  return data.map((item, index) => (
    <text key={`${item.label}-${index}`} x={step * index} y={height + 22} textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
      {item.label}
    </text>
  ));
}

export function TrendAreaChart({ data, dataKey, stroke = BRAND.blue, fill = BRAND.cyan, valueFormatter }) {
  const values = data.map((item) => Number(item[dataKey] || 0));
  const max = Math.max(...values, 1);
  const width = 520;
  const height = 220;
  const step = data.length === 1 ? 0 : width / (Math.max(data.length - 1, 1));
  const points = data.map((item, index) => {
    const value = Number(item[dataKey] || 0);
    const y = height - (value / max) * (height - 18) - 8;
    return { x: step * index, y, value, label: item.label };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? 0} ${height} L ${points[0]?.x ?? 0} ${height} Z`;

  return (
    <div className="space-y-4">
      <div className="h-72 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height + 30}`} className="h-full w-full">
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity="0.32" />
              <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <g transform="translate(0,8)">
            <GridLines height={height} width={width} />
            <path d={areaPath} fill={`url(#gradient-${dataKey})`} />
            <path d={linePath} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point) => (
              <circle key={`${point.label}-${point.x}`} cx={point.x} cy={point.y} r="4.5" fill="#fff" stroke={stroke} strokeWidth="3" />
            ))}
            <AxisLabels data={data} width={width} height={height} />
          </g>
        </svg>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {data.map((item) => (
          <div key={`${dataKey}-${item.label}`} className="chart-legend-item justify-between">
            <span className="flex items-center gap-2">
              <span style={{ backgroundColor: stroke }} />
              {item.label}
            </span>
            <strong className="admin-text-primary">{valueFormatter ? valueFormatter(item[dataKey]) : item[dataKey]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DualBarChart({ data, firstKey, secondKey, firstColor = BRAND.blue, secondColor = BRAND.teal, firstLabel, secondLabel, valueFormatter }) {
  const max = Math.max(
    ...data.flatMap((item) => [Number(item[firstKey] || 0), Number(item[secondKey] || 0)]),
    1
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {data.map((item) => {
          const firstWidth = clamp((Number(item[firstKey] || 0) / max) * 100, 0, 100);
          const secondWidth = clamp((Number(item[secondKey] || 0) / max) * 100, 0, 100);
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold admin-text-primary">{item.label}</span>
                <span className="admin-text-secondary">
                  {firstLabel || firstKey}: {valueFormatter ? valueFormatter(item[firstKey], firstKey) : item[firstKey]} | {secondLabel || secondKey}: {valueFormatter ? valueFormatter(item[secondKey], secondKey) : item[secondKey]}
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]">
                  <div className="h-full rounded-full" style={{ width: `${firstWidth}%`, background: `linear-gradient(90deg, ${firstColor}, color-mix(in srgb, ${firstColor} 72%, white))` }} />
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]">
                  <div className="h-full rounded-full" style={{ width: `${secondWidth}%`, background: `linear-gradient(90deg, ${secondColor}, color-mix(in srgb, ${secondColor} 72%, white))` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-legend">
        <span className="chart-legend-item"><span style={{ backgroundColor: firstColor }} />{firstLabel || firstKey}</span>
        <span className="chart-legend-item"><span style={{ backgroundColor: secondColor }} />{secondLabel || secondKey}</span>
      </div>
    </div>
  );
}

export function BreakdownBarChart({ data, dataKey = 'count', labelKey = 'status', palette = [BRAND.blue, BRAND.teal, BRAND.cyan, BRAND.indigo, BRAND.rose, BRAND.sky], valueFormatter }) {
  const max = Math.max(...data.map((item) => Number(item[dataKey] || 0)), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const width = clamp((Number(item[dataKey] || 0) / max) * 100, 0, 100);
        const color = palette[index % palette.length];
        return (
          <div key={`${item[labelKey]}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold capitalize admin-text-primary">{String(item[labelKey]).replace(/-/g, ' ')}</span>
              <span className="admin-text-secondary">{valueFormatter ? valueFormatter(item[dataKey], dataKey) : item[dataKey]}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]">
              <div className="h-full rounded-full" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 72%, white))` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const brandPalette = BRAND;
