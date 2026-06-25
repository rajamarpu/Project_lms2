import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from './EnterpriseUI';

const KpiCard = ({ title, value, sparklineData, sparklineColor = '#06B6D4' }) => {
  return (
    <MetricCard
      title={title}
      value={value}
      tone="blue"
      footer={sparklineData ? '' : undefined}
      className="metric-card-kpi"
    >
      {sparklineData && (
        <div className="mt-4 h-14 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" hide />
              <Tooltip cursor={false} contentStyle={{ background: 'rgba(0,0,0,0.6)', border: 'none' }} />
              <Line type="monotone" dataKey="value" stroke={sparklineColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </MetricCard>
  );
};

export default KpiCard;
