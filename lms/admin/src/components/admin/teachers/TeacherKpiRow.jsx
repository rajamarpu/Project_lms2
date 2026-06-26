import React, { useMemo } from 'react';
import { MdSchool, MdCheckCircle, MdGroups, MdAttachMoney } from 'react-icons/md';
import { MetricCard } from '../../ui/EnterpriseUI';
import { formatRevenue } from '../../../utils/teacherUtils';

const TeacherKpiRow = ({ teachers = [] }) => {
  const metrics = useMemo(() => {
    const total = teachers.length;
    const active = teachers.filter((t) => t.enabled).length;
    const totalStudents = teachers.reduce((sum, t) => sum + (t.students || 0), 0);
    const totalRevenue = teachers.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    return {
      total: total.toLocaleString(),
      active: active.toLocaleString(),
      students: totalStudents.toLocaleString(),
      revenue: formatRevenue(totalRevenue),
      activePct,
    };
  }, [teachers]);

  const cards = [
    { title: 'Total Teachers', value: metrics.total, badge: '+25%', icon: MdSchool, tone: 'purple' },
    { title: 'Active Teachers', value: metrics.active, badge: `${metrics.activePct}% active`, icon: MdCheckCircle, tone: 'green' },
    { title: 'Total Students', value: metrics.students, badge: '+18%', icon: MdGroups, tone: 'blue' },
    { title: 'Revenue Generated', value: metrics.revenue, badge: '+32%', icon: MdAttachMoney, tone: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <MetricCard key={card.title} {...card} delay={index * 0.08} />
      ))}
    </div>
  );
};

export default TeacherKpiRow;
