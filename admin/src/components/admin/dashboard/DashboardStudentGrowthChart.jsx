import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdShowChart, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { apiFetch } from '../../../api/config';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-xl border text-sm"
      style={{ background: 'var(--admin-surface-hover)', borderColor: 'var(--admin-border)', boxShadow: '0 8px 32px rgba(59,130,246,0.25)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-0.5">{label}</p>
      <p className="text-base font-extrabold admin-text-primary">{payload[0].value.toLocaleString()} students</p>
    </div>
  );
};

const DashboardStudentGrowthChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ newStudentsThisMonth: 0, growthRate: '0%', growthUp: true });

  useEffect(() => {
    apiFetch('/admin/dashboard/student-growth')
      .then(res => {
        setData(res.data?.chartData || []);
        setMeta({
          newStudentsThisMonth: res.data?.newStudentsThisMonth || 0,
          growthRate: res.data?.growthRate || '0%',
          growthUp: res.data?.growthUp ?? true
        });
      })
      .catch(err => console.error('Student growth fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const GrowthIcon = meta.growthUp ? MdTrendingUp : MdTrendingDown;
  const growthColor = meta.growthUp ? '#10B981' : '#EF4444';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border p-3 md:p-4 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] h-auto"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className="absolute -top-20 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30 blur-[80px]" style={{ background: '#3B82F6' }} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}>
            <MdShowChart size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold admin-text-primary">Student Growth Overview</h2>
            <p className="text-[11px] admin-text-secondary mt-0.5">Enrollment trend over the last 6 months</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="rounded-xl px-3 py-2 border"
            style={{ background: 'var(--admin-surface-raised)', borderColor: 'rgba(59,130,246,0.35)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary">New students</p>
            {loading
              ? <div className="h-6 w-20 rounded animate-pulse mt-0.5" style={{ background: 'var(--admin-border)' }} />
              : <p className="text-lg font-extrabold admin-text-primary">+{meta.newStudentsThisMonth.toLocaleString()} Students</p>}
          </div>
          <div className="rounded-xl px-3 py-2 border flex items-center gap-2"
            style={{ background: 'var(--admin-surface-raised)', borderColor: `${growthColor}55` }}>
            <GrowthIcon size={18} style={{ color: growthColor, flexShrink: 0 }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary">Growth rate</p>
              {loading
                ? <div className="h-6 w-16 rounded animate-pulse mt-0.5" style={{ background: 'var(--admin-border)' }} />
                : <p className="text-lg font-extrabold" style={{ color: growthColor }}>{meta.growthUp ? '\u2191' : '\u2193'} {meta.growthRate} Growth</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-[200px]">
        {loading ? (
          <div className="w-full h-full rounded-xl animate-pulse" style={{ background: 'var(--admin-border)' }} />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="dashStudentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--admin-border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--admin-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--admin-text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="natural" dataKey="students" stroke="#60A5FA" strokeWidth={2.5}
                fill="url(#dashStudentGrad)" dot={false}
                activeDot={{ r: 5, fill: '#3B82F6', stroke: '#F8FAFC', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  );
};

export default DashboardStudentGrowthChart;
