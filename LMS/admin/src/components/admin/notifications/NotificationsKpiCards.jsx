import React from 'react';
import { motion } from 'framer-motion';
import {
  MdNotifications,
  MdNotificationsActive,
  MdWarning,
  MdPushPin,
} from 'react-icons/md';

const NotificationsKpiCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Notifications',
      value: stats.total,
      trend: '+6.4%',
      trendUp: true,
      icon: MdNotifications,
      gradient:
        'linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(6,182,212,0.2) 100%)',
      iconBg: '#3B82F6',
      glow: 'rgba(59,130,246,0.35)',
      border: 'rgba(59,130,246,0.4)',
    },
    {
      title: 'Unread',
      value: stats.unread,
      trend: stats.unread > 0 ? 'Needs action' : 'Inbox clear',
      trendUp: stats.unread === 0,
      icon: MdNotificationsActive,
      gradient:
        'linear-gradient(135deg, rgba(239,68,68,0.42) 0%, rgba(249,115,22,0.15) 100%)',
      iconBg: '#EF4444',
      glow: 'rgba(239,68,68,0.35)',
      border: 'rgba(239,68,68,0.4)',
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      trend: 'Critical + High',
      trendUp: null,
      icon: MdWarning,
      gradient:
        'linear-gradient(135deg, rgba(249,115,22,0.42) 0%, rgba(239,68,68,0.12) 100%)',
      iconBg: '#F97316',
      glow: 'rgba(249,115,22,0.35)',
      border: 'rgba(249,115,22,0.4)',
    },
    {
      title: 'Pinned',
      value: stats.pinned,
      trend: '+2 this week',
      trendUp: true,
      icon: MdPushPin,
      gradient:
        'linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(59,130,246,0.15) 100%)',
      iconBg: '#8B5CF6',
      glow: 'rgba(139,92,246,0.35)',
      border: 'rgba(139,92,246,0.4)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{
              y: -8,
              boxShadow: `0 20px 50px ${card.glow}`,
            }}
            className="relative overflow-hidden rounded-2xl border p-5 cursor-default transition-all duration-300 shadow-[var(--admin-shadow-card)]"
            style={{
              borderColor: card.border,
              backgroundColor: 'var(--admin-kpi-base)',
              backgroundImage: card.gradient,
            }}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-20 pointer-events-none bg-white" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: card.iconBg }}
                >
                  <Icon size={22} className="text-white" />
                </div>
                {card.trendUp !== null && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      card.trendUp ? 'text-[#10B981]' : 'text-red-400'
                    }`}
                    style={{ background: 'var(--admin-stat-pill-bg)' }}
                  >
                    {card.trend}
                  </span>
                )}
                {card.trendUp === null && (
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg admin-text-muted"
                    style={{ background: 'var(--admin-stat-pill-bg)' }}
                  >
                    {card.trend}
                  </span>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                  {card.title}
                </p>
                <h3 className="text-3xl font-extrabold admin-text-primary tracking-tight tabular-nums">
                  {card.value}
                </h3>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NotificationsKpiCards;
