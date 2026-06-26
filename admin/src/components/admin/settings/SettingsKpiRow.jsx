import { motion } from 'framer-motion';
import {
  MdPerson,
  MdShield,
  MdDevices,
  MdNotificationsActive,
} from 'react-icons/md';

const SettingsKpiRow = ({
  profileCompletion,
  securityScore,
  activeSessions,
  notificationLabel,
}) => {
  const cards = [
    {
      title: 'Profile Completion',
      value: `${profileCompletion}%`,
      sub: 'On track',
      icon: MdPerson,
      iconBg: '#10B981',
      gradient:
        'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(20,184,166,0.18) 100%)',
      border: 'rgba(16,185,129,0.4)',
      glow: 'rgba(16,185,129,0.35)',
      progress: profileCompletion,
      progressColor: '#10B981',
    },
    {
      title: 'Security Score',
      value: `${securityScore}%`,
      sub: securityScore >= 90 ? 'Excellent' : 'Good',
      icon: MdShield,
      iconBg: '#F97316',
      gradient:
        'linear-gradient(135deg, rgba(239,68,68,0.42) 0%, rgba(249,115,22,0.2) 100%)',
      border: 'rgba(249,115,22,0.45)',
      glow: 'rgba(239,68,68,0.35)',
      progress: securityScore,
      progressColor: '#F97316',
    },
    {
      title: 'Active Sessions',
      value: String(activeSessions),
      sub: 'Devices',
      icon: MdDevices,
      iconBg: '#3B82F6',
      gradient:
        'linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(6,182,212,0.15) 100%)',
      border: 'rgba(59,130,246,0.4)',
      glow: 'rgba(59,130,246,0.35)',
      progress: null,
    },
    {
      title: 'Notification Status',
      value: notificationLabel,
      sub: 'Preferences',
      icon: MdNotificationsActive,
      iconBg: '#8B5CF6',
      gradient:
        'linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(59,130,246,0.12) 100%)',
      border: 'rgba(139,92,246,0.4)',
      glow: 'rgba(139,92,246,0.35)',
      progress: null,
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
            whileHover={{ y: -8, boxShadow: `0 20px 50px ${card.glow}` }}
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
                <span
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg admin-text-muted"
                  style={{ background: 'var(--admin-stat-pill-bg)' }}
                >
                  {card.sub}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold admin-text-primary tracking-tight">
                  {card.value}
                </h3>
              </div>
              {card.progress != null && (
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--admin-progress-track)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${card.progressColor}, ${card.iconBg})`,
                      boxShadow: `0 0 12px ${card.glow}`,
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SettingsKpiRow;
