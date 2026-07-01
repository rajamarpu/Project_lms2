import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdLibraryBooks,
  MdStar,
  MdEmojiEvents,
  MdWorkspacePremium,
} from 'react-icons/md';
import { apiFetch } from '../../../api/config';

const ICONS = {
  course: MdLibraryBooks,
  teacher: MdStar,
  student: MdEmojiEvents,
  certificate: MdWorkspacePremium,
};

const DashboardPlatformHighlights = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    apiFetch('/admin/dashboard/top-performers')
      .then(res => setData(res.data))
      .catch(err => console.error('Platform highlights fetch failed:', err));
  }, []);

  const highlights = data ? [
    {
      label: 'Top Course',
      value: data.topCourse?.name || '---',
      sub: `${data.topCourse?.enrollments || 0} enrollments`,
      accent: '#3B82F6',
      iconKey: 'course',
    },
    {
      label: 'Top Teacher',
      value: data.topInstructor?.name || '---',
      sub: `${data.topInstructor?.students || 0} learners`,
      accent: '#10B981',
      iconKey: 'teacher',
    },
    {
      label: 'Top Student',
      value: data.topStudent?.name || '---',
      sub: `${data.topStudent?.progress || 0}% progress`,
      accent: '#8B5CF6',
      iconKey: 'student',
    },
    {
      label: 'Total Certs',
      value: 'Pending DB',
      sub: `0 issued`,
      accent: '#F59E0B',
      iconKey: 'certificate',
    }
  ] : [
    { label: 'Top Course', value: 'Loading...', sub: '', accent: '#3B82F6', iconKey: 'course' },
    { label: 'Top Teacher', value: 'Loading...', sub: '', accent: '#10B981', iconKey: 'teacher' },
    { label: 'Top Student', value: 'Loading...', sub: '', accent: '#8B5CF6', iconKey: 'student' },
    { label: 'Total Certs', value: 'Loading...', sub: '', accent: '#F59E0B', iconKey: 'certificate' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {highlights.map((item, index) => {
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
