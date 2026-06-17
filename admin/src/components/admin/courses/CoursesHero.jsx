import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdAdd,
  MdFileDownload,
  MdAutoGraph,
  MdMenuBook,
  MdAttachMoney,
} from 'react-icons/md';
import { formatRevenue } from '../../../utils/courseUtils';

const CoursesHero = ({
  totalCount,
  totalRevenue,
  activeCount,
  onCreateCourse,
  onExport,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[#06B6D4]/25 shadow-[0_24px_80px_rgba(6,182,212,0.15)]"
      style={{ background: 'var(--admin-hero-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(59,130,246,0.25) 45%, rgba(139,92,246,0.1) 100%)',
        }}
      />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#06B6D4]/25 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#3B82F6]/20 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-[22%] w-48 h-48 rounded-full bg-[#3B82F6]/15 blur-[70px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
          <div
            className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.45)]"
            style={{
              background: 'linear-gradient(145deg, #06B6D4 0%, #3B82F6 100%)',
            }}
          >
            <MdMenuBook size={36} className="text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  borderColor: 'rgba(16,185,129,0.35)',
                  color: '#10B981',
                }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5 align-middle animate-pulse" />
                {activeCount} Active Courses
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight admin-text-primary mb-2">
              Courses
            </h1>
            <p className="admin-text-secondary text-sm md:text-base max-w-xl mb-6">
              Premium course management — create learning paths, track enrollments, and
              optimize revenue across your catalog.
            </p>

            <div className="flex flex-wrap gap-4">
              <div
                className="rounded-2xl px-5 py-3 border border-[#3B82F6]/35 min-w-[140px] backdrop-blur-sm"
                style={{ background: 'var(--admin-hero-stat-bg)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                  Total Courses
                </p>
                <p className="text-2xl font-extrabold admin-text-primary">{totalCount}</p>
              </div>
              <div
                className="rounded-2xl px-5 py-3 border border-[#F59E0B]/35 min-w-[140px] backdrop-blur-sm"
                style={{ background: 'var(--admin-hero-stat-bg)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1 flex items-center gap-1">
                  <MdAttachMoney size={14} className="text-[#F59E0B]" />
                  Revenue Summary
                </p>
                <p className="text-2xl font-extrabold text-[#F59E0B]">{formatRevenue(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(6,182,212,0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateCourse}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            }}
          >
            <MdAdd size={22} />
            Create Course
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] transition-all hover:border-[#06B6D4]/50 bg-[var(--admin-surface-raised)]"
          >
            <MdFileDownload size={20} className="text-[#06B6D4]" />
            Export
          </motion.button>
          <Link to="/dashboard/admin/analytics">
            <motion.span
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] transition-all hover:border-[#3B82F6]/50 bg-[var(--admin-surface-raised)] w-full sm:w-auto"
            >
              <MdAutoGraph size={20} className="text-[#3B82F6]" />
              Analytics
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default CoursesHero;
