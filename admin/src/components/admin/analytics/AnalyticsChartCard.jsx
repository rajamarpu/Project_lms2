import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsChartCard = ({
  title,
  subtitle,
  icon: Icon,
  iconGradient = 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  glowColor = '#3B82F6',
  children,
  delay = 0,
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{
      y: -4,
      boxShadow: '0 20px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(59,130,246,0.15)',
    }}
    className="relative overflow-hidden rounded-2xl border p-4 md:p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] transition-all duration-300"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <div
      className="absolute -top-16 -right-8 w-40 h-40 rounded-full pointer-events-none opacity-20 blur-[60px]"
      style={{ background: glowColor }}
    />

    <div className="relative z-10 flex items-start gap-3 mb-3">
      {Icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: iconGradient }}
        >
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="text-base font-bold admin-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-[11px] admin-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>

    <div className="relative z-10">{children}</div>
  </motion.section>
);

export default AnalyticsChartCard;
