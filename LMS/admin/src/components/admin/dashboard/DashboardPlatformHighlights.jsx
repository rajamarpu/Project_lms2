import React from 'react';
import { motion } from 'framer-motion';
import {
  MdLibraryBooks,
  MdStar,
  MdEmojiEvents,
  MdWorkspacePremium,
} from 'react-icons/md';
import { useAdminStats, useCoursesQuery, useTeachersQuery } from '../../../api/reactQuery';

const ICONS = {
  course: MdLibraryBooks,
  teacher: MdStar,
  student: MdEmojiEvents,
  certificate: MdWorkspacePremium,
};

const DashboardPlatformHighlights = () => {
  const { data: stats, isLoading: loading } = useAdminStats();
  const { data: coursesRes } = useCoursesQuery();
  const { data: teachersRes } = useTeachersQuery();

  const courses = coursesRes?.data || [];
  const teachers = teachersRes?.data || [];

  const topCourse = courses.sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0))[0];
  const topTeacher = teachers[0] || (topCourse?.instructor || null);

  const items = [
    {
      label: 'Top Course',
      value: topCourse?.title || '—',
      sub: `${topCourse?._count?.enrollments ?? 0} enrollments`,
      accent: '#3B82F6',
      iconKey: 'course',
    },
    {
      label: 'Top Teacher',
      value: topTeacher?.name || '—',
      sub: `${topTeacher?.students || ''}`,
      accent: '#10B981',
      iconKey: 'teacher',
    },
    {
      label: 'Most Active Student',
      value: stats?.data?.recentUsers?.[0]?.name || '—',
      sub: '',
      accent: '#8B5CF6',
      iconKey: 'student',
    },
    {
      label: 'Certificates Today',
      value: '—',
      sub: `${stats?.data?.pendingCourses ?? 0} pending`,
      accent: '#06B6D4',
      iconKey: 'certificate',
    },
  ];

  if (loading) return <div className="h-24 animate-pulse rounded-xl bg-[var(--admin-surface-raised)]" />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, index) => {
        const Icon = ICONS[item.iconKey];
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, boxShadow: `0 12px 28px ${item.accent}33` }}
            className="rounded-xl px-3 py-3 border transition-all duration-300 bg-[var(--admin-surface-raised)] shadow-[var(--admin-shadow-card)] flex items-center gap-3"
            style={{ borderColor: `${item.accent}35` }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md"
              style={{ background: item.accent }}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-wider admin-text-secondary leading-none mb-1">
                {item.label}
              </p>
              <p className="text-xs font-bold admin-text-primary truncate" title={item.value}>
                {item.value}
              </p>
              <p className="text-[10px] admin-text-muted truncate">{item.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardPlatformHighlights;
