import React, { useMemo } from 'react';
import { MdPeople, MdCheckCircle, MdShowChart, MdEmojiEvents } from 'react-icons/md';
import { MetricCard } from '../../ui/EnterpriseUI';

const StudentAnalyticsCards = ({ students = [] }) => {
  const metrics = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const avgProgress = total > 0 ? students.reduce((sum, s) => sum + (s.progress ?? 0), 0) / total : 0;
    const certificates = students.reduce((sum, s) => sum + (s.certificates ?? Math.floor((s.progress ?? 0) / 25)), 0);

    return {
      total: total.toLocaleString(),
      active: active.toLocaleString(),
      completionRate: `${Math.round(avgProgress)}%`,
      certificates: certificates.toLocaleString(),
    };
  }, [students]);

  const cards = [
    { title: 'Total Students', value: metrics.total, badge: '+8.2%', icon: MdPeople, tone: 'blue' },
    { title: 'Active Students', value: metrics.active, badge: '+5.4%', icon: MdCheckCircle, tone: 'green' },
    { title: 'Completion Rate', value: metrics.completionRate, badge: '+3.1%', icon: MdShowChart, tone: 'purple' },
    { title: 'Certificates Earned', value: metrics.certificates, badge: '+11.8%', icon: MdEmojiEvents, tone: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <MetricCard key={card.title} {...card} delay={index * 0.08} />
      ))}
    </div>
  );
};

export default StudentAnalyticsCards;
