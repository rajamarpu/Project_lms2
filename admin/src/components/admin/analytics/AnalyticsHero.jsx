import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdAutoGraph,
  MdFileDownload,
  MdAssessment,
  MdOutlineCalendarToday,
  MdTrendingUp,
  MdAttachMoney,
} from 'react-icons/md';
import { DATE_RANGE_OPTIONS } from './analyticsData';

const AnalyticsHero = ({
  revenueGrowth,
  studentGrowth,
  dateRange,
  onDateRangeChange,
  onExport,
  onGenerateReport,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[#3B82F6]/25 shadow-[0_24px_80px_rgba(59,130,246,0.14)]"
      style={{ background: 'var(--admin-hero-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none backdrop-blur-sm"
        style={{ background: 'var(--admin-hero-overlay)' }}
      />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#8B5CF6]/22 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#3B82F6]/22 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-[26%] w-44 h-44 rounded-full bg-[#06B6D4]/12 blur-[70px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
          <div
            className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-[0_0_48px_rgba(59,130,246,0.45)]"
            style={{
              background: 'linear-gradient(145deg, #3B82F6 0%, #8B5CF6 55%, #06B6D4 100%)',
            }}
          >
            <MdAutoGraph size={36} className="text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight admin-text-primary mb-2">
              Analytics Overview
            </h1>
            <p className="admin-text-secondary text-sm md:text-base max-w-xl mb-6">
              Stripe-style insights across revenue, enrollment, engagement, and learner satisfaction.
            </p>

            <div className="flex flex-wrap gap-4">
              <div
                className="rounded-2xl px-5 py-3 border border-[#F59E0B]/35 min-w-[150px] backdrop-blur-sm"
                style={{ background: 'var(--admin-hero-stat-bg)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1 flex items-center gap-1">
                  <MdAttachMoney size={14} className="text-[#F59E0B]" />
                  Revenue Growth
                </p>
                <p className="text-2xl font-extrabold text-[#F59E0B]">{revenueGrowth}</p>
              </div>
              <div
                className="rounded-2xl px-5 py-3 border border-[#10B981]/35 min-w-[150px] backdrop-blur-sm"
                style={{ background: 'var(--admin-hero-stat-bg)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1 flex items-center gap-1">
                  <MdTrendingUp size={14} className="text-[#10B981]" />
                  Student Growth
                </p>
                <p className="text-2xl font-extrabold text-[#10B981]">{studentGrowth}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
          <div className="relative" ref={dropdownRef}>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] w-full sm:w-auto bg-[var(--admin-surface-raised)] hover:border-[#3B82F6]/50 transition-all"
            >
              <MdOutlineCalendarToday size={18} className="text-[#3B82F6]" />
              {dateRange}
            </motion.button>
            {open && (
              <div
                className="absolute z-50 right-0 mt-2 w-44 rounded-xl border shadow-xl overflow-hidden"
                style={{
                  background: 'var(--admin-surface-hover)',
                  borderColor: 'var(--admin-border)',
                }}
              >
                {DATE_RANGE_OPTIONS.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      onDateRangeChange(range);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium admin-text-secondary hover:admin-text-primary hover:bg-[var(--admin-surface-raised)] transition-colors border-b last:border-b-0"
                    style={{ borderColor: 'var(--admin-border-subtle)' }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] transition-all hover:border-[#3B82F6]/50 bg-[var(--admin-surface-raised)]"
          >
            <MdFileDownload size={20} className="text-[#3B82F6]" />
            Export
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateReport}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            }}
          >
            <MdAssessment size={20} />
            Generate Report
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default AnalyticsHero;
