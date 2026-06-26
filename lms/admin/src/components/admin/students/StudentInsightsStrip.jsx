import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdEmojiEvents,
  MdWarning,
  MdSchool,
  MdTimeline,
} from 'react-icons/md';

const INSIGHTS = [
  {
    key: 'topPerformer',
    label: 'Top Performer',
    icon: MdEmojiEvents,
    accent: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  {
    key: 'atRisk',
    label: 'Students At Risk',
    icon: MdWarning,
    accent: '#F59E0B',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(248, 113, 113, 0.35)',
  },
  {
    key: 'bestCourse',
    label: 'Best Course',
    icon: MdSchool,
    accent: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  {
    key: 'avgCompletion',
    label: 'Average Completion',
    icon: MdTimeline,
    accent: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.35)',
  },
];

const StudentInsightsStrip = ({ students }) => {
  const insights = useMemo(() => {
    if (!students?.length) {
      return {
        topPerformer: '—',
        atRisk: '0',
        bestCourse: '—',
        avgCompletion: '0%',
      };
    }

    const sorted = [...students].sort((a, b) => (b.progress || 0) - (a.progress || 0));
    const top = sorted[0];
    const atRiskCount = students.filter(
      (s) => s.status === 'Pending' || (s.progress ?? 0) < 25
    ).length;

    const courseCounts = students.reduce((acc, s) => {
      const c = s.enrolledCourse || 'Unknown';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const bestCourse =
      Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const avg =
      students.reduce((sum, s) => sum + (s.progress ?? 0), 0) / students.length;

    return {
      topPerformer: top?.name || '—',
      atRisk: String(atRiskCount),
      bestCourse,
      avgCompletion: `${Math.round(avg)}%`,
    };
  }, [students]);

  const values = {
    topPerformer: insights.topPerformer,
    atRisk: insights.atRisk,
    bestCourse: insights.bestCourse,
    avgCompletion: insights.avgCompletion,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {INSIGHTS.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl p-4 border flex items-center gap-4 transition-shadow bg-[var(--admin-surface-raised)] shadow-[var(--admin-shadow-card)]"
            style={{ borderColor: item.border }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: item.bg }}
            >
              <Icon size={24} style={{ color: item.accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-0.5">
                {item.label}
              </p>
              <p className="text-sm font-bold admin-text-primary truncate" title={values[item.key]}>
                {values[item.key]}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StudentInsightsStrip;
