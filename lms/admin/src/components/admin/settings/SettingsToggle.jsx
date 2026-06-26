import React from 'react';
import { motion } from 'framer-motion';

const SettingsToggle = ({ value, onChange, accent = '#3B82F6' }) => (
  <motion.button
    type="button"
    role="switch"
    aria-checked={value}
    onClick={() => onChange(!value)}
    whileTap={{ scale: 0.96 }}
    className="relative w-12 h-7 rounded-full flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    style={{
      background: value
        ? `linear-gradient(135deg, ${accent}, #8B5CF6)`
        : 'var(--admin-progress-track)',
      boxShadow: value ? `0 0 16px ${accent}66` : 'none',
      border: `1px solid ${value ? 'transparent' : 'var(--admin-border)'}`,
    }}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
      style={{ left: value ? 'calc(100% - 1.35rem)' : '0.2rem' }}
    />
  </motion.button>
);

export default SettingsToggle;
