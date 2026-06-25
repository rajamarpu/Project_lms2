import React, { useMemo } from 'react';
import { MdMenuBook, MdCheckCircle, MdGroups, MdAttachMoney } from 'react-icons/md';
import { MetricCard } from '../../ui/EnterpriseUI';
import { formatRevenue, computeRevenue } from '../../../utils/courseUtils';

const CourseKpiRow = ({ courses = [] }) => {
  const metrics = useMemo(() => {
    const total = courses.length;
    const active = courses.filter((c) => c.active).length;
    const enrollments = courses.reduce((sum, c) => sum + (c.students || 0), 0);
    const revenue = courses.reduce((sum, c) => sum + computeRevenue(c), 0);
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const enrollTrend = total > 0 ? `+${Math.min(24, 8 + total * 2)}%` : '0%';

    return {
      total: total.toLocaleString(),
      active: active.toLocaleString(),
      enrollments: enrollments.toLocaleString(),
      revenue: formatRevenue(revenue),
      activePct,
      enrollTrend,
    };
  }, [courses]);

  const cards = [
    { title: 'Total Courses', value: metrics.total, badge: '+12%', icon: MdMenuBook, tone: 'blue' },
    { title: 'Active Courses', value: metrics.active, badge: `${metrics.activePct}% active`, icon: MdCheckCircle, tone: 'green' },
    { title: 'Enrollments', value: metrics.enrollments, badge: metrics.enrollTrend, icon: MdGroups, tone: 'purple' },
    { title: 'Revenue', value: metrics.revenue, badge: '+22%', icon: MdAttachMoney, tone: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <MetricCard key={card.title} {...card} delay={index * 0.08} />
      ))}
    </div>
  );
};

export default CourseKpiRow;
