import React from 'react';
import { motion } from 'framer-motion';
import {
  MdAdd,
  MdFileDownload,
  MdAssessment,
  MdGroups,
  MdTrendingUp,
} from 'react-icons/md';

const StudentsHero = ({
  totalCount,
  monthlyGrowth,
  onAddStudent,
  onExport,
  onGenerateReport,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[#3B82F6]/20 shadow-[0_24px_80px_rgba(59,130,246,0.12)] bg-[var(--admin-hero-bg)]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--admin-hero-overlay)' }}
      />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#8B5CF6]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#3B82F6]/20 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-[28%] w-40 h-40 rounded-full bg-[#06B6D4]/10 blur-[60px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
          <div
            className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.35)]"
            style={{
              background: 'linear-gradient(145deg, #3B82F6 0%, #8B5CF6 100%)',
            }}
          >
            <MdGroups size={36} className="text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight admin-text-primary mb-2">
              Students
            </h1>
            <p className="admin-text-secondary text-sm md:text-base max-w-xl mb-6">
              Manage learners, track progress, and grow your academy with executive-grade insights.
            </p>

            <div className="flex flex-wrap gap-4">
              <div
                className="rounded-2xl px-5 py-3 border border-[#3B82F6]/30 min-w-[140px]"
                style={{ background: 'var(--admin-hero-stat-bg)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-extrabold admin-text-primary">{totalCount}</p>
              </div>
              <div
                className="rounded-2xl px-5 py-3 border border-[#10B981]/30 min-w-[140px]"
                style={{ background: 'var(--admin-hero-stat-bg)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1 flex items-center gap-1">
                  <MdTrendingUp size={14} className="text-[#10B981]" />
                  Monthly Growth
                </p>
                <p className="text-2xl font-extrabold text-[#10B981]">{monthlyGrowth}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddStudent}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10 transition-all"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            }}
          >
            <MdAdd size={22} />
            Add Student
          </motion.button>
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
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateReport}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] transition-all hover:border-[#8B5CF6]/50 bg-[var(--admin-surface-raised)]"
          >
            <MdAssessment size={20} className="text-[#8B5CF6]" />
            Generate Report
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default StudentsHero;
