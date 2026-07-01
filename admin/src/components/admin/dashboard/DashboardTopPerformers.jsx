import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdLibraryBooks, MdSchool, MdEmojiEvents, MdTrendingUp, MdStar, MdLocalFireDepartment } from 'react-icons/md';
import { apiFetch } from '../../../api/config';

const PERFORMERS_CONFIG = [
  { key: 'topCourse', label: 'Top Course', iconKey: 'course', accent: '#3B82F6', glow: 'rgba(59,130,246,0.3)', Icon: MdLibraryBooks },
  { key: 'topInstructor', label: 'Top Teacher', iconKey: 'teacher', accent: '#8B5CF6', glow: 'rgba(139,92,246,0.3)', Icon: MdSchool },
  { key: 'topStudent', label: 'Top Student', iconKey: 'student', accent: '#10B981', glow: 'rgba(16,185,129,0.3)', Icon: MdEmojiEvents },
];

const DashboardTopPerformers = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/dashboard/top-performers')
      .then(res => setData(res.data))
      .catch(err => console.error('Top performers fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const getPerformerInfo = (cfg) => {
    if (!data) return { name: '---', sub: '' };
    const item = data[cfg.key];
    if (!item) return { name: 'No data yet', sub: '' };
    if (cfg.key === 'topCourse') return { name: item.name, sub: `${item.enrollments} enrollments \u00b7 \u2605 ${item.rating}` };
    if (cfg.key === 'topInstructor') return { name: item.name, sub: `${item.students} learners \u00b7 \u2605 ${item.rating}` };
    if (cfg.key === 'topStudent') return { name: item.name, sub: `${item.progress}% in ${item.course}` };
    return { name: '---', sub: '' };
  };

  return (
    <section className="rounded-2xl border p-3 md:p-4 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base font-bold admin-text-primary">Top Performers</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wider admin-text-muted">Leaderboard</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PERFORMERS_CONFIG.map((cfg, index) => {
          const { name, sub } = getPerformerInfo(cfg);
          return (
            <motion.article
              key={cfg.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -6, boxShadow: `0 12px 32px ${cfg.glow}` }}
              className="relative overflow-hidden rounded-xl border p-3 transition-all duration-300 cursor-default"
              style={{ borderColor: `${cfg.accent}40`, background: 'var(--admin-surface-raised)' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded shrink-0" style={{ background: cfg.accent }}>#1</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide admin-text-secondary truncate">{cfg.label}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md" style={{ background: cfg.accent }}>
                  <cfg.Icon size={16} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  {loading
                    ? <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--admin-border)' }} />
                    : <p className="text-sm font-bold admin-text-primary truncate leading-snug" title={name}>{name}</p>}
                  {loading
                    ? <div className="h-3 w-16 rounded animate-pulse mt-1" style={{ background: 'var(--admin-border)' }} />
                    : <p className="text-[11px] admin-text-muted mt-0.5">{sub}</p>}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardTopPerformers;
