import React from 'react';
import { MdNotifications, MdNotificationsActive, MdWarning, MdPushPin } from 'react-icons/md';
import { MetricCard } from '../../ui/EnterpriseUI';

const NotificationsKpiCards = ({ stats }) => {
  const cards = [
    { title: 'Total Notifications', value: stats.total, badge: '+6.4%', icon: MdNotifications, tone: 'blue' },
    { title: 'Unread', value: stats.unread, badge: stats.unread > 0 ? 'Needs action' : 'Inbox clear', icon: MdNotificationsActive, tone: 'rose' },
    { title: 'High Priority', value: stats.highPriority, badge: 'Critical + High', icon: MdWarning, tone: 'orange' },
    { title: 'Pinned', value: stats.pinned, badge: '+2 this week', icon: MdPushPin, tone: 'purple' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <MetricCard key={card.title} {...card} delay={index * 0.08} />
      ))}
    </div>
  );
};

export default NotificationsKpiCards;
