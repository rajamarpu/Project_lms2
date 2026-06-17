import React from 'react';

const ChartTooltip = ({ active, payload, label, valueSuffix = '' }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5 shadow-xl border text-sm"
      style={{
        background: 'var(--admin-surface-hover)',
        borderColor: 'var(--admin-border)',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
        {label}
      </p>
      {payload.map((item) => (
        <div key={item.dataKey || item.name} className="flex items-center gap-2 text-xs font-semibold admin-text-primary">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: item.color || item.fill }}
          />
          <span>{item.name}:</span>
          <span style={{ color: item.color || item.fill }}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChartTooltip;
