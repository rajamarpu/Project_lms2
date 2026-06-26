import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdNotifications,
  MdDoneAll,
  MdSettings,
  MdDeleteSweep,
  MdTrendingUp,
} from 'react-icons/md';

const NotificationsHero = ({
  unreadCount,
  activitySummary,
  onMarkAllRead,
  onClearAll,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[#F97316]/25 shadow-[0_24px_80px_rgba(249,115,22,0.14)]"
      style={{ background: 'var(--admin-hero-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.38) 0%, rgba(239,68,68,0.28) 42%, rgba(139,92,246,0.22) 100%)',
        }}
      />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#EF4444]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#F97316]/25 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-[24%] w-44 h-44 rounded-full bg-[#8B5CF6]/18 blur-[70px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
          <div
            className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-[0_0_48px_rgba(249,115,22,0.45)]"
            style={{
              background:
                'linear-gradient(145deg, #F97316 0%, #EF4444 48%, #8B5CF6 100%)',
            }}
          >
            <MdNotifications size={36} className="text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight admin-text-primary mb-2">
              Notification Center
            </h1>
            <p className="admin-text-secondary text-sm md:text-base max-w-xl mb-6">
              {activitySummary}
            </p>

            <div
              className="inline-flex rounded-2xl px-5 py-3 border border-[#EF4444]/35 min-w-[160px] backdrop-blur-sm"
              style={{ background: 'var(--admin-hero-stat-bg)' }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1 flex items-center gap-1">
                  <MdTrendingUp size={14} className="text-[#EF4444]" />
                  Unread Alerts
                </p>
                <p className="text-2xl font-extrabold text-[#EF4444] tabular-nums">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(249,115,22,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onMarkAllRead}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EF4444 55%, #8B5CF6 100%)',
            }}
          >
            <MdDoneAll size={20} />
            Mark All Read
          </motion.button>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/dashboard/admin/settings"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] transition-all hover:border-[#8B5CF6]/50 bg-[var(--admin-surface-raised)] w-full sm:w-auto"
            >
              <MdSettings size={20} className="text-[#8B5CF6]" />
              Settings
            </Link>
          </motion.div>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClearAll}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] transition-all hover:border-[#EF4444]/50 bg-[var(--admin-surface-raised)]"
          >
            <MdDeleteSweep size={20} className="text-[#EF4444]" />
            Clear Notifications
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default NotificationsHero;
