import React from 'react';
import { motion } from 'framer-motion';
import { NOTIFICATION_CATEGORIES } from '../constants';
import SettingsToggle from '../SettingsToggle';

const NotificationsSection = ({ notifPrefs, onToggle, accent }) => (
  <div className="space-y-4">
    <p className="text-sm admin-text-secondary mb-2">
      Choose which alerts you receive across email and in-app channels.
    </p>
    {NOTIFICATION_CATEGORIES.map((cat, i) => {
      const Icon = cat.icon;
      return (
        <motion.div
          key={cat.key}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          className="flex items-center gap-4 rounded-2xl border p-4 transition-all"
          style={{
            borderColor: `rgba(${cat.rgb},0.35)`,
            background: `linear-gradient(135deg, rgba(${cat.rgb},0.12), transparent)`,
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: cat.color }}
          >
            <Icon size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold admin-text-primary">{cat.label}</p>
            <p className="text-xs admin-text-muted mt-0.5">{cat.description}</p>
          </div>
          <SettingsToggle
            value={notifPrefs[cat.key]}
            onChange={(v) => onToggle(cat.key, v)}
            accent={cat.color}
          />
        </motion.div>
      );
    })}
  </div>
);

export default NotificationsSection;
