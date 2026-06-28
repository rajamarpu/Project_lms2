import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdPeople,
  MdSchool,
  MdLibraryBooks,
  MdAttachMoney,
} from 'react-icons/md';
import { useDateRange } from '../../../context/DateRangeContext';
import { scaleKpiMetrics } from '../../../utils/dashboardDateFilter';
import { useAdminStats } from '../../../api/reactQuery';
import DashboardKpiSkeleton from './DashboardKpiSkeleton';

const ICONS = {
  students: MdPeople,
  teachers: MdSchool,
  courses: MdLibraryBooks,
  revenue: MdAttachMoney,
};

const DashboardKpiRow = () => {
  const { startDate, endDate, label } = useDateRange();

  const { data: statsData, isLoading: loading, isError: error, refetch } = useAdminStats();

  const metrics = useMemo(() => {
    const base = [
      {
        title: 'Total Students',
        value: statsData?.data?.totalStudents ?? '—',
        trend: '+0%',
        trendUp: true,
        iconKey: 'students',
        gradient:
          'linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(6,182,212,0.2) 100%)',
        iconBg: '#3B82F6',
        glow: 'rgba(59,130,246,0.35)',
        border: 'rgba(59,130,246,0.4)',
      },
      {
        title: 'Active Teachers',
        value: statsData?.data?.totalInstructors ?? '—',
        trend: '+0%',
        trendUp: true,
        iconKey: 'teachers',
        gradient:
          'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(6,182,212,0.15) 100%)',
        iconBg: '#10B981',
        glow: 'rgba(16,185,129,0.35)',
        border: 'rgba(16,185,129,0.4)',
      },
      {
        title: 'Total Courses',
        value: statsData?.data?.totalCourses ?? '—',
        trend: '+0%',
        trendUp: true,
        iconKey: 'courses',
        gradient:
          'linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(59,130,246,0.15) 100%)',
        iconBg: '#8B5CF6',
        glow: 'rgba(139,92,246,0.35)',
        border: 'rgba(139,92,246,0.4)',
      },
      {
        title: 'Monthly Revenue',
        value: statsData?.data?.totalRevenue ? `₹${statsData.data.totalRevenue}` : '—',
        trend: '+0%',
        trendUp: true,
        iconKey: 'revenue',
        gradient:
          'linear-gradient(135deg, rgba(245,158,11,0.4) 0%, rgba(239,68,68,0.12) 100%)',
        iconBg: '#F59E0B',
        glow: 'rgba(245,158,11,0.35)',
        border: 'rgba(245,158,11,0.4)',
      },
    ];

    return scaleKpiMetrics(base, startDate, endDate);
  }, [statsData, startDate, endDate]);

  if (loading) {
    return <DashboardKpiSkeleton />;
  }

  return (
  <>
    <p className="sr-only">Metrics for {label}</p>
    {error && (
      <div className="mb-3 text-sm text-red-500">Failed to load stats.</div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    {metrics.map((card, index) => {
      const Icon = ICONS[card.iconKey];
      return (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          whileHover={{
            y: -8,
            boxShadow: `0 20px 50px ${card.glow}`,
          }}
          className="relative overflow-hidden rounded-2xl border p-5 cursor-default transition-all duration-300 shadow-[var(--admin-shadow-card)]"
          style={{
            borderColor: card.border,
            backgroundColor: 'var(--admin-kpi-base)',
            backgroundImage: card.gradient,
          }}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-20 pointer-events-none bg-white" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: card.iconBg }}
              >
                <Icon size={24} className="text-white" />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  card.trendUp ? 'text-[#10B981]' : 'text-red-400'
                }`}
                style={{ background: 'var(--admin-stat-pill-bg)' }}
              >
                {card.trend}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                {card.title}
              </p>
              <h3 className="text-3xl font-extrabold admin-text-primary tracking-tight">
                {card.value}
              </h3>
            </div>
          </div>
        </motion.div>
      );
    })}
    </div>
  </>
  );
};

export default DashboardKpiRow;
