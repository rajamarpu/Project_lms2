import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdPersonAdd,
  MdWorkspacePremium,
  MdPublish,
  MdCelebration,
  MdPayment,
  MdPeople,
  MdAttachMoney,
  MdLibraryBooks,
  MdSchool,
} from 'react-icons/md';
import { recentActivity, todayPlatformSummary } from './dashboardData';
import { useDateRange } from '../../../context/DateRangeContext';
import {
  filterRecentActivity,
  scalePlatformSummary,
} from '../../../utils/dashboardDateFilter';
import { useAdminStats } from '../../../api/reactQuery';

const ACTIVITY_ICONS = {
  enroll: MdPersonAdd,
  cert: MdWorkspacePremium,
  publish: MdPublish,
  milestone: MdCelebration,
  payment: MdPayment,
};

const SUMMARY_ICONS = {
  students: MdPeople,
  certificates: MdWorkspacePremium,
  revenue: MdAttachMoney,
  courses: MdLibraryBooks,
  teachers: MdSchool,
};

const TodaySummaryCard = ({ metric, index }) => {
  const Icon = SUMMARY_ICONS[metric.iconKey];
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.22 + index * 0.05 }}
      whileHover={{
        y: -3,
        boxShadow: `0 10px 24px ${metric.glow}`,
      }}
      className="rounded-xl border px-3 py-2.5 flex items-center gap-2.5 transition-all duration-300 cursor-default bg-[var(--admin-surface-raised)] shadow-[var(--admin-shadow-card)]"
      style={{ borderColor: metric.border }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md"
        style={{ background: metric.accent }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-wider admin-text-secondary leading-tight">
          {metric.label}
        </p>
        <div className="flex items-baseline justify-between gap-1 mt-0.5">
          <p className="text-base font-extrabold admin-text-primary leading-none">
            {metric.value}
          </p>
          <span
            className={`text-[9px] font-bold shrink-0 ${
              metric.trendUp ? 'text-[#10B981]' : 'text-red-400'
            }`}
          >
            {metric.trend}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityTimelineItem = ({ item, index, isLast }) => {
  const Icon = ACTIVITY_ICONS[item.iconKey] || MdPersonAdd;
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.04 }}
      className="relative flex gap-3"
    >
      <div className="relative z-10 flex flex-col items-center shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: item.accent,
            boxShadow: `0 0 0 2px var(--admin-surface), 0 4px 12px ${item.accent}55`,
          }}
        >
          <Icon size={16} className="text-white" />
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 min-h-[12px] mt-1 rounded-full"
            style={{ background: `linear-gradient(180deg, ${item.accent}88, var(--admin-border))` }}
          />
        )}
      </div>

      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold admin-text-primary leading-snug">
            {item.title}
          </p>
          <time className="text-[10px] font-medium admin-text-muted shrink-0 tabular-nums">
            {item.time}
          </time>
        </div>
        <p className="text-xs admin-text-muted mt-0.5 line-clamp-2">{item.desc}</p>
        <span
          className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            color: item.accent,
            background: `${item.accent}18`,
          }}
        >
          {item.category}
        </span>
      </div>
    </motion.li>
  );
};

const DashboardRecentActivity = () => {
  const { startDate, endDate } = useDateRange();
  const { data: statsData, isLoading: loading } = useAdminStats();

  const activities = useMemo(() => {
    const recent = statsData?.data?.recentUsers || [];
    return filterRecentActivity(
      recent.map((u, i) => ({
        id: u.id || `u-${i}`,
        title: `${u.name} joined`,
        desc: u.email || '',
        time: new Date(u.createdAt).toLocaleString(),
        category: 'Enrollment',
        accent: '#3B82F6',
      })),
      startDate,
      endDate
    );
  }, [statsData, startDate, endDate]);

  const platformSummary = useMemo(() => {
    const s = statsData?.data || {};
    const base = [
      { label: 'New Students Today', value: s.totalStudents ?? 0, trend: '+0%', iconKey: 'students', accent: '#3B82F6', glow: 'rgba(59,130,246,0.35)', border: 'rgba(59,130,246,0.35)' },
      { label: 'Certificates Issued', value: s.totalCertificates ?? 0, trend: '+0', iconKey: 'certificates', accent: '#06B6D4', glow: 'rgba(6,182,212,0.35)', border: 'rgba(6,182,212,0.35)' },
      { label: 'Revenue Today', value: s.totalRevenue ? `₹${s.totalRevenue}` : '—', trend: '+0%', iconKey: 'revenue', accent: '#F59E0B', glow: 'rgba(245,158,11,0.35)', border: 'rgba(245,158,11,0.35)' },
      { label: 'Courses Published', value: s.totalCourses ?? 0, trend: '—', iconKey: 'courses', accent: '#8B5CF6', glow: 'rgba(139,92,246,0.35)', border: 'rgba(139,92,246,0.35)' },
    ];
    return scalePlatformSummary(base, startDate, endDate);
  }, [statsData, startDate, endDate]);

  return (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.18 }}
    className="rounded-2xl border p-3 md:p-4 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] h-auto"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-4 items-start">
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold admin-text-primary">Recent Activity</h2>
          <span className="text-[10px] font-semibold admin-text-muted uppercase tracking-wider">
            Live feed
          </span>
        </div>

        <ul className="relative m-0 p-0 list-none">
          {activities.length === 0 ? (
            <li className="text-sm admin-text-muted py-4">No activity in this date range.</li>
          ) : (
            activities.map((item, index) => (
              <ActivityTimelineItem
                key={item.id}
                item={item}
                index={index}
                isLast={index === activities.length - 1}
              />
            ))
          )}
        </ul>
      </div>

      <aside className="min-w-0 md:border-l md:pl-4" style={{ borderColor: 'var(--admin-border)' }}>
        <h3 className="text-sm font-bold admin-text-primary mb-2.5">
          Today&apos;s Platform Summary
        </h3>
        <div className="flex flex-col gap-2">
          {platformSummary.map((metric, index) => (
            <TodaySummaryCard key={metric.label} metric={metric} index={index} />
          ))}
        </div>
      </aside>
    </div>
  </motion.section>
  );
};

export default DashboardRecentActivity;
