import React from 'react';
import { MdPerson, MdShield, MdDevices, MdNotificationsActive } from 'react-icons/md';
import { MetricCard } from '../../ui/EnterpriseUI';

const SettingsKpiRow = ({ profileCompletion, securityScore, activeSessions, notificationLabel }) => {
  const cards = [
    {
      title: 'Profile Completion',
      value: `${profileCompletion}%`,
      badge: 'On track',
      icon: MdPerson,
      tone: 'green',
      progress: profileCompletion,
      progressColor: '#10B981',
    },
    {
      title: 'Security Score',
      value: `${securityScore}%`,
      badge: securityScore >= 90 ? 'Excellent' : 'Good',
      icon: MdShield,
      tone: 'orange',
      progress: securityScore,
      progressColor: '#F97316',
    },
    {
      title: 'Active Sessions',
      value: String(activeSessions),
      badge: 'Devices',
      icon: MdDevices,
      tone: 'blue',
    },
    {
      title: 'Notification Status',
      value: notificationLabel,
      badge: 'Preferences',
      icon: MdNotificationsActive,
      tone: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <MetricCard key={card.title} {...card} delay={index * 0.08} />
      ))}
    </div>
  );
};

export default SettingsKpiRow;
